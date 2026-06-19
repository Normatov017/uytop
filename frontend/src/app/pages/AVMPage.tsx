import { useState } from "react";
import { Cpu, MapPin, Home, Layers, Ruler, Info, CheckCircle2, XCircle } from "lucide-react";
import type { Page } from "../types";
import type { AVMEstimate } from "../../lib/types";
import { t } from "../../lib/i18n";

export default function AVMPage({ onNav }: { onNav: (p: Page) => void }) {
  const [district, setDistrict] = useState("Chilonzor");
  const [area, setArea] = useState(60);
  const [rooms, setRooms] = useState(2);
  const [floor, setFloor] = useState(4);
  const [totalFloors, setTotalFloors] = useState(9);
  const [hasMetro, setHasMetro] = useState(true);
  const [result, setResult] = useState<AVMEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  const districts = ["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yakkasaroy", "Sergeli", "Olmazor", "Uchtepa", "Mirobod"];

  const estimate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const basePerM2: Record<string, number> = {
      "Yunusobod": 1250, "Chilonzor": 1150, "Mirzo Ulug'bek": 1350,
      "Yakkasaroy": 1500, "Sergeli": 900, "Olmazor": 1000,
      "Uchtepa": 950, "Mirobod": 1400,
    };
    const base = basePerM2[district] || 1050;
    let mid = base * area;
    if (area < 40) mid *= 1.08;
    if (floor <= 2) mid *= 1.03;
    if (floor === totalFloors) mid *= 1.02;
    if (hasMetro) mid *= 1.06;

    setResult({
      estimated_min: Math.round(mid * 0.9),
      estimated_max: Math.round(mid * 1.1),
      estimated_mid: Math.round(mid),
      confidence: district === "Chilonzor" || district === "Yunusobod" ? "yuqori" : "o'rtacha",
      similar_count: district === "Chilonzor" ? 28 : 12,
      similar_avg_price: Math.round(mid * 1.02),
      adjustments: [
        area < 40 ? "Kichik maydon — m² narxi yuqoriroq (+8%)" : area > 120 ? "Katta maydon — m² narxi pastroq" : null,
        floor <= 2 ? "Past qavat — qulaylik uchun +3%" : floor === totalFloors ? "Yuqori qavat — shovqin kam, +2%" : null,
        hasMetro ? "Metro yaqinligi — +5-8%" : null,
      ].filter(Boolean) as string[],
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">AI narx baholash (AVM)</h1>
            <p className="text-sm text-gray-400">O'zbekiston bozori uchun aqlli baholash tizimi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <Info size={16} className="text-green-600" /> Mulk parametrlari
              </h2>

              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                  <MapPin size={12} /> {t("district")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {districts.map(d => (
                    <button key={d} onClick={() => setDistrict(d)}
                      className={`border-2 rounded-xl py-2.5 text-xs font-bold transition-colors ${district === d ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{t("area")}</span>
                  <span className="font-bold text-gray-900">{area} m²</span>
                </div>
                <input type="range" min={20} max={300} step={5} value={area}
                  onChange={e => setArea(Number(e.target.value))} className="w-full accent-green-600" />
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{t("rooms")}</span>
                  <span className="font-bold text-gray-900">{rooms} ta</span>
                </div>
                <input type="range" min={1} max={7} step={1} value={rooms}
                  onChange={e => setRooms(Number(e.target.value))} className="w-full accent-green-600" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t("floor")}</label>
                  <input type="number" value={floor} onChange={e => setFloor(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Qavatlar soni</label>
                  <input type="number" value={totalFloors} onChange={e => setTotalFloors(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setHasMetro(!hasMetro)}
                  className={`border-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${hasMetro ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>
                  Metro yaqin
                </button>
              </div>

              <button onClick={estimate} disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl py-3.5 text-sm font-bold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 shadow-lg shadow-green-200">
                {loading ? "Hisoblanmoqda..." : "Narxni baholash"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
              <h2 className="font-bold text-gray-900 mb-5 text-sm">Baholash natijasi</h2>

              {result ? (
                <>
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white mb-5">
                    <div className="text-xs text-blue-100 mb-1">Bozor narxi oralig'i</div>
                    <div className="text-lg font-extrabold">
                      ${result.estimated_min.toLocaleString()} — ${result.estimated_max.toLocaleString()}
                    </div>
                    <div className="text-xl font-extrabold mt-1">
                      ~${result.estimated_mid.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {result.confidence === "yuqori" ? <CheckCircle2 size={12} className="text-green-300" /> : <Info size={12} className="text-amber-300" />}
                      <span className="text-[10px] text-blue-100">Ishonchlilik: {result.confidence}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">O'xshash e'lonlar</span>
                      <span className="font-bold text-gray-900">{result.similar_count} ta</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">O'rtacha narx</span>
                      <span className="font-bold text-gray-900">${result.similar_avg_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">m² narxi</span>
                      <span className="font-bold text-gray-900">${Math.round(result.estimated_mid / area).toLocaleString()}</span>
                    </div>
                  </div>

                  {result.adjustments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-gray-700 mb-2">Tuzatishlar</h3>
                      <div className="space-y-1.5">
                        {result.adjustments.map((adj, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                            {adj}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Cpu size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">Parametrlarni kiriting va "Narxni baholash" tugmasini bosing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
