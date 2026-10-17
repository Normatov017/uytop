import { useEffect, useRef, useState, useMemo } from "react";
import { Search, MapPin, X, List, ShieldCheck, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing, Page } from "../types";
import BackButton from "../components/BackButton";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function MapPage({
  onNav,
  goBack,
  listings,
}: {
  onNav: (p: Page, id?: number) => void;
  goBack: () => void;
  listings: Listing[];
}) {
  const [selected, setSelected] = useState<Listing | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showMobileList, setShowMobileList] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const selectedMarker = useRef<L.Marker | null>(null);
  const userMarker = useRef<L.Marker | null>(null);

  const locateUser = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        mapInstance.current?.setView([latitude, longitude], 14);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const filtered = useMemo(() => {
    let result = listings;
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.district.toLowerCase().includes(q)
      );
    }
    if (userLocation) {
      result = [...result].sort((a, b) => {
        const da = haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const db = haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return da - db;
      });
    }
    return result;
  }, [listings, searchText, userLocation]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [41.31, 69.28],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    L.control.attribution({ prefix: false }).addAttribution("&copy; OpenStreetMap").addTo(map);
    map.on("click", () => setSelected(null));
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (markersLayer.current) map.removeLayer(markersLayer.current);

    const layer = L.layerGroup();
    const bounds = L.latLngBounds([]);
    const markerMap = new Map<number, L.Marker>();

    const iconHtml = (price: string) =>
      `<div style="background:white;color:#111;border:2px solid #16a34a;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15);line-height:1.2;cursor:pointer;transition:all 0.15s;">${price}</div>`;

    filtered.forEach((l) => {
      if (!l.lat || !l.lng) return;
      bounds.extend([l.lat, l.lng]);

      const icon = L.divIcon({ className: "", html: iconHtml(l.price), iconSize: [0, 0], iconAnchor: [20, 16], tooltipAnchor: [0, 0] });
      const marker = L.marker([l.lat, l.lng], { icon });
      marker.on("click", (e) => { L.DomEvent.stopPropagation(e); setSelected(l); });
      markerMap.set(l.id, marker);
      layer.addLayer(marker);
    });

    map.addLayer(layer);
    markersLayer.current = layer;

    if (filtered.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds.pad(0.15), { maxZoom: 15 });
    }
  }, [filtered.map(l => l.id).join(",")]);

  useEffect(() => {
    if (!markersLayer.current) return;
    markersLayer.current.eachLayer((m: any) => {
      const lng = (m as L.Marker).getLatLng()?.lng;
      if (!lng) return;
      const listing = filtered.find((l) => l.lat === (m as L.Marker).getLatLng().lat && l.lng === lng);
      if (!listing) return;
      const isSelected = listing.id === selected?.id;
      const div = (m as any).getElement?.()?.querySelector?.("div");
      if (div) {
        div.style.background = isSelected ? "#16a34a" : "white";
        div.style.color = isSelected ? "white" : "#111";
      }
    });
  }, [selected?.id, filtered]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (userMarker.current) { map.removeLayer(userMarker.current); userMarker.current = null; }
    if (userLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:24px;height:24px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      userMarker.current = L.marker([userLocation.lat, userLocation.lng], { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [userLocation]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <BackButton onClick={goBack} />
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tuman yoki manzil kiriting" value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50" />
        </div>
        <div className="text-xs font-medium text-gray-400 whitespace-nowrap">{filtered.length} ta</div>
        <button onClick={locateUser} disabled={locating}
          className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Menga yaqin">
          <Navigation size={14} className={locating ? "animate-pulse" : ""} />
          <span className="hidden md:inline">{locating ? "Topilmoqda..." : userLocation ? "Yaqin" : "Menga yaqin"}</span>
        </button>
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
          <ShieldCheck size={13} /> 0% komissiya
        </div>
        <button onClick={() => setShowMobileList(true)}
          className="md:hidden flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600">
          <List size={14} />
        </button>
        <button onClick={() => onNav("listings")}
          className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
          Ro'yxat
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block w-80 shrink-0 overflow-y-auto bg-white border-r border-gray-200">
          <div className="p-3 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 py-2">{filtered.length} ta e'lon</p>
            {filtered.map((l) => (
              <button key={l.id}
                onClick={() => { setSelected(l); mapInstance.current?.setView([l.lat, l.lng], 15); }}
                className={`w-full flex gap-3 p-3 rounded-xl text-left border transition-all ${
                  selected?.id === l.id ? "border-green-500 bg-green-50" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}>
                <img src={l.image} alt={l.title} className="w-20 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate leading-snug">{l.title}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <MapPin size={10} /> {l.district}
                    {userLocation && l.lat && l.lng && (
                      <span className="ml-1 text-blue-500 font-medium">· {Math.round(haversineDistance(userLocation.lat, userLocation.lng, l.lat, l.lng) * 10) / 10} km</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-green-600 mt-1.5">{l.price}</div>
                  <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                    <span>{l.area} m²</span>
                    {l.rooms > 0 && <span>{l.rooms} xona</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 1 }} />
          <div className="absolute top-4 left-4 z-20 rounded-2xl bg-white/95 px-4 py-3 shadow-lg border border-gray-100">
            <div className="text-sm font-extrabold text-gray-900">Maklersiz xarita</div>
            <div className="text-xs text-gray-500">{filtered.length} ta egasidan e'lon</div>
          </div>

          {selected && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-20">
              <button onClick={() => setSelected(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-white z-10">
                <X size={13} />
              </button>
              <img src={selected.image} alt={selected.title} className="w-full h-36 object-cover bg-gray-100" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-sm leading-snug">{selected.title}</h4>
                  <span className="text-green-600 font-bold text-sm whitespace-nowrap">{selected.price}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 mb-3">
                  <MapPin size={10} /> {selected.location}
                </div>
                <button onClick={() => onNav("detail", selected.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  Batafsil ko'rish
                </button>
                <a href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                  target="_blank" rel="noreferrer"
                  className="mt-2 block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold py-2.5 rounded-xl transition-colors">
                  Google Mapsda ochish
                </a>
              </div>
            </div>
          )}
          {showMobileList && (
            <div className="absolute inset-x-0 bottom-0 z-30 max-h-[55vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl border-t border-gray-100 md:hidden">
              <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-gray-900">Egasidan e'lonlar</div>
                  <div className="text-xs text-gray-400">{filtered.length} ta natija</div>
                </div>
                <button onClick={() => setShowMobileList(false)} className="p-2 rounded-xl bg-gray-100 text-gray-500">
                  <X size={14} />
                </button>
              </div>
              <div className="p-3 space-y-2">
                {filtered.map((l) => (
                  <button key={l.id}
                    onClick={() => { setSelected(l); setShowMobileList(false); mapInstance.current?.setView([l.lat, l.lng], 15); }}
                    className="w-full flex gap-3 p-3 rounded-xl text-left border border-gray-100 hover:border-green-300">
                    <img src={l.image} alt="" className="w-20 h-16 rounded-xl object-cover bg-gray-100" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{l.title}</div>
                      <div className="text-xs text-gray-400">
                        {l.district}
                        {userLocation && l.lat && l.lng && (
                          <span className="ml-1 text-blue-500 font-medium">· {Math.round(haversineDistance(userLocation.lat, userLocation.lng, l.lat, l.lng) * 10) / 10} km</span>
                        )}
                      </div>
                      <div className="text-sm font-extrabold text-green-600 mt-1">{l.price}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapPage;