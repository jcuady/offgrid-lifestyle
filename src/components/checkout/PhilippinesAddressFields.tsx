import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense, type ReactNode } from "react";
import { ChevronDown, Loader2, MapPin, Navigation, Search } from "lucide-react";
import type { ShippingInfo } from "@/src/types/commerce";
import {
  loadPhilippinesLocations,
  getCityZipCode,
  getProvincesForRegion,
  getCitiesForProvince,
  getRegionsList,
  getBarangaysForCity,
  matchPlaceToPsgc,
  reverseGeocodePhilippines,
  searchPhilippinesPlaces,
  geocodePsgcMatch,
  isNcrRegion,
  NCR_PROVINCE_CODE,
  NCR_PROVINCE_NAME,
  type AddressSearchResult,
  type NominatimResult,
  type PhLocation,
} from "@/src/lib/philippinesAddress";
import type { ShippingFieldErrors } from "@/src/lib/formValidation";
import { cn } from "@/src/lib/utils";

const PhilippinesLocationMap = lazy(() =>
  import("@/src/components/checkout/PhilippinesLocationMap").then((m) => ({
    default: m.PhilippinesLocationMap,
  })),
);

type AddressFieldKey = keyof Pick<
  ShippingFieldErrors,
  "address" | "barangay" | "city" | "province" | "region" | "zip"
>;

interface PhilippinesAddressFieldsProps {
  value: ShippingInfo;
  onChange: (value: ShippingInfo) => void;
  errors?: ShippingFieldErrors;
  onClearError?: (field: AddressFieldKey) => void;
}

/** 16px text avoids iOS Safari zoom-on-focus; min 44px for touch. */
const fieldBaseClass =
  "min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-base text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25 disabled:cursor-not-allowed disabled:bg-offgrid-green/[0.04] disabled:text-offgrid-green/45";

const selectClass = cn(fieldBaseClass, "appearance-none bg-none pr-10");

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green sm:mb-2 sm:text-xs";

