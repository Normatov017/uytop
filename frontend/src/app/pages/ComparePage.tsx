import { useState, useMemo } from "react";
import { Scale, Plus, X, MapPin, Check, Star, TrendingUp, Search, Home, Ruler, Layers, Bath } from "lucide-react";
import type { Listing, Page } from "../types";
import { t } from "../../lib/i18n";

interface FieldDef {
  key: string;
  label: string;
  icon?: typeof Star;
  highlight?: "high" | "low";
}

const fields: FieldDef[] = [
  { key: "priceNum", label: t("price"), icon: TrendingUp, highlight: "low" },
  { key: "rooms", label: t("rooms"), icon: Home },
  { key: "area", label: t("area"), icon: Ruler, highlight: "high" },
  { key: "floor", label: t("floor"), icon: Layers },
  { key: "repair", label: "Remont" },
  { key: "metroStation", label: t("metro"), icon: MapPin },
  { key: "verified", label: "Tekshirilgan" },
  { key: "isPremium", label: "Premium" },
  { key: "isUrgent", label: "Tez sotish" },
];

export default function ComparePage({
  listings,
  onNav,
}: {
  listings: Listing[];
  onNav: (p: Page, id?: number) => void;
}) {
  const [selected, setSelected] = useState<Listing[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const addListing = (l: Listing) => {
    if (selected.length < 3 && !selected.find(s => s.id === l.id)) {
      setSelected([...selected, l]);
    }
  };

  const removeListing = (id: number) => {
    setSelected(selected.filter(s => s.id !== id));
  };

  const bestValue = useMemo(() => {
    if (selected.length < 2) return null;
    return selected.reduce((best, l) =>
      best ? (l.priceNum / l.area < best.priceNum / best.area ? l : best) : l
    );
  }, [selected]);

  const available = listings.filter(l => !selected.find(s => s.id === l.id));
  const filteredAvailable = available.filter(l =>
    !searchTerm || l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const colCount = Math.max(selected.length, 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
            <Scale size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t("compare")}</h1>
            <p className="text-sm text-gray-400">2-3 ta e'lonni yonma-yon taqqoslang</p>
          </div>
        </div>

        {/* Selected cards */}
        <div className={`grid ${colCount === 1 ? "grid-cols-1" : colCount === 2 ? "grid-cols-2" : "grid-cols-3"} gap-4 mb-8`}>
          {[0, 1, 2].map(i => {
            const item = selected[i];
            return (
              <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all min-h-[220px] flex items-center justify-center overflow-hidden ${
                item ? "border-gray-200 dark:border-gray-700 shadow-sm" : "border-dashed border-gray-300 dark:border-gray-600"
              }`}>
                {item ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="relative">
                      <img src={item.image} alt="" className="w-full h-36 object-cover" />
                      <button onClick={() => removeListing(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
                        <X size={13} className="text-white" />
                      </button>
                      {bestValue?.id === item.id && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Star size={10} /> Eng arzon
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} /> {item.district}
                        </p>
                      </div>
                      <div className="text-base font-extrabold text-green-600 mt-2">{item.price}</div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowPicker(true)}
                    className="flex flex-col items-center gap-2 text-gray-300 hover:text-green-500 transition-colors p-6 w-full h-full justify-center">
                    <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <Plus size={24} />
                    </div>
                    <span className="text-sm font-medium">{!item && selected.length === 0 ? "E'lon qo'shing" : "Yana qo'shing"}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        {selected.length >= 2 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {fields.map(f => {
              const values = selected.map(l => {
                if (f.key === "priceNum") return l.priceNum;
                if (f.key === "area") return l.area;
                if (f.key === "rooms") return l.rooms;
                if (f.type === "bool" || f.key === "verified" || f.key === "isPremium" || f.key === "isUrgent") return (l as any)[f.key] ? true : false;
                return (l as any)[f.key] ?? "—";
              });

              let bestIdx = -1;
              if (f.highlight && values.every(v => typeof v === "number")) {
                const nums = values as number[];
                bestIdx = f.highlight === "high" ? nums.indexOf(Math.max(...nums)) : nums.indexOf(Math.min(...nums));
              }

              return (
                <div key={f.key} className={`grid ${colCount === 1 ? "grid-cols-1" : colCount === 2 ? "grid-cols-3" : "grid-cols-4"} border-b border-gray-50 dark:border-gray-700 last:border-0`}>
                  <div className="p-4 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
                    {f.icon && <f.icon size={13} />} {f.label}
                  </div>
                  {selected.map((l, idx) => {
                    const val = values[idx];
                    const isBest = idx === bestIdx;
                    return (
                      <div key={l.id} className={`p-4 text-sm flex items-center gap-2 ${
                        isBest ? "bg-green-50 dark:bg-green-900/20" : ""
                      }`}>
                        {typeof val === "boolean" ? (
                          val ? <span className="flex items-center gap-1 text-green-600 font-semibold"><Check size={14} /> Ha</span>
                            : <span className="text-gray-300 dark:text-gray-600">—</span>
                        ) : (
                          <span className={`text-gray-900 dark:text-gray-200 ${isBest ? "font-extrabold text-green-700 dark:text-green-400" : ""}`}>
                            {f.key === "priceNum" ? `$${Number(val).toLocaleString()}` :
                             f.key === "area" ? `${val} m²` :
                             f.key === "rooms" ? `${val} xona` :
                             f.key === "floor" ? `${val}-qavat` :
                             String(val)}
                          </span>
                        )}
                        {isBest && <Star size={11} className="text-amber-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 text-center">
            <Scale size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Solishtirish uchun e'lon qo'shing</h3>
            <p className="text-sm text-gray-400">Yuqoridagi katakchalarni bosib 2-3 ta e'lonni taqqoslang</p>
          </div>
        )}
      </div>

      {/* Property picker */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">E'lon tanlang</h3>
              <button onClick={() => setShowPicker(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="E'lon nomi yoki manzil bo'yicha..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-green-500" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredAvailable.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">E'lon topilmadi</div>
              ) : (
                filteredAvailable.slice(0, 30).map(l => (
                  <button key={l.id} onClick={() => { addListing(l); setSearchTerm(""); setShowPicker(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border border-transparent hover:border-green-100 dark:hover:border-green-900">
                    <img src={l.image} alt="" className="w-16 h-12 rounded-xl object-cover bg-gray-100 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{l.title}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{l.district}</span>
                        <span>{l.rooms} xona</span>
                        <span>{l.area} m²</span>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-green-600 shrink-0">{l.price}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
