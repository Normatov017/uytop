import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, List, MapPin, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Listing, Page } from "../types";
import PropertyCard from "../components/PropertyCard";
import { t } from "../../lib/i18n";

function MapPage({
  onNav,
  listings,
  favorites,
  toggleFav,
}: {
  onNav: (p: Page, id?: number) => void;
  listings: Listing[];
  favorites: number[];
  toggleFav: (id: number) => void;
}) {
  const [selected, setSelected] = useState<Listing | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [41.31, 69.28],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", () => setSelected(null));

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers when listings or selection change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove old cluster group
    if (markersRef.current) {
      map.removeLayer(markersRef.current);
    }

    if (listings.length === 0) return;

    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 16,
    });

    listings.forEach((l) => {
      const isSelected = selected?.id === l.id;
      const marker = L.circleMarker([l.lat, l.lng], {
        radius: isSelected ? 10 : 8,
        fillColor: isSelected ? "#dc2626" : "#16a34a",
        color: "#fff",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 1,
      });

      const tooltip = L.tooltip({
        direction: "top",
        offset: L.point(0, -12),
        className: "map-price-tooltip",
        permanent: true,
        opacity: 1,
      });
      tooltip.setContent(
        `<div style="background:${isSelected ? '#16a34a' : 'white'};color:${isSelected ? 'white' : '#111'};border:2px solid #16a34a;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15);line-height:1.2">${l.price}</div>`
      );
      marker.bindTooltip(tooltip);

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelected(l);
      });

      mcg.addLayer(marker);
    });

    map.addLayer(mcg);
    markersRef.current = mcg;

    // Fit bounds
    map.fitBounds(mcg.getBounds().pad(0.1));
  }, [listings, selected?.id]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tuman yoki manzil kiriting"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50"
          />
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:border-green-500 transition-colors">
          <SlidersHorizontal size={14} /> {t("filter")}
        </button>
        <button
          onClick={() => onNav("listings")}
          className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
        >
          <List size={14} /> Ro'yxat
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left list */}
        <div className="hidden md:block w-72 shrink-0 overflow-y-auto bg-white border-r border-gray-200">
          <div className="p-3 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 py-2">
              {listings.length} ta e'lon
            </p>
            {listings.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSelected(l);
                  mapInstance.current?.setView([l.lat, l.lng], 15);
                }}
                className={`w-full flex gap-3 p-3 rounded-xl text-left border transition-all ${
                  selected?.id === l.id
                    ? "border-green-500 bg-green-50"
                    : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <img
                  src={l.image}
                  alt={l.title}
                  className="w-20 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate leading-snug">{l.title}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <MapPin size={10} /> {l.district}
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

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 1 }} />

          {/* Selected preview card */}
          {selected && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-20">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-white z-10"
              >
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
                <button
                  onClick={() => onNav("detail", selected.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  Batafsil ko'rish
                </button>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}&zoom=16`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  OSM da ochish
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapPage;
