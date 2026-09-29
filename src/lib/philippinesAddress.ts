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

/**
 * ponytail: ph-addresses-locations ships double-encoded UTF-8 (e.g. "Las PiÃ±as"
 * instead of "Las Piñas"). The bytes C3 83 C2 B1 are UTF-8 of "Ã±" (Latin-1 of ñ's
 * UTF-8 bytes). To fix: take the JS string, encode each char as a Latin-1 byte
 * (charCodeAt → byte), then decode those bytes as UTF-8.
 * Ceiling: only fixes U+0080–U+00FF mojibake (the package's failure mode); higher
 * codepoints would need a fuller normalizer. Upgrade path: replace the package or
 * pre-process the JSON at build time.
 */
function fixMojibakeName(name: string): string {
  if (!name || (name.indexOf("Ã") === -1 && name.indexOf("Â") === -1)) return name;
  const bytes = new Uint8Array(name.length);
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    if (code > 0xff) return name; // not mojibake — leave alone
    bytes[i] = code;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export async function getCityZipCode(cityCode: string): Promise<string | null> {
  const cities = (await import("ph-addresses-locations/data/cities.json")).default as CityRow[];
  const row = cities.find((city) => city.code === cityCode);
  const zip = row?.zipCode?.trim();
  if (zip) return zip;
  return NCR_PRIMARY_ZIP[cityCode] ?? null;
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
  return mod.getProvinces(regionCode).map((p) => ({ code: p.code, name: fixMojibakeName(p.name) }));
}

export async function getRegionsList(): Promise<PhLocation[]> {
  const mod = await loadPhilippinesLocations();
  return mod.getRegions().map((r) => ({ code: r.code, name: fixMojibakeName(r.name) }));
}

export async function getBarangaysForCity(cityCode: string): Promise<PhLocation[]> {
  if (!cityCode) return [];
  const mod = await loadPhilippinesLocations();
  return mod.getBarangays(cityCode).map((b) => ({ code: b.code, name: fixMojibakeName(b.name.trim()) }));
}

export async function getCitiesForProvince(provinceCode: string, regionCode: string): Promise<PhLocation[]> {
  if (!regionCode) return [];
  const mod = await loadPhilippinesLocations();
  if (isNcrRegion(regionCode) || provinceCode === NCR_PROVINCE_CODE) {
    const cities = (await import("ph-addresses-locations/data/cities.json")).default as CityRow[];
    return cities
      .filter((city) => city.code.startsWith("138"))
      .map((city) => ({ code: city.code, name: fixMojibakeName(city.name.trim()) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  if (!provinceCode) return [];
  return mod
    .getCities(provinceCode)
    .filter((city) => !isNcrCityCode(city.code))
    .map((city) => ({ code: city.code, name: fixMojibakeName(city.name.trim()) }));
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

/**
 * The PSGC package files every Metro Manila city under Sarangani (1208000000).
 * City codes 138* are NCR. Never trust provinceCode for those rows.
 */
const NCR_PRIMARY_ZIP: Record<string, string> = {
  "1380600000": "1000", // Manila
  "1381300000": "1100", // Quezon City
  "1380300000": "1200", // Makati
  "1381100000": "1300", // Pasay (also in the dataset)
  "1380100000": "1400", // Caloocan
  "1381600000": "1440", // Valenzuela
  "1380400000": "1470", // Malabon
  "1380900000": "1485", // Navotas
  "1381400000": "1500", // San Juan
  "1381701000": "1620", // Pateros
  "1380200000": "1740", // Las Piñas
};

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
  "User-Agent": "OFFGRIDLifestyle/1.0 (checkout; contact@offgridlifestyle.ph)",
};

/** Accent- and mojibake-insensitive key so "Las Pinas" matches "Las Piñas". */
export function foldPlaceName(name: string): string {
  return fixMojibakeName(name)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/^city of\s+/, "")
    .replace(/\s+city$/, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface IndexedPlace {
  barangayCode: string;
  barangayName: string;
  cityCode: string;
  cityName: string;
  provinceCode: string;
  provinceName: string;
  regionCode: string;
  regionName: string;
  /** Folded "barangay city province" for scoring. */
  key: string;
}

let indexPromise: Promise<IndexedPlace[]> | null = null;

function loadAddressIndex(): Promise<IndexedPlace[]> {
  if (!indexPromise) {
    indexPromise = buildAddressIndex().catch((err) => {
      indexPromise = null;
      throw err;
    });
  }
  return indexPromise;
}

async function buildAddressIndex(): Promise<IndexedPlace[]> {
  const mod = await loadPhilippinesLocations();
  const ncrRegion = mod.getRegion(NCR_REGION_CODE);
  const cityByCode = new Map(
    (mod.getCities("") as Array<{ code: string; name: string; provinceCode: string }>).map((city) => [city.code, city]),
  );
  const provinceByCode = new Map(
    (mod.getProvinces("") as Array<{ code: string; name: string; regionCode: string }>).map((province) => [
      province.code,
      province,
    ]),
  );
  const regionByCode = new Map(mod.getRegions().map((region) => [region.code, region]));

  const places: IndexedPlace[] = [];
  for (const barangay of mod.getBarangays("")) {
    // getBarangays("") omits cityCode. PSGC city code is the first 7 digits plus "000".
    const city = cityByCode.get(`${barangay.code.slice(0, 7)}000`);
    if (!city) continue;

    let provinceCode: string;
    let provinceName: string;
    let regionCode: string;
    let regionName: string;

    if (isNcrCityCode(city.code)) {
      provinceCode = NCR_PROVINCE_CODE;
      provinceName = NCR_PROVINCE_NAME;
      regionCode = NCR_REGION_CODE;
      regionName = ncrRegion?.name ?? "NCR (National Capital Region)";
    } else {
      const province = provinceByCode.get(city.provinceCode);
      const region = province ? regionByCode.get(province.regionCode) : undefined;
      if (!province || !region) continue;
      provinceCode = province.code;
      provinceName = fixMojibakeName(province.name);
      regionCode = region.code;
      regionName = fixMojibakeName(region.name);
    }

    const barangayName = fixMojibakeName(barangay.name.trim());
    const cityName = fixMojibakeName(city.name.trim());
    places.push({
      barangayCode: barangay.code,
      barangayName,
      cityCode: city.code,
      cityName,
      provinceCode,
      provinceName,
      regionCode,
      regionName,
      key: foldPlaceName(`${barangayName} ${cityName} ${provinceName}`),
    });
  }
  return places;
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

function scoreIndexedPlace(place: IndexedPlace, foldedQuery: string, tokens: string[]): number {
  const barangay = foldPlaceName(place.barangayName);
  const city = foldPlaceName(place.cityName);
  const province = foldPlaceName(place.provinceName);
  let score = 0;
  if (barangay === foldedQuery) score += 120;
  else if (barangay.startsWith(foldedQuery)) score += 90;
  else if (barangay.includes(foldedQuery)) score += 70;

  const tokenHits = tokens.filter((token) => place.key.includes(token));
  if (tokens.length > 1 && tokenHits.length === tokens.length) score += 40;
  score += tokenHits.length * 12;
  if (tokens.some((token) => city === token || city.startsWith(token))) score += 35;
  if (tokens.some((token) => province === token || province.startsWith(token))) score += 15;
  return score;
}

/** Official PSGC search. Metro Manila is corrected off Sarangani; accents are ignored. */
export async function searchPsgcLocations(query: string, limit = 8): Promise<AddressSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const foldedQuery = foldPlaceName(q);
  const tokens = foldedQuery.split(" ").filter((token) => token.length > 1);
  if (!tokens.length) return [];

  const index = await loadAddressIndex();
  const anchor = tokens.reduce((longest, token) => (token.length > longest.length ? token : longest), "");
  const pool = index.filter((place) => place.key.includes(anchor));
  const minScore = foldedQuery.length < 3 ? 90 : 70;
  const ranked = pool
    .map((place) => ({ place, score: scoreIndexedPlace(place, foldedQuery, tokens) }))
    .filter((row) => row.score >= minScore)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const results: AddressSearchResult[] = [];
  const zipCache = new Map<string, string>();

  for (const { place } of ranked) {
    if (seen.has(place.barangayCode)) continue;
    seen.add(place.barangayCode);

    let zip = zipCache.get(place.cityCode);
    if (zip === undefined) {
      zip = (await getCityZipCode(place.cityCode)) ?? "";
      zipCache.set(place.cityCode, zip);
    }

    results.push({
      id: `psgc-${place.barangayCode}`,
      displayName: `${place.barangayName}, ${place.cityName}`,
      subtitle: `${place.provinceName}, ${place.regionName}`,
      latitude: null,
      longitude: null,
      source: "psgc",
      psgc: buildPsgcMatch({
        region: { code: place.regionCode, name: place.regionName },
        province: { code: place.provinceCode, name: place.provinceName },
        city: { code: place.cityCode, name: place.cityName },
        barangayCode: place.barangayCode,
        barangay: place.barangayName,
        zip,
      }),
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

/** Match a geocoder result to the official PSGC hierarchy, including Metro Manila. */
export async function matchPlaceToPsgc(place: NominatimResult): Promise<PsgcMatch | null> {
  const query = [place.barangay, place.city, place.province].filter(Boolean).join(" ");
  const matches = query.trim().length >= 2 ? await searchPsgcLocations(query, 1) : [];
  const best = matches[0]?.psgc;
  if (best?.barangayCode) {
    return { ...best, zip: best.zip || place.postcode || "" };
  }

  if (!place.city) return null;
  const cityMatches = await searchPsgcLocations(place.city, 1);
  const city = cityMatches[0]?.psgc;
  if (!city) return null;
  return {
    ...city,
    barangayCode: "",
    barangay: place.barangay?.trim() ?? "",
    zip: city.zip || place.postcode || "",
  };
}
