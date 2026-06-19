import { useState, useEffect } from "react";
import { TrendingUp, MapPin, DollarSign, Home, BarChart3 } from "lucide-react";
import { api } from "../../lib/api";
import type { MarketSummary, DistrictAnalytics, PriceTrend } from "../../lib/types";
import type { Page } from "../types";
import { DISTRICTS } from "../types";
import { t } from "../../lib/i18n";

export default function AnalyticsPage({ onNav }: { onNav: (p: Page) => void }) {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [districtData, setDistrictData] = useState<DistrictAnalytics | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [trends, setTrends] = useState<PriceTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.marketSummary(),
      api.priceTrends(),
      api.districtAnalytics(selectedDistrict),
    ]).then(([s, t, d]) => {
      setSummary(s);
      setTrends(t);
      setDistrictData(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.districtAnalytics(selectedDistrict).then(setDistrictData).catch(() => {});
  }, [selectedDistrict]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Bozor analitikasi</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <Home size={18} className="text-green-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{summary?.total_listings ?? 0}</div>
            <div className="text-xs text-gray-500">Jami e'lonlar</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <DollarSign size={18} className="text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{summary?.avg_price ? `$${Math.round(summary.avg_price).toLocaleString()}` : "—"}</div>
            <div className="text-xs text-gray-500">O'rtacha narx</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <BarChart3 size={18} className="text-amber-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{summary?.avg_price_per_m2 ? `$${Math.round(summary.avg_price_per_m2)}` : "—"}</div>
            <div className="text-xs text-gray-500">$ / m²</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <TrendingUp size={18} className="text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{districtData?.listings_count ?? 0}</div>
            <div className="text-xs text-gray-500">{selectedDistrict} da</div>
          </div>
        </div>

        {/* District breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Tumanlar bo'yicha</h2>
          <div className="space-y-1">
            {summary?.by_district.map((d) => (
              <button
                key={d.district}
                onClick={() => setSelectedDistrict(d.district)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  selectedDistrict === d.district ? "bg-green-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="font-medium text-gray-900 text-sm">{d.district}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 text-sm">{d.avg_price ? `$${Math.round(d.avg_price).toLocaleString()}` : "—"}</span>
                  <span className="text-xs text-gray-400 ml-2">({d.listings_count})</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* District detail */}
        {districtData && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1">{districtData.district} tumani tahlili</h2>
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{districtData.avg_price ? `$${Math.round(districtData.avg_price).toLocaleString()}` : "—"}</div>
                <div className="text-[10px] text-gray-500">O'rtacha narx</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{districtData.avg_price_per_m2 ? `$${Math.round(districtData.avg_price_per_m2)}` : "—"}</div>
                <div className="text-[10px] text-gray-500">$ / m²</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{districtData.listings_count}</div>
                <div className="text-[10px] text-gray-500">{t("listings")}</div>
              </div>
            </div>
            {districtData.price_trends.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Narx trendi (12 oy)</h3>
                <div className="flex items-end gap-1 h-28">
                  {districtData.price_trends.map((t, i) => {
                    const max = Math.max(...districtData.price_trends.map(x => x.avg_price ?? 0));
                    const h = max > 0 ? ((t.avg_price ?? 0) / max) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-green-500 rounded-t min-h-[2px]" style={{ height: `${h}%` }} title={`${t.month}: $${Math.round(t.avg_price ?? 0).toLocaleString()}`} />
                        <span className="text-[8px] text-gray-400 mt-1">{t.month.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overall trend */}
        {trends.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Umumiy narx trendi</h2>
            <div className="flex items-end gap-1 h-36">
              {trends.map((t, i) => {
                const max = Math.max(...trends.map(x => x.avg_price ?? 0));
                const h = max > 0 ? ((t.avg_price ?? 0) / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[2px]" style={{ height: `${h}%` }} title={`${t.month}: $${Math.round(t.avg_price ?? 0).toLocaleString()}`} />
                    <span className="text-[8px] text-gray-400 mt-1">{t.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
