import { useState, useMemo } from "react";
import { Calculator, DollarSign, Landmark, Calendar, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import type { Page } from "../types";

const BANKS = [
  { name: "Ipoteka bank", rate: 14 },
  { name: "Agrobank", rate: 15 },
  { name: "Qishloq qurilish banki", rate: 16 },
  { name: "Tijorat banklari", rate: 22 },
];

const USD_TO_UZS = 12700;
const MIN_PRICE_USD = 10000;
const MAX_PRICE_USD = 500000;

function annuityPayment(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return principal * (monthlyRate * factor) / (factor - 1);
}

export default function CalculatorPage({ onNav }: { onNav: (p: Page) => void }) {
  const [priceUsd, setPriceUsd] = useState(80000);
  const [downPercent, setDownPercent] = useState(20);
  const [years, setYears] = useState(10);
  const [selectedBank, setSelectedBank] = useState("Ipoteka bank");
  const [customRate, setCustomRate] = useState("");
  const [currency, setCurrency] = useState<"USD" | "UZS">("USD");
  const [showTable, setShowTable] = useState(false);

  const price = currency === "USD" ? priceUsd : priceUsd * USD_TO_UZS;
  const annualRate = selectedBank === "custom" ? Number(customRate) || 0 : BANKS.find(b => b.name === selectedBank)?.rate ?? 14;
  const downPayment = price * downPercent / 100;
  const principal = price - downPayment;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  const monthly = annuityPayment(principal, monthlyRate, months);
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;

  const schedule = useMemo(() => {
    if (!monthly || !isFinite(monthly)) return [];
    const rows = [];
    let balance = principal;
    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interestPart = balance * monthlyRate;
        const principalPart = monthly - interestPart;
        yearInterest += interestPart;
        yearPrincipal += Math.min(principalPart, balance);
        balance -= principalPart;
        if (balance < 0) balance = 0;
      }
      rows.push({ year: y, monthly: monthly, principal: yearPrincipal, interest: yearInterest, balance: Math.max(0, balance) });
      if (balance <= 0) break;
    }
    return rows;
  }, [principal, monthlyRate, months, monthly, years]);

  const formatMoney = (v: number) =>
    currency === "USD"
      ? `$${Math.round(v).toLocaleString("en-US")}`
      : `${Math.round(v).toLocaleString("en-US")} so'm`;

  const principalPct = totalPayment > 0 ? (principal / totalPayment) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Calculator size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Ipoteka kalkulyatori</h1>
            <p className="text-sm text-gray-400">Oylik to'lovni hisoblang va banklarni solishtiring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <DollarSign size={16} className="text-green-600" /> Mulk narxi
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{currency === "USD" ? "USD" : "UZS"}</span>
                <span className="text-lg font-extrabold text-green-600">{formatMoney(price)}</span>
              </div>
              <input
                type="range"
                min={MIN_PRICE_USD}
                max={MAX_PRICE_USD}
                step={1000}
                value={priceUsd}
                onChange={(e) => setPriceUsd(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>${(MIN_PRICE_USD / 1000).toFixed(0)}k</span>
                <span>${(MAX_PRICE_USD / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setCurrency("USD")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${currency === "USD" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setCurrency("UZS")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${currency === "UZS" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}
                >
                  UZS (so'm)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <Landmark size={16} className="text-green-600" /> Boshlang'ich to'lov
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{downPercent}%</span>
                <span className="text-lg font-extrabold text-gray-900">{formatMoney(downPayment)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={downPercent}
                onChange={(e) => setDownPercent(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>60%</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-green-600" /> Kredit muddati
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{years} yil</span>
                <span className="text-lg font-extrabold text-gray-900">{months} oy</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 yil</span>
                <span>25 yil</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                <BarChart3 size={16} className="text-green-600" /> Bank foiz stavkasi
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {BANKS.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => { setSelectedBank(b.name); setCustomRate(""); }}
                    className={`border-2 rounded-xl py-3 px-3 text-left transition-all ${selectedBank === b.name ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                  >
                    <div className="text-xs font-semibold text-gray-900">{b.name}</div>
                    <div className="text-sm font-extrabold text-green-600">{b.rate}%</div>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedBank("custom")}
                  className={`border-2 rounded-xl py-3 px-3 text-left transition-all ${selectedBank === "custom" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                >
                  <div className="text-xs font-semibold text-gray-900">Ixtiyoriy</div>
                  <div className="text-sm font-extrabold text-green-600">{customRate || "—"}%</div>
                </button>
              </div>
              {selectedBank === "custom" && (
                <input
                  type="number"
                  placeholder="Foiz stavkasini kiriting"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                />
              )}
            </div>
          </div>

          {/* Right — results */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
              <h2 className="font-bold text-gray-900 mb-5 text-sm">Hisoblash natijalari</h2>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white mb-5">
                <div className="text-xs text-green-100 mb-1">Oylik to'lov</div>
                <div className="text-3xl font-extrabold">{isFinite(monthly) ? formatMoney(monthly) : "—"}</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Kredit summasi</span>
                  <span className="font-bold text-gray-900">{formatMoney(principal)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Boshlang'ich to'lov</span>
                  <span className="font-bold text-gray-900">{formatMoney(downPayment)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Jami to'lov</span>
                  <span className="font-bold text-gray-900">{isFinite(totalPayment) ? formatMoney(totalPayment) : "—"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Foiz xarajati</span>
                  <span className="font-bold text-amber-600">{isFinite(totalInterest) ? formatMoney(totalInterest) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Yillik foiz</span>
                  <span className="font-bold text-gray-900">{annualRate}%</span>
                </div>
              </div>

              {/* Principal vs Interest bar */}
              {isFinite(totalPayment) && totalPayment > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Asosiy qarz ({principalPct.toFixed(0)}%)</span>
                    <span>Foiz ({(100 - principalPct).toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: `${principalPct}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Yearly schedule */}
        {schedule.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-6">
            <button
              onClick={() => setShowTable(!showTable)}
              className="flex items-center justify-between w-full"
            >
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <BarChart3 size={16} className="text-green-600" /> Yillik to'lov jadvali
              </h2>
              {showTable ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {showTable && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-3 py-2 font-bold text-gray-400 uppercase tracking-wider">Yil</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-400 uppercase tracking-wider">Oylik to'lov</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-400 uppercase tracking-wider">Asosiy qarz</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-400 uppercase tracking-wider">Foiz</th>
                      <th className="text-right px-3 py-2 font-bold text-gray-400 uppercase tracking-wider">Qoldiq</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.year} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-gray-900">{row.year}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-gray-900">{formatMoney(row.monthly)}</td>
                        <td className="px-3 py-2.5 text-right text-green-600 font-medium">{formatMoney(row.principal)}</td>
                        <td className="px-3 py-2.5 text-right text-amber-600 font-medium">{formatMoney(row.interest)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-500">{formatMoney(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
