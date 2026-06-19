import { useState } from "react";
import { X, Zap } from "lucide-react";
import { api } from "../../lib/api";

interface BoostModalProps {
  propertyId: number;
  onClose: () => void;
  onBoosted: () => void;
}

const PRICES = [
  { days: 7, price: 5, label: "1 hafta", popular: false },
  { days: 14, price: 8, label: "2 hafta", popular: true },
  { days: 30, price: 12, label: "1 oy", popular: false },
  { days: 60, price: 20, label: "2 oy", popular: false },
];

export default function BoostModal({ propertyId, onClose, onBoosted }: BoostModalProps) {
  const [selected, setSelected] = useState(PRICES[1]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleBoost = async () => {
    setLoading(true);
    try {
      await api.createBoost(propertyId, selected.days, selected.price);
      setDone(true);
      onBoosted();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reklama faollashtirildi!</h3>
            <p className="text-sm text-gray-500 mb-4">E'loningiz {selected.days} kun davomida yuqori o'rinda ko'rinadi</p>
            <button onClick={onClose} className="bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl">Yopish</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900">E'lonni reklama qilish</h3>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">E'loningizni yuqori o'rinlarga chiqarib, ko'proq xaridorlarni jalb qiling</p>
            <div className="space-y-2 mb-4">
              {PRICES.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setSelected(p)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                    selected.days === p.days ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-gray-900">{p.label}</span>
                    {p.popular && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full ml-2">Ommabop</span>}
                  </div>
                  <span className="font-bold text-green-600">${p.price}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleBoost}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={16} /> {loading ? "Yuklanmoqda..." : `$${selected.price} to'lash`}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-3">To'lov tizimi hozircha demo rejimda</p>
          </>
        )}
      </div>
    </div>
  );
}
