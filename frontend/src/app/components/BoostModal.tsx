import { useState } from "react";
import { X, TrendingUp, Zap } from "lucide-react";
import { api } from "../../lib/api";

interface BoostModalProps {
  propertyId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BOOST_PLANS = [
  { days: 7, price: 5, label: "1 hafta" },
  { days: 14, price: 9, label: "2 hafta" },
  { days: 30, price: 15, label: "1 oy" },
];

export default function BoostModal({ propertyId, onClose, onSuccess }: BoostModalProps) {
  const [selected, setSelected] = useState(BOOST_PLANS[0]);
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    setLoading(true);
    try {
      await api.createBoost(propertyId, selected.days, selected.price);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <h3 className="font-bold text-gray-900">Reklama qilish</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          E'loningizni yuqori o'rinlarga chiqarib, ko'proq xaridorlarni jalb qiling
        </p>
        <div className="space-y-2 mb-5">
          {BOOST_PLANS.map((plan) => (
            <button
              key={plan.days}
              onClick={() => setSelected(plan)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                selected.days === plan.days
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
              <span className="font-medium text-sm text-gray-800">{plan.label}</span>
              <span className="text-sm font-bold text-green-600">${plan.price}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleBoost}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <TrendingUp size={15} />
          {loading ? "Jarayon..." : `Reklama qilish $${selected.price}`}
        </button>
      </div>
    </div>
  );
}
