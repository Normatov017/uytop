import { useState } from "react";
import { MapPin, ChevronDown, Star, Target, ArrowRight, Check } from "lucide-react";
import { api } from "../../lib/api";
import type { ApiUser, UserRole } from "../../lib/types";
import type { Page } from "../types";
import { REGIONS } from "../types";
import { savePreferences } from "../../lib/storage";
import type { BuyerPreferences } from "../../lib/storage";
import { t } from "../../lib/i18n";

export default function RegisterPage({ onNav, onAuth }: { onNav: (p: Page) => void; onAuth: (user: ApiUser) => void }) {
  const [step, setStep] = useState<"register" | "onboarding">("register");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<BuyerPreferences>({});
  const [onboardStep, setOnboardStep] = useState(0);

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
      if (role === "user" || !role) {
        setStep("onboarding");
      } else {
        onNav("listings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const onboardPages = [
    {
      title: "Qanday uy qidiryapsiz?",
      icon: Target,
      content: (
        <div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {["Kvartira", "Uy", "Yer", "Tijoriy"].map((t) => (
              <button key={t} onClick={() => setPrefs(p => ({ ...p, propertyType: t }))}
                className={`border-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
                  prefs.propertyType === t ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-300"
                }`}>{t}</button>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Nechta xona?</label>
            <div className="grid grid-cols-4 gap-2">
              {["1", "2", "3", "4+"].map((r) => (
                <button key={r} onClick={() => setPrefs(p => ({ ...p, rooms: r }))}
                  className={`border-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
                    prefs.rooms === r ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-300"
                  }`}>{r}</button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Qayerdan uy qidiryapsiz?",
      icon: MapPin,
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Viloyat</label>
            <select value={prefs.region || ""} onChange={(e) => setPrefs(p => ({ ...p, region: e.target.value, district: "" }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white appearance-none cursor-pointer">
              <option value="">Istalgan viloyat</option>
              {Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Tuman</label>
            <select value={prefs.district || ""} onChange={(e) => setPrefs(p => ({ ...p, district: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white appearance-none cursor-pointer">
              <option value="">Istalgan tuman</option>
              {prefs.region && REGIONS[prefs.region]?.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Budjetingiz qancha?",
      icon: Star,
      content: (
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Minimal ($)</label>
              <input type="number" placeholder="0" value={prefs.budgetMin || ""}
                onChange={(e) => setPrefs(p => ({ ...p, budgetMin: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Maksimal ($)</label>
              <input type="number" placeholder="0" value={prefs.budgetMax || ""}
                onChange={(e) => setPrefs(p => ({ ...p, budgetMax: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Bu ma'lumotlar faqat mos e'lonlarni topish uchun ishlatiladi</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {step === "register" ? "Ro'yxatdan o'ting" : "Qidiruvni sozlash"}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            {step === "register" ? "Ma'lumotlaringizni to'ldiring" : "Sizga mos e'lonlarni topamiz"}
          </p>
        </div>

        {step === "register" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-7">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Telefon raqam</label>
                <div className="flex gap-2">
                  <div className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 bg-gray-50 font-medium">+998</div>
                  <input type="tel" placeholder="90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Ism</label>
                <input type="text" placeholder="To'liq ismingiz" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
                <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Parol</label>
                <input type="password" placeholder="Kamida 8 belgi" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors" />
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
                    <button key={v} onClick={() => setRole(v)}
                      className={`border-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                        role === v ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-300"
                      }`}>{l}</button>
                  ))}
                </div>
              </div>
              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                {loading ? "Yaratilmoqda..." : t("register")}
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-5">
              Hisobingiz bormi?{" "}
              <button onClick={() => onNav("login")} className="text-green-600 font-bold hover:text-green-700">{t("login")}</button>
            </p>
          </div>
        )}

        {step === "onboarding" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-7">
            <div className="flex items-center justify-center gap-1 mb-5">
              {onboardPages.map((_, i) => (
                <div key={i} className={`h-1.5 w-10 rounded-full transition-colors ${i <= onboardStep ? "bg-green-600" : "bg-gray-200"}`} />
              ))}
            </div>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                {(() => { const Icon = onboardPages[onboardStep].icon; return <Icon size={22} className="text-green-600" />; })()}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{onboardPages[onboardStep].title}</h2>
            </div>
            {onboardPages[onboardStep].content}
            <div className="flex gap-2 mt-6">
              <button onClick={() => { savePreferences(prefs); onNav("listings"); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                O'tkazib yuborish
              </button>
              <button onClick={() => {
                if (onboardStep < onboardPages.length - 1) {
                  setOnboardStep(s => s + 1);
                } else {
                  savePreferences(prefs);
                  onNav("listings");
                }
              }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {onboardStep < onboardPages.length - 1 ? <>Davom etish <ArrowRight size={15} /></> : "Tayyor"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
