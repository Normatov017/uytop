import { useState } from "react";
import { MapPin } from "lucide-react";
import { api } from "../../lib/api";
import type { ApiUser, UserRole } from "../../lib/types";
import type { Page } from "../types";
import { t } from "../../lib/i18n";

export default function RegisterPage({ onNav, onAuth }: { onNav: (p: Page) => void; onAuth: (user: ApiUser) => void }) {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleMap: Record<string, UserRole> = {
    user: "USER",
    owner: "OWNER",
    agent: "AGENT",
    developer: "DEVELOPER",
  };

  const normalizedPhone = phone.startsWith("+998") ? phone : `+998${phone.replace(/\D/g, "")}`;

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.register({
        full_name: fullName,
        phone: normalizedPhone,
        email,
        password,
        role: roleMap[role] ?? "USER",
      });
      api.saveToken(result.access_token);
      onAuth(result.user);
      onNav("listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Ro'yxatdan o'ting</h1>
          <p className="text-sm text-gray-500 mt-1.5">Ma'lumotlaringizni to'ldiring</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-7">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Telefon raqam</label>
              <div className="flex gap-2">
                <div className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 bg-gray-50 font-medium">+998</div>
                <input
                  type="tel"
                  placeholder="90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Ism</label>
              <input
                type="text"
                placeholder="To'liq ismingiz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Parol</label>
              <input
                type="password"
                placeholder="Kamida 8 belgi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Siz kimsiiz?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: "user", l: "Xaridor" },
                  { v: "owner", l: "Uy egasi" },
                  { v: "agent", l: "Agent" },
                  { v: "developer", l: "Qurilish kompaniyasi" },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setRole(v)}
                    className={`border-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                      role === v
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-green-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "Yaratilmoqda..." : t("register")}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Hisobingiz bormi?{" "}
            <button onClick={() => onNav("login")} className="text-green-600 font-bold hover:text-green-700">
              {t("login")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
