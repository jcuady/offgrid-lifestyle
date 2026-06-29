/** PSGC (official PH divisions) + Photon/Nominatim geocoding for checkout address search & map pins. */

type PhModule = typeof import("ph-addresses-locations");

let modulePromise: Promise<PhModule> | null = null;

export function loadPhilippinesLocations(): Promise<PhModule> {
  if (!modulePromise) {
    modulePromise = import("ph-addresses-locations");
  }
  return modulePromise;
}

type CityRow = { code: string; name: string; provinceCode: string; zipCode?: string };

export async function getCityZipCode(cityCode: string): Promise<string | null> {
  const cities = (await import("ph-addresses-locations/data/cities.json")).default as CityRow[];
  const row = cities.find((city) => city.code === cityCode);
  const zip = row?.zipCode?.trim();
  return zip || null;
}

/** Philippines approximate bounding box (WGS84). */
export const PH_BOUNDS = {
  minLat: 4.5,
  maxLat: 21.5,
  minLon: 116.0,
  maxLon: 127.0,
  centerLat: 12.8797,
  centerLon: 121.774,
} as const;

/** NCR has no province row in ph-addresses-locations — use a virtual Metro Manila province. */
export const NCR_REGION_CODE = "1300000000";
export const NCR_PROVINCE_CODE = "1300000000";
export const NCR_PROVINCE_NAME = "Metro Manila (NCR)";

export function isNcrRegion(regionCode: string): boolean {
  return regionCode === NCR_REGION_CODE;
}

export interface PhLocation {
  code: string;
  name: string;
}

export async function getProvincesForRegion(regionCode: string): Promise<PhLocation[]> {
  if (!regionCode) return [];
  if (isNcrRegion(regionCode)) {
    return [{ code: NCR_PROVINCE_CODE, name: NCR_PROVINCE_NAME }];
  }
  const mod = await loadPhilippinesLocations();
  return mod.getProvinces(regionCode);
}

