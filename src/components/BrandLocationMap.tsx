import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Loader2, MapPin } from "lucide-react";
import { BRAND_LOCATION, brandMapsUrl } from "@/src/lib/brandLocation";

export function BrandLocationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: [BRAND_LOCATION.latitude, BRAND_LOCATION.longitude],
          zoom: 16,
          scrollWheelZoom: false,
          zoomControl: true,
          dragging: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const markerIcon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:34px;height:42px">
              <div style="position:absolute;left:2px;top:0;width:30px;height:30px;background:#000AFF;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 5px 16px rgba(0,0,0,.35)"></div>
              <div style="position:absolute;left:13px;top:11px;width:8px;height:8px;background:#fff;border-radius:999px"></div>
            </div>`,
          iconSize: [34, 42],
          iconAnchor: [17, 40],
        });

        L.marker([BRAND_LOCATION.latitude, BRAND_LOCATION.longitude], {
          icon: markerIcon,
          keyboard: true,
          title: `OFFGRID — ${BRAND_LOCATION.line}`,
        })
          .addTo(map)
          .bindPopup(
            `<strong>OFFGRID Lifestyle</strong><br>${BRAND_LOCATION.street}, ${BRAND_LOCATION.city}`,
          );

        mapRef.current = map;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative min-h-[310px] overflow-hidden rounded-3xl border border-offgrid-green/10 bg-offgrid-cream shadow-sm">
      {status === "loading" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-offgrid-cream">
          <Loader2 className="h-6 w-6 animate-spin text-offgrid-lime" aria-label="Loading map" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-0 grid place-items-center bg-offgrid-dark p-7 text-center text-offgrid-cream">
          <div>
            <MapPin className="mx-auto h-7 w-7 text-offgrid-lime" />
            <p className="mt-3 font-display text-2xl font-black">{BRAND_LOCATION.localityLabel}</p>
            <p className="mt-2 text-sm text-offgrid-cream/70">{BRAND_LOCATION.line}</p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-[310px] w-full sm:h-[330px]"
          style={{ visibility: status === "ready" ? "visible" : "hidden" }}
          aria-label={`Map showing OFFGRID at ${BRAND_LOCATION.line}`}
        />
      )}

      <div className="pointer-events-none absolute left-4 right-4 top-4 z-[500] flex items-start justify-between gap-3">
        <div className="pointer-events-auto max-w-[70%] rounded-2xl border border-white/20 bg-offgrid-dark/92 px-4 py-3 text-offgrid-cream shadow-xl backdrop-blur-md">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-offgrid-cream/55">
            OFFGRID location
          </p>
          <p className="mt-1 font-display text-lg font-black leading-tight">{BRAND_LOCATION.localityLabel}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-offgrid-cream/75">{BRAND_LOCATION.line}</p>
        </div>
        <a
          href={brandMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-offgrid-lime px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-lg transition-colors hover:bg-offgrid-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2"
        >
          Open
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}
