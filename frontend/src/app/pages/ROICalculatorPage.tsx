import { useState } from "react";
import { TrendingUp, DollarSign, Calendar, Banknote, Percent, ArrowRight } from "lucide-react";
import type { Page } from "../types";

export default function ROICalculatorPage({ onNav }: { onNav: (p: Page) => void }) {
  const [price, setPrice] = useState(80000);
  const [renovation, setRenovation] = useState(5000);
  const [rentPrice, setRentPrice] = useState(500);
  const [occupancy, setOccupancy] = useState(80);
  const [currency, setCurrency] = useState<"USD" | "UZS">("USD");
  const [depositRate, setDepositRate] = useState(18);

  const USD_TO_UZS = 12700;
  const mul = currency === "USD" ? 1 : USD_TO_UZS;

  const totalCost = (price + renovation) * mul;
  const annualRent = rentPrice * mul * 12 * (occupancy / 100);
  const monthlyRent = rentPrice * mul * (occupancy / 100);
  const annualROI = totalCost > 0 ? (annualRent / totalCost) * 100 : 0;
  const paybackYears = annualRent > 0 ? totalCost / annualRent : 0;
  const netAnnual = annualRent - (totalCost * 0.01);
  const depositReturn = totalCost * (depositRate / 100);

  const format = (v: number) =>
    currency === "USD"
      ? `$${Math.round(v).toLocaleString("en-US")}`
      : `${Math.round(v).toLocaleString("en-US")} so'm`;

  const better = annualRent > depositReturn;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Investitsiya ROI kalkulyatori</h1>
            <p className="text-sm text-gray-400">Mulk ijaraga berish daromadini hisoblang</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <DollarSign size={16} className="text-green-600" /> Mulk narxi va xarajatlar
              </h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Mulk narxi</span>
                  <span className="font-bold text-gray-900">{format(price * mul)}</span>
                </div>
                <input type="range" min={10000} max={500000} step={1000} value={price}
                  onChange={e => setPrice(Number(e.target.value))} className="w-full accent-green-600" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>$10k</span><span>$500k</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Ta'mirlash xarajati</span>
                  <span className="font-bold text-gray-900">{format(renovation * mul)}</span>
                </div>
                <input type="range" min={0} max={50000} step={500} value={renovation}
                  onChange={e => setRenovation(Number(e.target.value))} className="w-full accent-green-600" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>$0</span><span>$50k</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setCurrency("USD")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${currency === "USD" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>USD ($)</button>
                <button onClick={() => setCurrency("UZS")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${currency === "UZS" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>UZS (so'm)</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <Banknote size={16} className="text-green-600" /> Ijara daromadi
              </h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Oylik ijara narxi</span>
                  <span className="font-bold text-gray-900">{format(rentPrice * mul)}</span>
                </div>
                <input type="range" min={100} max={3000} step={50} value={rentPrice}
                  onChange={e => setRentPrice(Number(e.target.value))} className="w-full accent-green-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">To'ldirilganlik darajasi</span>
                  <span className="font-bold text-gray-900">{occupancy}%</span>
                </div>
                <input type="range" min={30} max={100} step={5} value={occupancy}
                  onChange={e => setOccupancy(Number(e.target.value))} className="w-full accent-green-600" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>30%</span><span>100%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <Percent size={16} className="text-green-600" /> Bank depoziti bilan solishtirish
              </h2>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Depozit foizi</span>
                  <span className="font-bold text-gray-900">{depositRate}%</span>
                </div>
                <input type="range" min={5} max={30} step={0.5} value={depositRate}
                  onChange={e => setDepositRate(Number(e.target.value))} className="w-full accent-green-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
              <h2 className="font-bold text-gray-900 mb-5 text-sm">Natijalar</h2>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white mb-5">
                <div className="text-xs text-green-100 mb-1">Yillik ROI</div>
                <div className="text-3xl font-extrabold">{annualROI.toFixed(1)}%</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Jami xarajat</span>
                  <span className="font-bold text-gray-900">{format(totalCost)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Oylik ijara (o'rtacha)</span>
                  <span className="font-bold text-gray-900">{format(monthlyRent)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Yillik ijara daromadi</span>
                  <span className="font-bold text-green-600">{format(annualRent)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Sof yillik daromad</span>
                  <span className="font-bold text-green-600">{format(netAnnual)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Qoplanish muddati</span>
                  <span className="font-bold text-gray-900">{paybackYears.toFixed(1)} yil</span>
                </div>
              </div>

              {/* Compare with bank deposit */}
              <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-xs font-bold text-gray-700 mb-3">Mulk ijarasi vs Bank depoziti</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center">
                    <div className="text-lg font-extrabold text-green-600">{annualROI.toFixed(1)}%</div>
                    <div className="text-[10px] text-gray-400">Mulk ROI</div>
                  </div>
                  <ArrowRight size={16} className="text-gray-300" />
                  <div className="flex-1 text-center">
                    <div className="text-lg font-extrabold text-amber-600">{depositRate}%</div>
                    <div className="text-[10px] text-gray-400">Depozit</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  {better ? (
                    <span className="text-xs font-bold text-green-600">✅ Mulk ijarasi foydaliroq</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600">⚠️ Bank depoziti foydaliroq</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
