import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { PH_BOUNDS, isWithinPhilippines } from "@/src/lib/philippinesAddress";

interface PhilippinesLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  onPinChange: (lat: number, lon: number) => void;
  className?: string;
}

export function PhilippinesLocationMap({
  latitude,
  longitude,
  onPinChange,
  className,
}: PhilippinesLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [ready, setReady] = useState(false);

  const initialLat = latitude ?? PH_BOUNDS.centerLat;
  const initialLon = longitude ?? PH_BOUNDS.centerLon;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLon],
        zoom: latitude !== null ? 15 : 6,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;margin:-14px 0 0 -14px;background:#000AFF;border:3px solid #000000;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([initialLat, initialLon], { draggable: true, icon: pinIcon }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        if (isWithinPhilippines(pos.lat, pos.lng)) {
          onPinChange(pos.lat, pos.lng);
        } else {
          marker.setLatLng([initialLat, initialLon]);
        }
      });

      map.on("click", (e) => {
        if (!isWithinPhilippines(e.latlng.lat, e.latlng.lng)) return;
        marker.setLatLng(e.latlng);
        onPinChange(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init map once
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !markerRef.current) return;
    if (latitude === null || longitude === null) return;

    const latLng = { lat: latitude, lng: longitude };
    markerRef.current.setLatLng(latLng);
    mapRef.current.setView(latLng, Math.max(mapRef.current.getZoom(), 14), { animate: true });
  }, [latitude, longitude, ready]);

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-xl border border-offgrid-green/15">
        {!ready ? (
          <div className="flex h-48 items-center justify-center bg-offgrid-cream/50 sm:h-56">
            <Loader2 className="h-6 w-6 animate-spin text-offgrid-green/40" />
          </div>
        ) : null}
        <div ref={containerRef} className="h-48 w-full sm:h-56" style={{ visibility: ready ? "visible" : "hidden" }} />
      </div>
      <p className="mt-2 text-xs text-offgrid-green/60">Tap the map or drag the pin to set your delivery location.</p>
    </div>
  );
}
