import { useState, useCallback } from "react";
import { Search, Map, SlidersHorizontal, MapPin, BookmarkPlus, X, ChevronDown } from "lucide-react";
import { api } from "../../lib/api";
import type { Listing, Page } from "../types";
import { REGIONS, METRO_STATIONS } from "../types";
import PropertyCard from "../components/PropertyCard";
import { fetchUzsRate } from "../utils";
import { t } from "../../lib/i18n";

const PROPERTY_TYPES = [
  "Any Property", "House", "Detached House", "Semi-Detached House",
  "Terraced House", "End of Terrace House", "Townhouse",
  "Apartment", "Studio Apartment", "Duplex", "Bungalow", "Site",
];

const FACILITIES = [
  "Alarm", "Gas Fired Central Heating", "Oil Fired Central Heating",
  "Parking", "Wheelchair Access", "Wired for Cable TV",
];

const TYPE_MAP: Record<string, string> = {
  "Apartment": "apartment",
  "Studio Apartment": "apartment",
  "Duplex": "apartment",
  "House": "house",
  "Detached House": "house",
  "Semi-Detached House": "house",
  "Terraced House": "house",
  "End of Terrace House": "house",
  "Townhouse": "house",
  "Bungalow": "house",
  "Site": "land",
};

function ListingsPage({
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
  const [sortBy, setSortBy] = useState("Best Match");
  const [searchText, setSearchText] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [roomsFilter, setRoomsFilter] = useState("");
  const [filterMetro, setFilterMetro] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showInUzs, setShowInUzs] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [filterType, setFilterType] = useState("Any Property");
  const [facilities, setFacilities] = useState<string[]>([]);
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleCurrency = useCallback(() => {
    if (!showInUzs) fetchUzsRate().catch(() => undefined);
    setShowInUzs((prev) => !prev);
  }, [showInUzs]);

  const toggleFacility = (f: string) => {
    setFacilities((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const clearAll = () => {
    setSearchText(""); setSelectedRegion(""); setFilterDistrict(""); setFilterStatus("");
    setMinPrice(""); setMaxPrice(""); setRoomsFilter("");
    setFilterMetro(""); setVerifiedOnly(false);
    setFilterType("Any Property"); setFacilities([]);
    setMinArea(""); setMaxArea("");
  };

  const activeFilterCount = [
    minPrice, maxPrice, roomsFilter, filterDistrict, filterMetro,
    filterStatus, filterType !== "Any Property" ? filterType : null,
    ...facilities, minArea, maxArea, verifiedOnly,
  ].filter(Boolean).length;

  const filtered = listings.filter((l) => {
    const term = searchText.trim().toLowerCase();
    if (term && !`${l.title} ${l.location} ${l.district} ${l.metroStation}`.toLowerCase().includes(term)) return false;
    if (selectedRegion && l.region !== selectedRegion) return false;
    if (filterDistrict && l.district !== filterDistrict) return false;
    if (filterMetro && l.metroStation !== filterMetro) return false;
    if (filterStatus && l.status !== filterStatus) return false;
    if (minPrice && l.priceNum < Number(minPrice)) return false;
    if (maxPrice && l.priceNum > Number(maxPrice)) return false;
    if (roomsFilter && (roomsFilter === "4+" ? l.rooms < 4 : l.rooms !== Number(roomsFilter))) return false;
    if (verifiedOnly && !l.verified) return false;
    if (filterType !== "Any Property" && l.type !== TYPE_MAP[filterType] && l.type !== filterType.toLowerCase()) return false;
    if (minArea && l.area < Number(minArea)) return false;
    if (maxArea && l.area > Number(maxArea)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "Eng arzon" || sortBy === "Price: Low to High") return a.priceNum - b.priceNum;
    if (sortBy === "Eng qimmat" || sortBy === "Price: High to Low") return b.priceNum - a.priceNum;
    if (sortBy === "Ko'p ko'rilgan" || sortBy === "Most Viewed") return b.views - a.views;
    return b.id - a.id;
  });

  const FilterSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <div className="text-xs font-semibold text-gray-500 mb-2.5">{label}</div>
      {children}
    </div>
  );

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all bg-white";

  const sidebarContent = (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900">Filter</h3>
        <button onClick={clearAll} className="text-xs text-green-600 hover:text-green-700 font-semibold transition-colors">
          Clear all
        </button>
      </div>

      <FilterSection label="Price">
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputClass} />
          <span className="text-gray-300 text-xs">–</span>
          <input type="text" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputClass} />
        </div>
      </FilterSection>

      <FilterSection label="Beds">
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Min" value={roomsFilter} onChange={(e) => setRoomsFilter(e.target.value)} className={inputClass} />
          <span className="text-gray-300 text-xs">–</span>
          <input type="text" placeholder="Max" value="" className={inputClass} />
        </div>
      </FilterSection>

      <FilterSection label="Type">
        <div className="relative">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            {PROPERTY_TYPES.map((o) => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>

      <FilterSection label="Baths">
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Min" value="" className={inputClass} />
          <span className="text-gray-300 text-xs">–</span>
          <input type="text" placeholder="Max" value="" className={inputClass} />
        </div>
      </FilterSection>

      <FilterSection label="Facilities">
        <div className="space-y-2">
          {FACILITIES.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={facilities.includes(f)} onChange={() => toggleFacility(f)}
                className="w-4 h-4 accent-green-600 rounded" />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{f}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Size (m²)">
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Min" value={minArea} onChange={(e) => setMinArea(e.target.value)} className={inputClass} />
          <span className="text-gray-300 text-xs">–</span>
          <input type="text" placeholder="Max" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} className={inputClass} />
        </div>
      </FilterSection>

      <FilterSection label="Region">
        <div className="relative">
          <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setFilterDistrict(""); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option value="">Any</option>
            {Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>
      <FilterSection label="District">
        <div className="relative">
          <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option value="">Any</option>
            {selectedRegion && REGIONS[selectedRegion]?.map((d) => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>

      <FilterSection label="Sale Type">
        <div className="relative">
          <select value="All Sales" onChange={() => {}}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option>All Sales</option>
            <option>Online Offers Only</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>

      <FilterSection label="Media Type">
        <div className="relative">
          <select value="Any Media" onChange={() => {}}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option>Any Media</option>
            <option>Ads with video</option>
            <option>Ads with virtual tours</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>

      <FilterSection label="Keyword / Address">
        <input type="text" placeholder='e.g. garage or "period property"' value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white" />
      </FilterSection>

      <FilterSection label="Availability">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 accent-green-600 rounded" defaultChecked />
          <span className="text-sm text-gray-600 group-hover:text-gray-900">Available</span>
        </label>
      </FilterSection>

      <FilterSection label="Added In Last">
        <div className="relative">
          <select value="At any time" onChange={() => {}}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option>At any time</option>
            <option>24 hours</option>
            <option>7 days</option>
            <option>14 days</option>
            <option>30 days</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button className="md:hidden p-2 border border-gray-200 rounded-lg" onClick={() => setShowSidebar(true)}>
            <SlidersHorizontal size={16} />
          </button>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Shahar, tuman yoki manzil kiriting" value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-gray-50 focus:bg-white transition-all" />
          </div>
          <button onClick={() => setShowSave(true)}
            className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 transition-colors">
            <BookmarkPlus size={14} /> Save
          </button>
          <button onClick={() => setShowSidebar(true)}
            className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 transition-colors relative">
            <SlidersHorizontal size={14} /> Filter
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ml-0.5">{activeFilterCount}</span>
            )}
          </button>
          <button onClick={() => onNav("map")}
            className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
            <Map size={14} /> Map
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {showSidebar && (
            <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowSidebar(false)}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Filter</span>
                  <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
                </div>
                {sidebarContent}
              </div>
            </div>
          )}

          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              {sidebarContent}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">{filtered.length}</span> properties</p>
              <div className="flex items-center gap-2">
                <button onClick={toggleCurrency}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                    showInUzs ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                  }`}>
                  {showInUzs ? "UZS" : "USD"}
                </button>
                <span className="text-xs text-gray-400 hidden md:block">Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-green-500 bg-white">
                  {["Best Match", "Newest", "Price: Low to High", "Price: High to Low", "Most Viewed"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <Search size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-700 mb-1">No properties found</h3>
                <p className="text-sm text-gray-400">Try changing your filter settings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((l) => (
                  <PropertyCard key={l.id} listing={l} onView={() => onNav("detail", l.id)}
                    onFav={() => toggleFav(l.id)} isFav={favorites.includes(l.id)} displayInUzs={showInUzs} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSave && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSave(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Save search</h3>
            <p className="text-xs text-gray-400 mb-4">Save current filters for quick access later</p>
            <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder='e.g. "2 bed Chilonzor"'
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setShowSave(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-3 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={async () => {
                if (!saveName.trim()) return;
                try {
                  await api.saveSearch(saveName.trim(), { district: filterDistrict, metro: filterMetro, status: filterStatus, minPrice, maxPrice, rooms: roomsFilter, verifiedOnly, sortBy, searchText });
                  setShowSave(false); setSaveName(""); alert("Saved!");
                } catch { alert("Error"); }
              }} disabled={!saveName.trim()}
                className="flex-1 bg-green-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingsPage;