function fieldClass(hasError?: boolean) {
  return cn(fieldBaseClass, hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20");
}

function selectFieldClass(hasError?: boolean) {
  return cn(selectClass, hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20");
}

function SelectShell({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={cn("relative", disabled && "opacity-90")}>
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/45"
        aria-hidden
      />
    </div>
  );
}

function FieldError({ message, field }: { message?: string; field?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600" role="alert" data-field-error={field}>
      {message}
    </p>
  );
}

function manualProgress(value: ShippingInfo): { done: number; total: number } {
  let done = 0;
  if (value.regionCode) done++;
  if (value.provinceCode || isNcrRegion(value.regionCode)) done++;
  if (value.cityCode) done++;
  if (value.barangayCode) done++;
  if (value.address.trim()) done++;
  if (/^\d{4}$/.test(value.zip.trim())) done++;
  return { done, total: 6 };
}

export function PhilippinesAddressFields({
  value,
  onChange,
  errors = {},
  onClearError,
}: PhilippinesAddressFieldsProps) {
  const [ready, setReady] = useState(false);
  const [regions, setRegions] = useState<PhLocation[]>([]);
  const [provinces, setProvinces] = useState<PhLocation[]>([]);
  const [cities, setCities] = useState<PhLocation[]>([]);
  const [barangays, setBarangays] = useState<PhLocation[]>([]);
  const [barangayFilter, setBarangayFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolvingPin, setResolvingPin] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [quickFillOpen, setQuickFillOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const progress = manualProgress(value);
  const isNcr = isNcrRegion(value.regionCode);

  const filteredBarangays = useMemo(() => {
    const q = barangayFilter.trim().toLowerCase();
    if (!q) return barangays;
    return barangays.filter((b) => b.name.toLowerCase().includes(q));
  }, [barangays, barangayFilter]);

  useEffect(() => {
    let cancelled = false;
    void loadPhilippinesLocations().then(() => {
      if (cancelled) return;
      void getRegionsList().then((regions) => {
        if (cancelled) return;
        setRegions(regions);
        setReady(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const nextProvinces = value.regionCode ? await getProvincesForRegion(value.regionCode) : [];
      const provinceCode = isNcrRegion(value.regionCode) ? NCR_PROVINCE_CODE : value.provinceCode;
      const nextCities =
        value.regionCode && provinceCode ? await getCitiesForProvince(provinceCode, value.regionCode) : [];
      const nextBarangays = value.cityCode ? await getBarangaysForCity(value.cityCode) : [];
      if (cancelled) return;
      setProvinces(nextProvinces);
      setCities(nextCities);
      setBarangays(nextBarangays);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, value.regionCode, value.provinceCode, value.cityCode]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [searchOpen]);

  const patchField = useCallback(
    (patch: Partial<ShippingInfo>, clearFields?: AddressFieldKey[]) => {
      onChange({ ...value, ...patch });
      clearFields?.forEach((field) => onClearError?.(field));
      if (patch.address !== undefined) onClearError?.("address");
      if (patch.zip !== undefined) onClearError?.("zip");
    },
    [onChange, onClearError, value],
  );

  const applyPsgcSelection = useCallback(
    async (patch: Partial<ShippingInfo>, clearFields?: AddressFieldKey[]) => {
      const next = { ...value, ...patch };
      if (patch.cityCode && patch.cityCode !== value.cityCode) {
        const zip = await getCityZipCode(patch.cityCode);
        if (zip) next.zip = zip;
      }
      onChange(next);
      clearFields?.forEach((field) => onClearError?.(field));
    },
    [onChange, onClearError, value],
  );

  const applyPsgcMatch = async (
    matched: NonNullable<AddressSearchResult["psgc"]>,
    coords?: { latitude: number; longitude: number } | null,
    extra?: Partial<ShippingInfo>,
  ) => {
    let latitude = coords?.latitude ?? value.latitude;
    let longitude = coords?.longitude ?? value.longitude;

    if (latitude === null || longitude === null) {
      const geocoded = await geocodePsgcMatch(matched);
      if (geocoded) {
        latitude = geocoded.latitude;
        longitude = geocoded.longitude;
      }
    }

    onChange({
      ...value,
      region: matched.region,
      province: matched.province,
      city: matched.city,
      barangay: matched.barangay,
      zip: matched.zip || value.zip,
      regionCode: matched.regionCode,
      provinceCode: matched.provinceCode,
      cityCode: matched.cityCode,
      barangayCode: matched.barangayCode,
      latitude,
      longitude,
      ...extra,
    });
    onClearError?.("region");
    onClearError?.("province");
    onClearError?.("city");
    onClearError?.("barangay");
    onClearError?.("zip");
    setLocationNote(
      matched.barangayCode
        ? "Official PSGC address applied. You can still edit any field below."
        : "City matched. Please select your barangay from the dropdown.",
    );
  };

  const applyGeocodeResult = async (result: NominatimResult) => {
    const matched = await matchPlaceToPsgc(result);
    if (matched) {
      await applyPsgcMatch(
        matched,
        { latitude: result.latitude, longitude: result.longitude },
        { address: result.street || value.address || "" },
      );
      return;
    }

    patchField(
      {
        address: result.street || value.address || result.displayName.split(",")[0] || "",
        barangay: result.barangay ?? value.barangay,
        city: result.city ?? value.city,
        province: result.province ?? value.province,
        zip: result.postcode ?? value.zip,
        latitude: result.latitude,
        longitude: result.longitude,
      },
      ["address", "barangay", "city", "province", "zip"],
    );
    setLocationNote("Location found. Please confirm region, province, city, and barangay from the dropdowns.");
  };

  const applySearchResult = async (result: AddressSearchResult) => {
    setSearchOpen(false);
    setSearchQuery(result.displayName);
    setLocationNote(null);

    if (result.source === "psgc" && result.psgc) {
      await applyPsgcMatch(
        result.psgc,
        result.latitude !== null && result.longitude !== null
          ? { latitude: result.latitude, longitude: result.longitude }
          : null,
      );
      return;
    }

    if (result.geocode) {
      await applyGeocodeResult(result.geocode);
    }
  };

  const resolveMapPin = async (lat: number, lon: number) => {
    setResolvingPin(true);
    setLocationNote(null);
    try {
      const result = await reverseGeocodePhilippines(lat, lon);
      if (!result) {
        patchField({ latitude: lat, longitude: lon });
        setLocationNote("Pin saved. Complete region, city, and barangay using the dropdowns below.");
        return;
      }
      await applyGeocodeResult({ ...result, latitude: lat, longitude: lon });
    } finally {
      setResolvingPin(false);
    }
  };

  const runSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim().length < 2) {
          setSearchResults([]);
          return;
        }
        setSearching(true);
        try {
          const results = await searchPhilippinesPlaces(query);
          setSearchResults(results);
        } finally {
          setSearching(false);
        }
      }, 300),
    [],
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("Location is not supported in this browser. Use the dropdowns below.");
      return;
    }
    setLocating(true);
    setLocationNote(null);
    setShowMap(true);
    setQuickFillOpen(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await resolveMapPin(pos.coords.latitude, pos.coords.longitude);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationNote("Location permission denied. You can still enter your address manually below.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleRegionChange = (regionCode: string) => {
    const region = regions.find((r) => r.code === regionCode);
    if (!region) {
      void applyPsgcSelection(
        {
          regionCode: "",
          region: "",
          provinceCode: "",
          province: "",
          cityCode: "",
          city: "",
          barangayCode: "",
          barangay: "",
        },
        ["region", "province", "city", "barangay"],
      );
      return;
    }

    if (isNcrRegion(region.code)) {
      void applyPsgcSelection(
        {
          regionCode: region.code,
          region: region.name,
          provinceCode: NCR_PROVINCE_CODE,
          province: NCR_PROVINCE_NAME,
          cityCode: "",
          city: "",
          barangayCode: "",
          barangay: "",
        },
        ["region", "province", "city", "barangay"],
      );
      return;
    }

    void applyPsgcSelection(
      {
        regionCode: region.code,
        region: region.name,
        provinceCode: "",
        province: "",
        cityCode: "",
        city: "",
        barangayCode: "",
        barangay: "",
      },
      ["region", "province", "city", "barangay"],
    );
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-offgrid-green/12 bg-white/70 px-3 py-2.5 sm:px-4 sm:py-3">
        <p className="text-xs text-offgrid-green/70 sm:text-sm">
          Pick region → city → barangay, then street.
        </p>
        <span className="rounded-full bg-offgrid-green/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/70 sm:text-xs">
          {progress.done}/{progress.total}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <label className={labelClass} htmlFor="ph-region">
            Region *
          </label>
          <SelectShell disabled={!ready}>
            <select
              id="ph-region"
              required
              disabled={!ready}
              value={value.regionCode}
              onChange={(e) => handleRegionChange(e.target.value)}
              className={selectFieldClass(Boolean(errors.region))}
              aria-invalid={Boolean(errors.region)}
              aria-describedby={errors.region ? "ph-region-error" : undefined}
            >
              <option value="">{ready ? "Select region" : "Loading regions…"}</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </SelectShell>
          <FieldError message={errors.region} field="region" />
        </div>

        <div>
          <label className={labelClass} htmlFor="ph-province">
            Province *
          </label>
          <SelectShell disabled={!value.regionCode || isNcr}>
            <select
              id="ph-province"
              required
              disabled={!value.regionCode || isNcr}
              value={isNcr ? NCR_PROVINCE_CODE : value.provinceCode}
              onChange={(e) => {
                const province = provinces.find((p) => p.code === e.target.value);
                void applyPsgcSelection(
                  {
                    provinceCode: province?.code ?? "",
                    province: province?.name ?? "",
                    cityCode: "",
                    city: "",
                    barangayCode: "",
                    barangay: "",
                  },
                  ["province", "city", "barangay"],
                );
              }}
              className={selectFieldClass(Boolean(errors.province))}
              aria-invalid={Boolean(errors.province)}
            >
              <option value="">{value.regionCode ? "Select province" : "Select a region first"}</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </SelectShell>
          {isNcr ? (
            <p className="mt-1 text-xs text-offgrid-green/55">NCR uses Metro Manila — proceed to city.</p>
          ) : !value.regionCode ? (
            <p className="mt-1 text-xs text-offgrid-green/45">Select a region first.</p>
          ) : null}
          <FieldError message={errors.province} field="province" />
        </div>

        <div>
          <label className={labelClass} htmlFor="ph-city">
            City / Municipality *
          </label>
          <SelectShell disabled={!value.regionCode || (!isNcr && !value.provinceCode)}>
            <select
              id="ph-city"
              required
              disabled={!value.regionCode || (!isNcr && !value.provinceCode)}
              value={value.cityCode}
              onChange={(e) => {
                const city = cities.find((c) => c.code === e.target.value);
                setBarangayFilter("");
                void applyPsgcSelection(
                  {
                    cityCode: city?.code ?? "",
                    city: city?.name ?? "",
                    barangayCode: "",
                    barangay: "",
                  },
                  ["city", "barangay"],
                );
              }}
              className={selectFieldClass(Boolean(errors.city))}
              aria-invalid={Boolean(errors.city)}
            >
              <option value="">
                {value.regionCode && (isNcr || value.provinceCode)
                  ? "Select city or municipality"
                  : "Select province first"}
              </option>
              {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
          </SelectShell>
          <FieldError message={errors.city} field="city" />
        </div>

        <div>
          <label className={labelClass} htmlFor="ph-barangay">
            Barangay *
          </label>
          {barangays.length > 20 ? (
            <input
              type="search"
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              placeholder="Type to filter barangays…"
              disabled={!value.cityCode}
              className={cn(fieldClass(false), "mb-2")}
              enterKeyHint="search"
            />
          ) : null}
          <SelectShell disabled={!value.cityCode}>
            <select
              id="ph-barangay"
              required
              disabled={!value.cityCode}
              value={value.barangayCode}
              onChange={(e) => {
                const barangay =
                  filteredBarangays.find((b) => b.code === e.target.value) ??
                  barangays.find((b) => b.code === e.target.value);
                patchField(
                  {
                    barangayCode: barangay?.code ?? "",
                    barangay: barangay?.name ?? "",
                  },
                  ["barangay"],
                );
              }}
              className={selectFieldClass(Boolean(errors.barangay))}
              aria-invalid={Boolean(errors.barangay)}
            >
              <option value="">{value.cityCode ? "Select barangay" : "Select city first"}</option>
              {filteredBarangays.map((barangay) => (
                <option key={barangay.code} value={barangay.code}>
                  {barangay.name}
                </option>
              ))}
            </select>
          </SelectShell>
          {value.cityCode && filteredBarangays.length === 0 && barangayFilter ? (
            <p className="mt-1 text-xs text-offgrid-green/55">No barangay matches. Try a different spelling.</p>
          ) : null}
          <FieldError message={errors.barangay} field="barangay" />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="ph-street">
            Street / Building / Unit No. *
          </label>
          <input
            id="ph-street"
            type="text"
            required
            value={value.address}
            onChange={(e) => patchField({ address: e.target.value }, ["address"])}
            className={fieldClass(Boolean(errors.address))}
            placeholder="123 Rizal Street, Unit 4B"
            autoComplete="address-line1"
            aria-invalid={Boolean(errors.address)}
          />
          <FieldError message={errors.address} field="address" />
        </div>

        <div>
          <label className={labelClass} htmlFor="ph-zip">
            ZIP Code *
          </label>
          <input
            id="ph-zip"
            type="text"
            required
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={value.zip}
            onChange={(e) => patchField({ zip: e.target.value.replace(/\D/g, "").slice(0, 4) }, ["zip"])}
            className={fieldClass(Boolean(errors.zip))}
            placeholder="1634"
            autoComplete="postal-code"
            aria-invalid={Boolean(errors.zip)}
          />
          <FieldError message={errors.zip} field="zip" />
        </div>
      </div>

      <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40">
        <button
          type="button"
          onClick={() => setQuickFillOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-offgrid-green">Quick fill (optional)</span>
            <span className="text-xs text-offgrid-green/60">Search, map pin, or GPS — fills the fields above</span>
          </span>
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-offgrid-green/50 transition-transform", quickFillOpen && "rotate-180")} />
        </button>

        {quickFillOpen ? (
          <div className="space-y-4 border-t border-offgrid-green/10 px-4 pb-4 pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-offgrid-green/20 bg-white px-4 py-2.5 text-sm font-semibold text-offgrid-green transition-colors hover:border-offgrid-green/40 disabled:opacity-60"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                Use my location
              </button>
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-offgrid-green/20 bg-white px-4 py-2.5 text-sm font-semibold text-offgrid-green transition-colors hover:border-offgrid-green/40"
              >
                <MapPin className="h-4 w-4" />
                {showMap ? "Hide map" : "Pin on map"}
              </button>
            </div>

            {locationNote ? <p className="text-xs text-offgrid-green/65">{locationNote}</p> : null}
            {resolvingPin ? (
              <p className="flex items-center gap-2 text-xs text-offgrid-green/65">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Matching pin to official address…
              </p>
            ) : null}

            {showMap ? (
              <Suspense
                fallback={
                  <div className="flex h-48 items-center justify-center rounded-xl border border-offgrid-green/15 bg-white sm:h-56">
                    <Loader2 className="h-6 w-6 animate-spin text-offgrid-green/40" />
                  </div>
                }
              >
                <PhilippinesLocationMap
                  latitude={value.latitude}
                  longitude={value.longitude}
                  onPinChange={(lat, lon) => void resolveMapPin(lat, lon)}
                />
              </Suspense>
            ) : null}

            <div ref={searchRef} className="relative">
              <label className={labelClass}>Search address</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setSearchQuery(q);
                    setSearchOpen(true);
                    void runSearch(q);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Barangay, city, landmark, or street"
                  className={cn(selectClass, "pl-10")}
                />
                {searching ? (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-offgrid-green/40" />
                ) : null}
              </div>
              {searchOpen && searchQuery.length >= 2 && !searching && searchResults.length === 0 ? (
                <p className="mt-1 text-xs text-offgrid-green/55">No matches — use the dropdowns above instead.</p>
              ) : null}
              {searchOpen && searchResults.length > 0 ? (
                <ul className="relative z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-offgrid-green/15 bg-white shadow-lg">
                  {searchResults.map((result) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        className="w-full border-b border-offgrid-green/5 px-3 py-2.5 text-left last:border-0 hover:bg-offgrid-cream/80"
                        onClick={() => void applySearchResult(result)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              result.source === "psgc"
                                ? "bg-offgrid-lime/30 text-offgrid-green"
                                : "bg-offgrid-green/10 text-offgrid-green/70",
                            )}
                          >
                            {result.source === "psgc" ? "Official" : "Map"}
                          </span>
                          <span className="text-sm font-medium text-offgrid-green">{result.displayName}</span>
                        </span>
                        {result.subtitle ? (
                          <span className="mt-0.5 block text-xs text-offgrid-green/55 sm:pl-14">{result.subtitle}</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
