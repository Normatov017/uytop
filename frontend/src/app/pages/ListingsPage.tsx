import { useState, useCallback, useEffect } from "react";
import { Search, Map, SlidersHorizontal, MapPin, BookmarkPlus, X, ChevronDown } from "lucide-react";
import { api } from "../../lib/api";
import type { Listing, Page } from "../types";
import { REGIONS, METRO_STATIONS } from "../types";
import PropertyCard from "../components/PropertyCard";
import { fetchUzsRate } from "../utils";
import { t } from "../../lib/i18n";

const PROPERTY_TYPES = [
  "Barchasi", "Kvartira", "Uy", "Yangi bino", "Tijoriy", "Yer", "Studio", "Duplex",
];

const FACILITIES = [
  "Lift", "Parkovka", "Metro yaqin", "Maktab yaqin", "Konditsioner",
  "Bolalar maydoni", "24/7 qo'riqlash", "Balkon",
];

const TYPE_MAP: Record<string, string> = {
  "Kvartira": "apartment",
  "Uy": "house",
  "Yangi bino": "new_building",
  "Tijoriy": "commercial",
  "Yer": "land",
  "Studio": "apartment",
  "Duplex": "apartment",
};

function ListingsPage({
  onNav,
  listings,
  favorites,
  toggleFav,
  ownerFilter,
  onClearOwnerFilter,
}: {
  onNav: (p: Page, id?: number) => void;
  listings: Listing[];
  favorites: number[];
  toggleFav: (id: number) => void;
  ownerFilter?: number | null;
  onClearOwnerFilter?: () => void;
}) {
  const [sortBy, setSortBy] = useState("Eng yangi");
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
  const [pageNum, setPageNum] = useState(1);
  const perPage = 12;

  useEffect(() => { setPageNum(1); }, [searchText, selectedRegion, filterDistrict, filterStatus, minPrice, maxPrice, roomsFilter, filterMetro, verifiedOnly, filterType, facilities, minArea, maxArea]);

  useEffect(() => {
    const headerSearch = localStorage.getItem("uymap_header_search");
    if (headerSearch) {
      setSearchText(headerSearch);
      localStorage.removeItem("uymap_header_search");
    }
    const applied = localStorage.getItem("uymap_applied_filters");
    if (applied) {
      try {
        const f = JSON.parse(applied);
        if (f.searchText) setSearchText(f.searchText);
        if (f.district) setFilterDistrict(f.district);
        if (f.metro) setFilterMetro(f.metro);
        if (f.status) setFilterStatus(f.status);
        if (f.minPrice) setMinPrice(f.minPrice);
        if (f.maxPrice) setMaxPrice(f.maxPrice);
        if (f.rooms) setRoomsFilter(f.rooms);
        if (f.verifiedOnly) setVerifiedOnly(true);
        if (f.sortBy) setSortBy(f.sortBy);
        localStorage.removeItem("uymap_applied_filters");
      } catch {}
    }
  }, []);

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
    setFilterType("Barchasi"); setFacilities([]);
    setMinArea(""); setMaxArea("");
    setPageNum(1);
  };

  const onFilterChange = () => setPageNum(1);

  const activeFilterCount = [
    minPrice, maxPrice, roomsFilter, filterDistrict, filterMetro,
    filterStatus, filterType !== "Barchasi" ? filterType : null,
    ...facilities, minArea, maxArea, verifiedOnly,
  ].filter(Boolean).length;

  const filtered = listings.filter((l) => {
    if (ownerFilter && l.ownerId !== ownerFilter) return false;
    const term = searchText.trim().toLowerCase();
    if (term && !`${l.title} ${l.location} ${l.district} ${l.metroStation}`.toLowerCase().includes(term)) return false;
    if (selectedRegion && l.region !== selectedRegion) return false;
    if (filterDistrict && l.district !== filterDistrict) return false;
    if (filterMetro && l.metroStation !== filterMetro) return false;
    const STATUS_MAP: Record<string, string> = { sale: "sotuv", rent: "ijara" };
    if (filterStatus && l.status !== STATUS_MAP[filterStatus]) return false;
    if (minPrice && l.priceNum < Number(minPrice)) return false;
    if (maxPrice && l.priceNum > Number(maxPrice)) return false;
    if (roomsFilter) {
      const roomsMatch = roomsFilter.match(/^(\d+)\+$/);
      if (roomsMatch) { if (l.rooms < Number(roomsMatch[1])) return false; }
      else if (l.rooms !== Number(roomsFilter)) return false;
    }
    if (verifiedOnly && !l.verified) return false;
    if (filterType !== "Barchasi" && l.type !== TYPE_MAP[filterType] && l.type.toLowerCase() !== filterType.toLowerCase()) return false;
    if (minArea && l.area < Number(minArea)) return false;
    if (maxArea && l.area > Number(maxArea)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "Eng arzon") return a.priceNum - b.priceNum;
    if (sortBy === "Eng qimmat") return b.priceNum - a.priceNum;
    if (sortBy === "Ko'p ko'rilgan") return b.views - a.views;
    return b.id - a.id;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((pageNum - 1) * perPage, pageNum * perPage);

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
        <h3 className="font-bold text-gray-900">Filtrlash</h3>
        <button onClick={clearAll} className="text-xs text-green-600 hover:text-green-700 font-semibold transition-colors">
          Tozalash
        </button>
      </div>

      <FilterSection label="Narx">
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputClass} />
          <span className="text-gray-300 text-xs">–</span>
          <input type="text" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputClass} />
        </div>
      </FilterSection>

      <FilterSection label="Xonalar">
        <div className="flex gap-1.5 flex-wrap">
          {["", "1", "2", "3", "4", "5", "6+"].map((r) => (
            <button key={r}
              onClick={() => setRoomsFilter(r === roomsFilter ? "" : r)}
              className={`px-4 py-2 text-xs rounded-lg border transition-colors ${
                roomsFilter === r
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
              }`}>
              {r || "Har qanday"}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Mulk turi">
        <div className="relative">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            {PROPERTY_TYPES.map((o) => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>

      <FilterSection label="Qulayliklar">
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

      <FilterSection label="Maydon (m²)">
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Min" value={minArea} onChange={(e) => setMinArea(e.target.value)} className={inputClass} />
          <span className="text-gray-300 text-xs">–</span>
          <input type="text" placeholder="Max" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} className={inputClass} />
        </div>
      </FilterSection>

      <FilterSection label="Viloyat">
        <div className="relative">
          <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setFilterDistrict(""); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option value="">Har qanday</option>
            {Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>
      <FilterSection label="Tuman">
        <div className="relative">
          <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option value="">Har qanday</option>
            {selectedRegion && REGIONS[selectedRegion]?.map((d) => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>

      <FilterSection label="Bitim turi">
        <div className="flex gap-1.5">
          {["", "sale", "rent"].map((s) => (
            <button key={s}
              onClick={() => setFilterStatus(s === filterStatus ? "" : s)}
              className={`flex-1 px-4 py-2 text-xs rounded-lg border transition-colors ${
                filterStatus === s
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
              }`}>
              {s ? (s === "sale" ? "Sotuv" : "Ijara") : "Barchasi"}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Metro bekatlari">
        <div className="relative">
          <select value={filterMetro} onChange={(e) => setFilterMetro(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white appearance-none cursor-pointer">
            <option value="">Har qanday</option>
            {METRO_STATIONS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </FilterSection>

      <FilterSection label="Faqat tekshirilgan">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={verifiedOnly} onChange={() => setVerifiedOnly((p) => !p)}
            className="w-4 h-4 accent-green-600 rounded" />
          <span className="text-sm text-gray-600 group-hover:text-gray-900">Tasdiqlangan e'lonlar</span>
        </label>
      </FilterSection>

      <FilterSection label="Kalit so'z">
        <input type="text" placeholder="Manzil yoki kalit so'z" value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 bg-white" />
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
            <BookmarkPlus size={14} /> Saqlash
          </button>
          <button onClick={() => setShowSidebar(true)}
            className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 transition-colors relative">
            <SlidersHorizontal size={14} /> Filtrlash
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ml-0.5">{activeFilterCount}</span>
            )}
          </button>
          <button onClick={() => onNav("map")}
            className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
            <Map size={14} /> Xarita
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {showSidebar && (
            <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowSidebar(false)}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white overflow-y-auto p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Filtrlash</span>
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
            {ownerFilter && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <div>
                  <p className="text-sm font-bold text-green-800">
                    Rieltor e'lonlari — {listings.find(l => l.ownerId === ownerFilter)?.owner.name ?? "Noma'lum"}
                  </p>
                  <p className="text-xs text-green-600">{filtered.length} ta e'lon</p>
                </div>
                <button onClick={onClearOwnerFilter}
                  className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
                  Barcha e'lonlar
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">{filtered.length}</span> ta e'lon</p>
              <div className="flex items-center gap-2">
                <button onClick={toggleCurrency}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                    showInUzs ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                  }`}>
                  {showInUzs ? "UZS" : "USD"}
                </button>
                <span className="text-xs text-gray-400 hidden md:block">Saralash:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-green-500 bg-white">
                  {["Eng yangi", "Eng arzon", "Eng qimmat", "Ko'p ko'rilgan"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <Search size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-700 mb-1">E'lon topilmadi</h3>
                <p className="text-sm text-gray-400">Filtrlarni o'zgartirib ko'ring</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map((l) => (
                    <PropertyCard key={l.id} listing={l} onView={() => onNav("detail", l.id)}
                      onFav={() => toggleFav(l.id)} isFav={favorites.includes(l.id)} displayInUzs={showInUzs} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum === 1}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPageNum(p)}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === pageNum
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPageNum(p => Math.min(totalPages, p + 1))} disabled={pageNum === totalPages}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showSave && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSave(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Qidiruvni saqlash</h3>
            <p className="text-xs text-gray-400 mb-4">Joriy filtrlarni tez kirish uchun saqlang</p>
            <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder='Masalan: "3 xonali Chilonzor"'
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setShowSave(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-3 text-sm font-semibold hover:bg-gray-50 transition-colors">Bekor qilish</button>
              <button onClick={async () => {
                if (!saveName.trim()) return;
                try {
                  await api.saveSearch(saveName.trim(), { district: filterDistrict, metro: filterMetro, status: filterStatus, minPrice, maxPrice, rooms: roomsFilter, verifiedOnly, sortBy, searchText });
                  setShowSave(false); setSaveName(""); alert("Saqlanildi!");
                } catch { alert("Xatolik"); }
              }} disabled={!saveName.trim()}
                className="flex-1 bg-green-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingsPage;
