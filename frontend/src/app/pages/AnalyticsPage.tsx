import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Home, DollarSign, MapPin } from "lucide-react";
import { api } from "../../lib/api";
import { DISTRICTS, Page } from "../types";
import BackButton from "../components/BackButton";

interface DistrictSummary {
  district: string;
  listings_count: number;
  avg_price: number | null;
  avg_price_per_m2: number | null;
}

interface MarketSummary {
  total_listings: number;
  avg_price: number | null;
  avg_price_per_m2: number | null;
  by_district: DistrictSummary[];
}

interface PriceTrend {
  month: string;
  avg_price: number | null;
}

export default function AnalyticsPage({ goBack }: { goBack: () => void }) {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [districtData, setDistrictData] = useState<any>(null);
  const [trends, setTrends] = useState<PriceTrend[]>([]);

  useEffect(() => {
    api.marketSummary().then(setSummary).catch(() => {});
    api.priceTrends().then(setTrends).catch(() => {});
  }, []);

  useEffect(() => {
    api.districtAnalytics(selectedDistrict).then(setDistrictData).catch(() => {});
  }, [selectedDistrict]);

  const formatPrice = (val: number | null) => {
    if (!val) return "\u2014";
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
          <BackButton onClick={goBack} />
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 size={24} className="text-green-600" />
          <h1 className="text-2xl font-extrabold text-gray-900">Bozor tahlili</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Home, label: "Jami e'lonlar", value: summary?.total_listings ?? "\u2014", color: "bg-blue-50 text-blue-600" },
            { icon: DollarSign, label: "O'rtacha narx", value: `$${formatPrice(summary?.avg_price ?? null)}`, color: "bg-green-50 text-green-600" },
            { icon: TrendingUp, label: "O'rtacha m² narxi", value: `$${formatPrice(summary?.avg_price_per_m2 ?? null)}`, color: "bg-amber-50 text-amber-600" },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon size={18} />
              </div>
              <div className="text-xs text-gray-500 mb-1">{card.label}</div>
              <div className="text-xl font-extrabold text-gray-900">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={15} className="text-green-600" /> Tumanlar bo'yicha
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(summary?.by_district ?? []).map((d) => (
                <div
                  key={d.district}
                  onClick={() => setSelectedDistrict(d.district)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedDistrict === d.district ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{d.district}</div>
                    <div className="text-xs text-gray-400">{d.listings_count} ta e'lon</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">${formatPrice(d.avg_price)}</div>
                    <div className="text-xs text-gray-400">${formatPrice(d.avg_price_per_m2)}/m²</div>
                  </div>
                </div>
              ))}
              {(summary?.by_district ?? []).length === 0 && (
                <div className="text-sm text-gray-400 text-center py-4">Ma'lumot yo'q</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1">{selectedDistrict} tumani</h2>
            <p className="text-xs text-gray-400 mb-4">Batafsil tahlil</p>
            {districtData ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">O'rtacha narx</div>
                    <div className="text-lg font-extrabold text-gray-900">${formatPrice(districtData.avg_price)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">O'rtacha m²</div>
                    <div className="text-lg font-extrabold text-gray-900">${formatPrice(districtData.avg_price_per_m2)}</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500">Jami e'lonlar</div>
                  <div className="text-lg font-extrabold text-gray-900">{districtData.listings_count}</div>
                </div>
                {(districtData.price_trends ?? []).length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Narx tendensiyasi</div>
                    <div className="flex items-end gap-1 h-20">
                      {districtData.price_trends.map((t: any, i: number) => {
                        const max = Math.max(...districtData.price_trends.map((x: any) => x.avg_price ?? 0));
                        const h = max > 0 ? ((t.avg_price ?? 0) / max) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-green-500 rounded-t"
                              style={{ height: `${Math.max(h, 2)}%` }}
                            />
                            <div className="text-[8px] text-gray-400 mt-1 -rotate-45 origin-left">
                              {t.month?.slice(5)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-8">Yuklanmoqda...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