export async function getCitiesForProvince(provinceCode: string, regionCode: string): Promise<PhLocation[]> {
  if (!regionCode) return [];
  const mod = await loadPhilippinesLocations();
  if (isNcrRegion(regionCode) || provinceCode === NCR_PROVINCE_CODE) {
    const cities = (await import("ph-addresses-locations/data/cities.json")).default as CityRow[];
    return cities
      .filter((city) => city.code.startsWith("138"))
      .map((city) => ({ code: city.code, name: city.name.trim() }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  if (!provinceCode) return [];
  return mod.getCities(provinceCode).map((city) => ({ code: city.code, name: city.name.trim() }));
}

/** Fill virtual NCR province when region is Metro Manila. */
export function ensureNcrShippingFields<T extends { regionCode: string; province: string; provinceCode: string }>(
  info: T,
): T {
  if (!isNcrRegion(info.regionCode)) return info;
  return {
    ...info,
    province: info.province || NCR_PROVINCE_NAME,
    provinceCode: info.provinceCode || NCR_PROVINCE_CODE,
  };
}

export function isNcrCityCode(cityCode: string): boolean {
  return cityCode.startsWith("138");
}

function resolvePsgcProvince(
  regionCode: string,
  province: { code: string; name: string } | null,
): { provinceCode: string; province: string } {
  if (isNcrRegion(regionCode) || isNcrCityCode(province?.code ?? "")) {
    return { provinceCode: NCR_PROVINCE_CODE, province: NCR_PROVINCE_NAME };
  }
  return { provinceCode: province?.code ?? "", province: province?.name ?? "" };
}

function buildPsgcMatch(parts: {
  region: { code: string; name: string };
  province: { code: string; name: string } | null;
  city: { code: string; name: string };
  barangayCode: string;
  barangay: string;
  zip: string;
}): PsgcMatch {
  const region = isNcrCityCode(parts.city.code)
    ? { code: NCR_REGION_CODE, name: parts.region.name }
    : parts.region;
  const provinceFields = resolvePsgcProvince(region.code, parts.province);
  return {
    regionCode: region.code,
    region: region.name,
    ...provinceFields,
    cityCode: parts.city.code,
    city: parts.city.name.trim(),
    barangayCode: parts.barangayCode,
    barangay: parts.barangay.trim(),
    zip: parts.zip,
  };
}

export function isWithinPhilippines(lat: number, lon: number): boolean {
  return (
    lat >= PH_BOUNDS.minLat &&
    lat <= PH_BOUNDS.maxLat &&
    lon >= PH_BOUNDS.minLon &&
    lon <= PH_BOUNDS.maxLon
  );
}

export interface NominatimResult {
  displayName: string;
  latitude: number;
  longitude: number;
  city?: string;
  province?: string;
  barangay?: string;
  region?: string;
  street?: string;
  postcode?: string;
}

export interface PsgcMatch {
  regionCode: string;
  provinceCode: string;
  cityCode: string;
  barangayCode: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  zip: string;
}

export interface AddressSearchResult {
  id: string;
  displayName: string;
  subtitle: string;
  latitude: number | null;
  longitude: number | null;
  source: "psgc" | "geocode";
  psgc?: PsgcMatch;
  geocode?: NominatimResult;
}

const GEO_HEADERS = {
  Accept: "application/json",
  "User-Agent": "OffGridLifestyle/1.0 (checkout; contact@offgridlifestyle.ph)",
};

function normalizePlaceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^city of\s+/i, "")
    .replace(/\s+city$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(query: string): string[] {
  return normalizePlaceName(query)
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

function scoreNameMatch(name: string, query: string): number {
  const n = normalizePlaceName(name);
  const q = normalizePlaceName(query);
  if (!n || !q) return 0;
  if (n === q) return 100;
  if (n.startsWith(q)) return 85;
  if (q.startsWith(n)) return 80;
  if (n.includes(q)) return 70;
  const tokens = tokenize(q);
  if (tokens.length > 1 && tokens.every((t) => n.includes(t))) return 65;
  const overlap = tokens.filter((t) => n.includes(t)).length;
  if (overlap > 0) return 40 + overlap * 10;
  return 0;
}

function parseGeocodeAddress(address?: Record<string, string>): Pick<NominatimResult, "barangay" | "city" | "province" | "region" | "street" | "postcode"> {
  if (!address) return {};
  return {
    barangay:
      address.suburb ??
      address.neighbourhood ??
      address.village ??
      address.hamlet ??
      address.quarter ??
      address.district,
    city: address.city ?? address.town ?? address.municipality ?? address.county,
    province: address.state ?? address.province ?? address["ISO3166-2-lvl4"],
    region: address.region,
    street: address.road ?? address.pedestrian ?? address.footway,
    postcode: address.postcode,
  };
}

function toNominatimResult(row: {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}): NominatimResult | null {
  const latitude = Number(row.lat);
  const longitude = Number(row.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!isWithinPhilippines(latitude, longitude)) return null;

  const parsed = parseGeocodeAddress(row.address);
  return {
    displayName: row.display_name,
    latitude,
    longitude,
    ...parsed,
  };
}

/** Official PSGC search with relevance scoring (barangay + city + province context). */
export async function searchPsgcLocations(query: string, limit = 8): Promise<AddressSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const mod = await loadPhilippinesLocations();
  const tokens = tokenize(q);
  const raw = mod.searchLocations(q, "all");

  type ScoredCandidate = {
    score: number;
    kind: "barangay" | "city";
    barangayCode: string;
    cityCode: string;
    barangayName: string;
    cityName: string;
    provinceName: string;
    regionName: string;
    regionCode: string;
    provinceCode: string;
  };

  const candidates: ScoredCandidate[] = [];

  const barangayPool = raw.barangays.length > 200 ? raw.barangays.slice(0, 200) : raw.barangays;
  for (const barangay of barangayPool) {
    const full = mod.getFullAddress(barangay.code);
    if (!full?.region || !full.province || !full.city) continue;

    const barangayScore = scoreNameMatch(barangay.name, q);
    const cityScore = Math.max(scoreNameMatch(full.city.name, q), ...tokens.map((t) => scoreNameMatch(full.city.name, t)));
    const provinceScore = Math.max(
      scoreNameMatch(full.province.name, q),
      ...tokens.map((t) => scoreNameMatch(full.province.name, t)),
    );
    const tokenHits = tokens.filter(
      (t) =>
        normalizePlaceName(barangay.name).includes(t) ||
        normalizePlaceName(full.city.name).includes(t) ||
        normalizePlaceName(full.province.name).includes(t),
    ).length;

    const score = barangayScore + cityScore * 0.4 + provinceScore * 0.2 + tokenHits * 8;
    if (score < 45) continue;

    candidates.push({
      score,
      kind: "barangay",
      barangayCode: barangay.code,
      cityCode: full.city.code,
      barangayName: barangay.name.trim(),
      cityName: full.city.name.trim(),
      provinceName: full.province.name,
      regionName: full.region.name,
      regionCode: full.region.code,
      provinceCode: full.province.code,
    });
  }

  for (const city of raw.cities.slice(0, 30)) {
    if (isNcrCityCode(city.code)) {
      const region = mod.getRegion(NCR_REGION_CODE);
      if (!region) continue;
      const score = scoreNameMatch(city.name, q) + tokens.filter((t) => normalizePlaceName(city.name).includes(t)).length * 5;
      if (score < 55) continue;
      candidates.push({
        score: score - 5,
        kind: "city",
        barangayCode: "",
        cityCode: city.code,
        barangayName: "",
        cityName: city.name.trim(),
        provinceName: NCR_PROVINCE_NAME,
        regionName: region.name,
        regionCode: region.code,
        provinceCode: NCR_PROVINCE_CODE,
      });
      continue;
    }

    const hierarchy = mod.getLocationHierarchy(city.code);
    if (!hierarchy?.region || !hierarchy.province || !hierarchy.city) continue;
    const score = scoreNameMatch(city.name, q) + tokens.filter((t) => normalizePlaceName(city.name).includes(t)).length * 5;
    if (score < 55) continue;

    candidates.push({
      score: score - 5,
      kind: "city",
      barangayCode: "",
      cityCode: city.code,
      barangayName: "",
      cityName: city.name.trim(),
      provinceName: hierarchy.province.name,
      regionName: hierarchy.region.name,
      regionCode: hierarchy.region.code,
      provinceCode: hierarchy.province.code,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const results: AddressSearchResult[] = [];

  for (const candidate of candidates) {
    const id =
      candidate.kind === "barangay"
        ? `psgc-${candidate.barangayCode}`
        : `psgc-city-${candidate.cityCode}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const zip = (await getCityZipCode(candidate.cityCode)) ?? "";
    const psgc = buildPsgcMatch({
      region: { code: candidate.regionCode, name: candidate.regionName },
      province: { code: candidate.provinceCode, name: candidate.provinceName },
      city: { code: candidate.cityCode, name: candidate.cityName },
      barangayCode: candidate.barangayCode,
      barangay: candidate.barangayName,
      zip,
    });

    results.push({
      id,
      displayName:
        candidate.kind === "barangay"
          ? `${candidate.barangayName}, ${candidate.cityName}`
          : candidate.cityName,
      subtitle: `${candidate.provinceName}, ${candidate.regionName}`,
      latitude: null,
      longitude: null,
      source: "psgc",
      psgc,
    });

    if (results.length >= limit) break;
  }

  return results;
}

/** Photon (Komoot/OSM) — fast structured geocoding, no API key. */
async function searchPhoton(query: string, limit = 6): Promise<NominatimResult[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lang", "en");
  url.searchParams.set("lat", String(PH_BOUNDS.centerLat));
  url.searchParams.set("lon", String(PH_BOUNDS.centerLon));

  const resp = await fetch(url.toString(), { headers: GEO_HEADERS });
  if (!resp.ok) return [];

  const data = (await resp.json()) as {
    features?: Array<{
      geometry: { coordinates: [number, number] };
      properties: Record<string, string | undefined>;
    }>;
  };

  const results: NominatimResult[] = [];
  for (const feature of data.features ?? []) {
    const [lon, lat] = feature.geometry.coordinates;
    if (!isWithinPhilippines(lat, lon)) continue;
    const p = feature.properties;
    if (p.country && p.country !== "Philippines") continue;

    const parts = [p.name, p.street, p.district, p.city, p.state].filter(Boolean);
    results.push({
      displayName: parts.join(", ") || `${lat}, ${lon}`,
      latitude: lat,
      longitude: lon,
      barangay: p.district ?? p.suburb,
      city: p.city ?? p.county,
      province: p.state,
      street: p.street ?? p.name,
      postcode: p.postcode,
    });
  }
  return results;
}

/** Nominatim fallback — bounded to Philippines viewbox. */
async function searchNominatim(query: string, limit = 5): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("countrycodes", "ph");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("bounded", "1");
  url.searchParams.set(
    "viewbox",
    `${PH_BOUNDS.minLon},${PH_BOUNDS.maxLat},${PH_BOUNDS.maxLon},${PH_BOUNDS.minLat}`,
  );

  const resp = await fetch(url.toString(), { headers: GEO_HEADERS });
  if (!resp.ok) return [];

  const rows = (await resp.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
  }>;

  return rows.map(toNominatimResult).filter((r): r is NominatimResult => r !== null);
}

/** Hybrid search: PSGC official divisions first, then Photon + Nominatim for streets/landmarks. */
export async function searchPhilippinesPlaces(query: string): Promise<AddressSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [psgcResults, photonResults, nominatimResults] = await Promise.all([
    searchPsgcLocations(q, 6),
    q.length >= 3 ? searchPhoton(`${q}, Philippines`, 5) : Promise.resolve([]),
    q.length >= 4 ? searchNominatim(q) : Promise.resolve([]),
  ]);

  const geocodeRows: NominatimResult[] = [];
  const seenGeo = new Set<string>();
  for (const row of [...photonResults, ...nominatimResults]) {
    const key = `${row.latitude.toFixed(4)},${row.longitude.toFixed(4)}`;
    if (seenGeo.has(key)) continue;
    seenGeo.add(key);
    geocodeRows.push(row);
  }

  const geocodeResults: AddressSearchResult[] = geocodeRows.slice(0, 5).map((row, i) => ({
    id: `geo-${row.latitude}-${row.longitude}-${i}`,
    displayName: row.street ? `${row.street}, ${row.city ?? ""}`.replace(/,\s*$/, "") : row.displayName,
    subtitle: [row.barangay, row.city, row.province].filter(Boolean).join(", ") || row.displayName,
    latitude: row.latitude,
    longitude: row.longitude,
    source: "geocode",
    geocode: row,
  }));

  return [...psgcResults, ...geocodeResults].slice(0, 10);
}

export async function reverseGeocodePhilippines(lat: number, lon: number): Promise<NominatimResult | null> {
  if (!isWithinPhilippines(lat, lon)) return null;

  const photonUrl = new URL("https://photon.komoot.io/reverse");
  photonUrl.searchParams.set("lat", String(lat));
  photonUrl.searchParams.set("lon", String(lon));
  photonUrl.searchParams.set("lang", "en");

  try {
    const photonResp = await fetch(photonUrl.toString(), { headers: GEO_HEADERS });
    if (photonResp.ok) {
      const data = (await photonResp.json()) as {
        features?: Array<{
          geometry: { coordinates: [number, number] };
          properties: Record<string, string | undefined>;
        }>;
      };
      const feature = data.features?.[0];
      if (feature) {
        const p = feature.properties;
        return {
          displayName: [p.name, p.street, p.district, p.city, p.state, "Philippines"].filter(Boolean).join(", "),
          latitude: lat,
          longitude: lon,
          barangay: p.district ?? p.suburb,
          city: p.city ?? p.county,
          province: p.state,
          street: p.street ?? p.name,
          postcode: p.postcode,
        };
      }
    }
  } catch {
    // fall through to Nominatim
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  const resp = await fetch(url.toString(), { headers: GEO_HEADERS });
  if (!resp.ok) return null;

  const row = (await resp.json()) as {
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
  };

  return toNominatimResult(row);
}

/** Forward-geocode a PSGC address to coordinates for map display. */
export async function geocodePsgcMatch(match: PsgcMatch): Promise<{ latitude: number; longitude: number } | null> {
  const query = [match.barangay, match.city, match.province, "Philippines"].filter(Boolean).join(", ");
  const photon = await searchPhoton(query, 1);
  if (photon[0]) {
    return { latitude: photon[0].latitude, longitude: photon[0].longitude };
  }
  const nominatim = await searchNominatim(query, 1);
  if (nominatim[0]) {
    return { latitude: nominatim[0].latitude, longitude: nominatim[0].longitude };
  }
  return null;
}

/** Match free-text / geocoded place names to PSGC hierarchy. */
export async function matchPlaceToPsgc(place: NominatimResult): Promise<PsgcMatch | null> {
  const mod = await loadPhilippinesLocations();

  const candidates: Array<{ score: number; barangayCode: string }> = [];

  const searchQueries = [
    [place.barangay, place.city, place.province].filter(Boolean).join(" "),
    [place.barangay, place.city].filter(Boolean).join(" "),
    place.barangay ?? "",
    place.city ?? "",
    [place.street, place.city, place.province].filter(Boolean).join(" "),
  ].filter((q) => q.trim().length >= 2);

  for (const query of searchQueries) {
    const results = mod.searchLocations(query, "barangay");
    for (const barangay of results.barangays) {
      const full = mod.getFullAddress(barangay.code);
      if (!full?.region || !full.province || !full.city) continue;

      let score = scoreNameMatch(barangay.name, place.barangay ?? query);
      if (place.city) score += scoreNameMatch(full.city.name, place.city) * 0.5;
      if (place.province) score += scoreNameMatch(full.province.name, place.province) * 0.3;

      candidates.push({ score, barangayCode: barangay.code });
    }
  }

  if (!candidates.length && place.city) {
    const cityResults = mod.searchLocations(place.city, "city");
    for (const city of cityResults.cities.slice(0, 5)) {
      if (isNcrCityCode(city.code)) {
        const region = mod.getRegion(NCR_REGION_CODE);
        if (!region) continue;
        const score = scoreNameMatch(city.name, place.city);
        if (score < 50) continue;
        const zip = (await getCityZipCode(city.code)) ?? place.postcode ?? "";
        return buildPsgcMatch({
          region,
          province: null,
          city: { code: city.code, name: city.name },
          barangayCode: "",
          barangay: place.barangay?.trim() ?? "",
          zip,
        });
      }

      const hierarchy = mod.getLocationHierarchy(city.code);
      if (!hierarchy?.region || !hierarchy.province || !hierarchy.city) continue;
      const score = scoreNameMatch(city.name, place.city);
      if (score < 50) continue;
      const zip = (await getCityZipCode(city.code)) ?? place.postcode ?? "";
      return buildPsgcMatch({
        region: hierarchy.region,
        province: hierarchy.province,
        city: hierarchy.city,
        barangayCode: "",
        barangay: place.barangay?.trim() ?? "",
        zip,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 45) return null;

  const full = mod.getFullAddress(best.barangayCode);
  if (!full?.region || !full.province || !full.city) return null;

  const zip = (await getCityZipCode(full.city.code)) ?? place.postcode ?? "";

  return buildPsgcMatch({
    region: full.region,
    province: full.province,
    city: full.city,
    barangayCode: best.barangayCode,
    barangay: full.barangay?.name ?? "",
    zip,
  });
}
