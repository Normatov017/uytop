import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const markerIcon = L.divIcon({
      className: "",
      html: '<div style="width:28px;height:28px;border-radius:9999px;background:#16a34a;border:3px solid white;box-shadow:0 8px 24px rgba(22,163,74,.35);position:relative"><div style="position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:9999px;background:white;transform:translate(-50%,-50%)"></div></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onChange(pos.lat, pos.lng);
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    });

    mapInstance.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !markerRef.current) return;
    const current = markerRef.current.getLatLng();
    if (current.lat !== lat || current.lng !== lng) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
    }
  }, [lat, lng]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-72 rounded-xl border border-gray-200 overflow-hidden"
        style={{ zIndex: 1 }}
      />
      <div className="absolute left-3 top-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow">
        Xaritani bosing yoki yashil markerni sudrang
      </div>
    </div>
  );
}
