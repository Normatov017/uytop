import { useState, useEffect } from "react";
import { Plus, Settings, Eye, Edit, Trash2, Heart, Bell, BellOff, TrendingUp, BarChart3, Users, User, Upload, Check, CheckCircle, FileText, Bookmark, Search, Trash2 as Trash, ExternalLink, Clock, Star, Target } from "lucide-react";
import { api } from "../../lib/api";
import type { ApiUser } from "../../lib/types";
import type { Listing, Page } from "../types";
import { roleLabels, REGIONS } from "../types";
import PropertyCard from "../components/PropertyCard";
import { getRecentlyViewed, getPreferences, savePreferences, clearPreferences } from "../../lib/storage";
import type { BuyerPreferences } from "../../lib/storage";
import { t } from "../../lib/i18n";

export default function DashboardPage({
  onNav,
  listings,
  favorites,
  toggleFav,
  currentUser,
  onDelete,
}: {
  onNav: (p: Page, id?: number) => void;
  listings: Listing[];
  favorites: number[];
  toggleFav: (id: number) => void;
  currentUser: ApiUser | null;
  onDelete: (id: number) => void;
}) {
  const [tab, setTab] = useState<"buyer" | "listings" | "saved" | "alerts" | "analytics" | "profile" | "stats">("buyer");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [prefs, setPrefs] = useState<BuyerPreferences>(getPreferences());
  const [showPrefs, setShowPrefs] = useState(false);
  const [editPrefs, setEditPrefs] = useState<BuyerPreferences>({});
  const recentlyViewed = getRecentlyViewed();
  const [viewStatsMap, setViewStatsMap] = useState<Record<number, any>>({});

  useEffect(() => {
    if (localStorage.getItem(api.tokenKey)) {
      api.alerts().then(setAlerts).catch(() => {});
      api.agentAnalytics().then(setAnalytics).catch(() => {});
      api.agentLeaderboard().then(setLeaderboard).catch(() => {});
      api.savedSearches().then(setSavedSearches).catch(() => {});
      api.myReferralCode().then(r => setReferralCode(r.code)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (tab === "stats") {
      const fetchStats = async () => {
        const map: Record<number, any> = {};
        await Promise.all(myListings.map(async (l) => {
          try { map[l.id] = await api.viewStats(l.id); } catch {}
        }));
        setViewStatsMap(map);
      };
      fetchStats();
    }
  }, [tab, myListings]);

  const removeAlert = async (id: number) => {
    await api.deleteAlert(id);
    const d = await api.alerts();
    setAlerts(d);
  };
  const myListings = currentUser ? listings.filter((listing) => listing.ownerId === currentUser.id) : listings;

  const statuses = [
    { label: "Aktiv", cls: "bg-green-100 text-green-700", count: myListings.filter((l) => l.apiStatus === "active").length },
    { label: "Moderatsiyada", cls: "bg-amber-100 text-amber-700", count: myListings.filter((l) => l.apiStatus === "pending").length },
    { label: "Rad etilgan", cls: "bg-red-100 text-red-700", count: myListings.filter((l) => l.apiStatus === "rejected").length },
    { label: "Sotilgan", cls: "bg-gray-100 text-gray-500", count: myListings.filter((l) => l.apiStatus === "sold" || l.apiStatus === "rented").length },
  ];

  const rowStatus = (status: Listing["apiStatus"]) => {
    if (status === "pending") return { label: "Moderatsiyada", cls: "bg-amber-100 text-amber-700" };
    if (status === "rejected") return { label: "Rad etilgan", cls: "bg-red-100 text-red-700" };
    if (status === "sold" || status === "rented") return { label: "Yakunlangan", cls: "bg-gray-100 text-gray-500" };
    return { label: "Aktiv", cls: "bg-green-100 text-green-700" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
            {(currentUser?.full_name ?? "A")[0]}
          </div>
          <div className="flex-1">
            <h1 className="font-extrabold text-gray-900 text-lg">{currentUser?.full_name ?? "Mehmon"}</h1>
            <p className="text-sm text-gray-400">
              {currentUser ? `${currentUser.phone} · ${roleLabels[currentUser.role]} · Toshkent` : "Kirish orqali e'lonlaringizni boshqaring"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNav("add")}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Yangi e'lon
            </button>
            <button className="border border-gray-200 text-gray-500 hover:text-gray-700 p-2 rounded-xl transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
          {[
            ...((currentUser?.role === "USER" || !currentUser) ? [{ id: "buyer", label: "Xaridor" }] : []),
            { id: "listings", label: "E'lonlarim" },
            { id: "saved", label: "Saqlangan" },
            { id: "alerts", label: "Kuzatuv" },
            { id: "profile", label: t("profile") },
            { id: "stats", label: "Statistika" },
            ...((currentUser?.role === "AGENT" || currentUser?.role === "ADMIN") ? [{ id: "analytics", label: t("analytics") }] : []),
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "buyer" && (
          <div>
            {/* Preferences setup */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Target size={16} className="text-green-600" /> Qidiruv afzalliklari
                </h3>
                <button onClick={() => { setEditPrefs(prefs); setShowPrefs(true); }}
                  className="text-xs text-green-600 hover:text-green-700 font-semibold">
                  {prefs.region || prefs.budgetMin ? "O'zgartirish" : "Sozlash"}
                </button>
              </div>
              {prefs.region || prefs.budgetMin ? (
                <div className="flex flex-wrap gap-2">
                  {prefs.region && <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full">{prefs.region}</span>}
                  {prefs.district && <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full">{prefs.district}</span>}
                  {prefs.budgetMin && <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">${prefs.budgetMin.toLocaleString()} dan</span>}
                  {prefs.budgetMax && <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">${prefs.budgetMax.toLocaleString()} gacha</span>}
                  {prefs.rooms && <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full">{prefs.rooms} xona</span>}
                  {prefs.propertyType && <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full">{prefs.propertyType}</span>}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Afzalliklaringizni belgilang — shunda sizga mos e'lonlar avtomatik ko'rsatiladi</p>
              )}
            </div>

            {/* Preferences modal */}
            {showPrefs && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowPrefs(false)}>
                <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-900 mb-4">Qidiruv afzalliklari</h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Viloyat</label>
                      <select value={editPrefs.region || ""} onChange={(e) => setEditPrefs(p => ({ ...p, region: e.target.value, district: "" }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                        <option value="">Istalgan viloyat</option>
                        {Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Tuman</label>
                      <select value={editPrefs.district || ""} onChange={(e) => setEditPrefs(p => ({ ...p, district: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                        <option value="">Istalgan tuman</option>
                        {editPrefs.region && REGIONS[editPrefs.region]?.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Min narx ($)</label>
                        <input type="number" placeholder="0" value={editPrefs.budgetMin || ""} onChange={(e) => setEditPrefs(p => ({ ...p, budgetMin: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Max narx ($)</label>
                        <input type="number" placeholder="0" value={editPrefs.budgetMax || ""} onChange={(e) => setEditPrefs(p => ({ ...p, budgetMax: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Xonalar soni</label>
                        <select value={editPrefs.rooms || ""} onChange={(e) => setEditPrefs(p => ({ ...p, rooms: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                          <option value="">Istalgan</option>
                          {["1", "2", "3", "4+"].map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Mulk turi</label>
                        <select value={editPrefs.propertyType || ""} onChange={(e) => setEditPrefs(p => ({ ...p, propertyType: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                          <option value="">Istalgan</option>
                          <option>Kvartira</option>
                          <option>Uy</option>
                          <option>Yer</option>
                          <option>Tijoriy</option>
                          <option>Yangi bino</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { clearPreferences(); setPrefs({}); setShowPrefs(false); }}
                      className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors">
                      Tozalash
                    </button>
                    <button onClick={() => { savePreferences(editPrefs); setPrefs(editPrefs); setShowPrefs(false); }}
                      className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors">
                      Saqlash
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended */}
            {prefs.region || prefs.budgetMin ? (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Star size={15} className="text-green-600" /> Sizga mos e'lonlar
                </h3>
                {(() => {
                  const matched = listings.filter((l) => {
                    if (prefs.region && l.region !== prefs.region) return false;
                    if (prefs.district && l.district !== prefs.district) return false;
                    if (prefs.budgetMin && l.priceNum < prefs.budgetMin) return false;
                    if (prefs.budgetMax && l.priceNum > prefs.budgetMax) return false;
                    if (prefs.propertyType && l.type !== prefs.propertyType) return false;
                    if (prefs.rooms) {
                      const n = Number(prefs.rooms);
                      if (prefs.rooms === "4+" ? l.rooms < 4 : l.rooms !== n) return false;
                    }
                    return true;
                  });
                  return matched.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matched.slice(0, 6).map((l) => (
                        <PropertyCard key={l.id} listing={l} onView={() => onNav("detail", l.id)}
                          onFav={() => toggleFav(l.id)} isFav={favorites.includes(l.id)} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Afzalliklarga mos e'lon topilmadi</p>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 text-center border border-green-100">
                <Target size={32} className="text-green-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Qidiruv afzalliklaringizni belgilang</h3>
                <p className="text-sm text-gray-500 mb-4">Viloyat, narx oralig'i va boshqa parametrlarni sozlab, eng mos e'lonlarni toping</p>
                <button onClick={() => { setEditPrefs({}); setShowPrefs(true); }}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">
                  Afzalliklarni sozlash
                </button>
              </div>
            )}

            {/* Recently viewed */}
            {(() => {
              const recent = listings.filter((l) => recentlyViewed.includes(l.id));
              if (recent.length === 0) return null;
              return (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <Clock size={15} className="text-green-600" /> Yaqinda ko'rganlar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recent.slice(0, 6).map((l) => (
                      <PropertyCard key={l.id} listing={l} onView={() => onNav("detail", l.id)}
                        onFav={() => toggleFav(l.id)} isFav={favorites.includes(l.id)} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Price alerts summary */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
                <h3 className="font-bold text-gray-900 text-xs mb-3 flex items-center gap-2">
                  <Bell size={14} className="text-green-600" /> Narx kuzatuvi ({alerts.length})
                </h3>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate">{a.property_title}</span>
                      <span className="text-green-600 font-semibold shrink-0 ml-2">${Number(a.current_price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {alerts.length > 3 && (
                  <button onClick={() => setTab("alerts")} className="text-xs text-green-600 font-semibold mt-2">
                    Yana {alerts.length - 3} ta ko'rish
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "listings" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {statuses.map(({ label, cls, count }) => (
                <div key={label} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${cls}`}>
                  {label}
                  <span className="bg-white/60 rounded-full px-1.5">{count}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[t("listings"), t("price"), "Holat", t("views"), ""].map((h) => (
                      <th
                        key={h}
                        className={`text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 ${
                          [t("price"), t("views")].includes(h) ? "hidden md:table-cell" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myListings.map((l) => {
                    const s = rowStatus(l.apiStatus);
                    return (
                      <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={l.image}
                              alt=""
                              className="w-14 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900 line-clamp-1">{l.title}</div>
                              <div className="text-xs text-gray-400">{l.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm font-bold text-green-600">{l.price}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Eye size={13} /> {l.views}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onNav("detail", l.id)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={13} />
                            </button>
                            <button onClick={() => onNav("detail", l.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Edit size={13} />
                            </button>
                            {l.apiStatus !== "sold" && l.apiStatus !== "rented" && (
                              <button
                                onClick={async () => {
                                  const newStatus = l.status === "sotuv" ? "sold" : "rented";
                                  try {
                                    await api.moderateProperty(l.id, { status: newStatus as any });
                                    window.location.reload();
                                  } catch {}
                                }}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Yakunlash"
                              >
                                <CheckCircle size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(l.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "saved" && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center py-24">
                <Heart size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-700 mb-1">Saqlangan uylar yo'q</h3>
                <p className="text-sm text-gray-400 mb-5">E'lonlardagi yurak belgisini bosing</p>
                <button
                  onClick={() => onNav("listings")}
                  className="bg-green-600 text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  E'lonlarga o'tish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings
                  .filter((l) => favorites.includes(l.id))
                  .map((l) => (
                    <PropertyCard
                      key={l.id}
                      listing={l}
                      onView={() => onNav("detail", l.id)}
                      onFav={() => toggleFav(l.id)}
                      isFav={true}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {tab === "alerts" && (
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Bell size={16} className="text-green-600" /> Narx kuzatuvi
            </h3>
            {alerts.length === 0 ? (
              <div className="text-center py-16">
                <BellOff size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-700 mb-1">Kuzatuvda hech narsa yo'q</h3>
                <p className="text-sm text-gray-400">E'lon sahifasida "Kuzatuvga olish" tugmasi orqali qo'shing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((a: any) => (
                  <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-gray-900 truncate">{a.property_title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Joriy narx: <span className="font-bold text-gray-700">${Number(a.current_price).toLocaleString()}</span>
                        {a.target_price && <span className="ml-2">Maqsad: ${Number(a.target_price).toLocaleString()}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeAlert(a.id)}
                      className="shrink-0 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <BellOff size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "stats" && (
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{t("view_stats")}</h3>
            <p className="text-xs text-gray-400 mb-4">E'lonlaringiz necha marta ko'rilgani haqida ma'lumot</p>
            {myListings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Hali e'lon qo'shmagansiz</p>
            ) : (
              <div className="space-y-3">
                {myListings.map((l) => {
                  const s = viewStatsMap[l.id];
                  return (
                    <div key={l.id} className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <img src={l.image} alt="" className="w-16 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{l.title}</div>
                          {s ? (
                            <div className="flex flex-wrap gap-3 mt-1.5">
                              <span className="text-xs text-gray-500 flex items-center gap-1"><Eye size={12} /> {s.views_count} ko'rish</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={12} /> {s.unique_viewers} noyob</span>
                              <span className="text-xs text-gray-500">{s.phone_clicks} qo'ng'iroq</span>
                              <span className="text-xs text-gray-500">{s.telegram_clicks} telegram</span>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 mt-0.5">{l.views} ko'rish</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && currentUser && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <User size={16} className="text-green-600" /> Shaxsiy ma'lumotlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-gray-400 block mb-1">To'liq ism</label>
                <input defaultValue={currentUser.full_name}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Telefon</label>
                <input defaultValue={currentUser.phone} disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Email</label>
                <input defaultValue={currentUser.email}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Rol</label>
                <input value={roleLabels[currentUser.role]} disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400" />
              </div>
            </div>

            {/* Documents section for AGENT / OWNER */}
            {(currentUser.role === "AGENT" || currentUser.role === "OWNER") && (
              <div className="border-t border-gray-100 pt-5">
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-green-600" /> Hujjatlar
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                  Agent/developer sifatida ishonchliligingizni oshirish uchun hujjatlaringizni yuklang.
                </p>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                  <Upload size={32} className="text-gray-300 mx-auto mb-3" />
                  <div className="text-sm font-semibold text-gray-700">Hujjat yuklash</div>
                  <div className="text-xs text-gray-400 mt-1">Passport, litsenziya yoki guvohnoma</div>
                  <button className="mt-3 bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors">
                    Yuklash
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {[{ name: "Pasport nusxasi", status: "tekshirilmoqda" }, { name: "Rieltorlik guvohnomasi", status: "yuklanmagan" }].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={14} className="text-gray-400" />
                        <span className="text-gray-700">{doc.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === "tekshirilmoqda" ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500"
                      }`}>
                        {doc.status === "tekshirilmoqda" ? "Tekshirilmoqda" : "Yuklanmagan"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referral section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 mb-5">
              <h4 className="font-bold text-gray-900 mb-1">Do'stingizni taklif qiling</h4>
              <p className="text-xs text-gray-500 mb-3">Har bir taklif uchun bonus oling!</p>
              <div className="flex gap-2">
                <input readOnly value={referralCode ? `https://uymap.uz/ref/${referralCode}` : "Yuklanmoqda..."} className="flex-1 border border-green-200 rounded-xl px-3 py-2 text-sm bg-white" />
                <button onClick={() => { navigator.clipboard.writeText(`https://uymap.uz/ref/${referralCode}`); }} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">Nusxa</button>
              </div>
            </div>

            {/* Saved searches */}
            {savedSearches.length > 0 && (
              <div className="border-t border-gray-100 pt-5 mt-5">
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Bookmark size={16} className="text-green-600" /> Saqlangan qidiruvlar
                </h4>
                <div className="space-y-2">
                  {savedSearches.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {s.filters?.district && `${s.filters.district} · `}
                          {s.filters?.rooms && `${s.filters.rooms} xona · `}
                          {s.filters?.metro && `${s.filters.metro} metro`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => {
                          localStorage.setItem("uymap_applied_filters", JSON.stringify(s.filters || {}));
                          onNav("listings");
                        }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Qo'llash">
                          <Search size={13} />
                        </button>
                        <button onClick={() => { setSavedSearches(prev => prev.filter((x: any) => x.id !== s.id)); api.deleteSavedSearch(s.id).catch(() => {}); }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <div className="mb-4">
              <a
                href={api.reportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <FileText size={14} /> PDF hisobot yuklash
              </a>
            </div>
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Jami e'lonlar", value: analytics.total_listings, icon: BarChart3, color: "bg-blue-100 text-blue-600" },
                  { label: "Faol", value: analytics.active_listings, icon: TrendingUp, color: "bg-green-100 text-green-600" },
                  { label: "Sotilgan", value: analytics.sold_listings, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
                  { label: "Konversiya", value: `${analytics.conversion_rate}%`, icon: TrendingUp, color: "bg-amber-100 text-amber-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                        <Icon size={15} />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                  <Users size={16} className="text-green-600" /> Rieltorlar reytingi
                </h3>
                <div className="space-y-2">
                  {leaderboard.map((agent: any, i: number) => (
                    <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="w-6 text-center text-sm font-extrabold text-gray-300">#{i + 1}</span>
                      <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        {agent.full_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{agent.full_name}</div>
                        <div className="text-xs text-gray-400">{agent.active_listings} faol · {agent.sold_listings} sotilgan</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-green-600">{agent.score}</div>
                        <div className="text-[10px] text-gray-400">ball</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
