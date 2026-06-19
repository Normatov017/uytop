import { useState, useEffect } from "react";
import { Plus, MapPin, Phone, MessageCircle, Clock, Search, X } from "lucide-react";
import type { Page } from "../types";
import { REGIONS } from "../types";
import type { ApiUser } from "../../lib/types";

interface WantedAd {
  id: number;
  region: string;
  district: string;
  rooms: string;
  budgetMin: string;
  budgetMax: string;
  description: string;
  contactPhone: string;
  userName: string;
  createdAt: string;
  responses: number;
}

export default function WantedBoardPage({
  onNav,
  currentUser,
}: {
  onNav: (p: Page) => void;
  currentUser: ApiUser | null;
}) {
  const [ads, setAds] = useState<WantedAd[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [rooms, setRooms] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("uymap_wanted_ads");
      if (stored) setAds(JSON.parse(stored));
    } catch {}
  }, []);

  const saveAds = (newAds: WantedAd[]) => {
    setAds(newAds);
    localStorage.setItem("uymap_wanted_ads", JSON.stringify(newAds));
  };

  const handleSubmit = () => {
    if (!region || !rooms) return;
    const newAd: WantedAd = {
      id: Date.now(),
      region,
      district,
      rooms,
      budgetMin,
      budgetMax,
      description,
      contactPhone: contactPhone || currentUser?.phone || "",
      userName: currentUser?.full_name || "Mehmon",
      createdAt: new Date().toISOString(),
      responses: 0,
    };
    saveAds([newAd, ...ads]);
    setShowForm(false);
    setRegion(""); setDistrict(""); setRooms("");
    setBudgetMin(""); setBudgetMax("");
    setDescription(""); setContactPhone("");
  };

  const getTitle = (ad: WantedAd) => {
    const parts = [];
    if (ad.rooms) parts.push(`${ad.rooms} xona`);
    if (ad.region) parts.push(ad.region);
    if (ad.district) parts.push(ad.district);
    if (ad.budgetMin || ad.budgetMax) {
      const range = [];
      if (ad.budgetMin) range.push(`$${Number(ad.budgetMin).toLocaleString()}`);
      if (ad.budgetMax) range.push(`$${Number(ad.budgetMax).toLocaleString()}`);
      parts.push(range.join(" - "));
    }
    return parts.join(", ") || "Qidiruv e'loni";
  };

  const isLoggedIn = !!currentUser;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Men qidiryapman</h1>
            <p className="text-sm text-gray-400">E'lon doskasi — qidirayotgan uyingizni topishga yordam bering</p>
          </div>
          {isLoggedIn && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
              <Plus size={14} /> E'lon berish
            </button>
          )}
          {!isLoggedIn && (
            <button onClick={() => onNav("login")}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
              E'lon berish uchun kiring
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Yangi qidiruv e'loni</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Viloyat</label>
                <select value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                  <option value="">Tanlang</option>
                  {Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Tuman</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                  <option value="">Tanlang</option>
                  {region && REGIONS[region]?.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Xonalar</label>
                <select value={rooms} onChange={(e) => setRooms(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                  <option value="">Tanlang</option>
                  {["1", "2", "3", "4", "5+"].map((r) => <option key={r}>{r} xona</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Min budjet ($)</label>
                  <input type="number" placeholder="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Max budjet ($)</label>
                  <input type="number" placeholder="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Tavsif</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Qanday uy qidiryapsiz?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none" />
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Telefon (aloqa uchun)</label>
              <input type="tel" placeholder={currentUser?.phone || "+998 XX XXX XX XX"} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors">Bekor qilish</button>
              <button onClick={handleSubmit} disabled={!region || !rooms}
                className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">E'lonni joylash</button>
            </div>
          </div>
        )}

        {ads.length === 0 ? (
          <div className="text-center py-24">
            <Search size={44} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 mb-1">Hali e'lonlar yo'q</h3>
            <p className="text-sm text-gray-400">Birinchisiz bo'ling!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{getTitle(ad)}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ad.region && <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full">{ad.region}</span>}
                      {ad.district && <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">{ad.district}</span>}
                      {ad.rooms && <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full">{ad.rooms} xona</span>}
                      {ad.budgetMin && <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full">${Number(ad.budgetMin).toLocaleString()}</span>}
                      {ad.budgetMax && <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full">${Number(ad.budgetMax).toLocaleString()}</span>}
                    </div>
                    {ad.description && <p className="text-sm text-gray-600 mt-2">{ad.description}</p>}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ad.createdAt).toLocaleDateString("uz")}</span>
                      <span>Javoblar: {ad.responses}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2">
                    <a href={`tel:${ad.contactPhone}`}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                      <Phone size={12} /> Bog'lanish
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
