import { useEffect, useState } from "react";
import { Calendar, Check, X, Clock, CreditCard } from "lucide-react";
import { api } from "../../lib/api";
import type { Page } from "../types";

interface Booking {
  id: number; property_id: number; property_title: string;
  status: string; deposit_amount: number | null; deposit_paid: boolean;
  days: number; expires_at: string;
}

const statusStyles: Record<string, { label: string; color: string }> = {
  pending: { label: "Kutilmoqda", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Tasdiqlangan", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Bekor qilingan", color: "bg-red-100 text-red-700" },
  expired: { label: "Muddati o'tgan", color: "bg-gray-100 text-gray-500" },
};

export default function BookingsPage({ onNav }: { onNav: (p: Page) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bookings().then(d => { setBookings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const pay = async (id: number) => {
    await api.payDeposit(id);
    const d = await api.bookings();
    setBookings(d);
  };

  const cancel = async (id: number) => {
    await api.cancelBooking(id);
    const d = await api.bookings();
    setBookings(d);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mening bronlarim</h1>
        </div>

        {bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
            <div className="text-gray-500 text-sm">Hali bronlar yo'q</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {bookings.map(b => {
            const st = statusStyles[b.status] || { label: b.status, color: "bg-gray-100 text-gray-500" };
            const expired = new Date(b.expires_at) < new Date();
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 truncate">{b.property_title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      {expired && b.status === "pending" && (
                        <span className="text-[10px] text-red-500 font-medium">Muddati o'tgan</span>
                      )}
                    </div>
                    {b.deposit_amount && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Depozit: </span>
                        <span className="font-bold text-gray-900">${b.deposit_amount.toLocaleString()}</span>
                        {b.deposit_paid && <span className="text-green-600 text-xs ml-1">✓ To'langan</span>}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Muddat: {new Date(b.expires_at).toLocaleDateString("uz")}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    {b.status === "pending" && !b.deposit_paid && (
                      <button onClick={() => pay(b.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors">
                        <CreditCard size={12} /> To'lash
                      </button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <button onClick={() => cancel(b.id)}
                        className="flex items-center gap-1 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">
                        <X size={12} /> Bekor qilish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
