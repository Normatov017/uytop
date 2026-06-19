import { useEffect, useState } from "react";
import {
  Building, CheckCircle, Clock, Users, User, TrendingUp, MapPin, Bell, LogOut,
  Check, X, Shield, Eye, Building2, FileText, Upload,
} from "lucide-react";
import { api } from "../../lib/api";
import type { AdminStats, ApiProperty, ApiUser } from "../../lib/types";
import type { Listing, Page } from "../types";
import { roleLabels } from "../types";
import { toListing } from "../utils";
import { t } from "../../lib/i18n";

export default function AdminPage({
  onNav,
  listings,
}: {
  onNav: (p: Page) => void;
  listings: Listing[];
}) {
  const [activeTab, setActiveTab] = useState("pending");
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [usersData, setUsersData] = useState<ApiUser[]>([]);
  const [adminListings, setAdminListings] = useState<Listing[]>([]);
  const [modError, setModError] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    api.adminStats().then(setStatsData).catch(() => undefined);
    api.adminUsers().then(setUsersData).catch(() => undefined);
    api.adminProperties()
      .then((props) => setAdminListings(props.map(toListing)))
      .catch(() => undefined);
    api.adminCompanies().then(setCompanies).catch(() => undefined);
  }, []);

  const handleVerifyCompany = async (id: number, verify: boolean) => {
    try {
      if (verify) await api.verifyCompany(id);
      else await api.unverifyCompany(id);
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, is_verified: verify } : c));
    } catch { alert("Xatolik yuz berdi"); }
  };

  const handleModerate = async (id: number, payload: { status: ApiProperty["status"]; is_verified?: boolean; is_premium?: boolean }) => {
    setModError("");
    try {
      const property = await api.moderateProperty(id, payload);
      const updated = toListing(property);
      setAdminListings((prev) => prev.map((listing) => (listing.id === id ? updated : listing)));
    } catch (err) {
      setModError(err instanceof Error ? err.message : "Moderatsiya xatosi");
    }
  };

  const effectiveListings = adminListings.length > 0 ? adminListings : listings;

  const stats = [
    { label: "Jami e'lonlar", value: statsData?.total_properties ?? effectiveListings.length, icon: Building, iconCls: "text-blue-600", bgCls: "bg-blue-50" },
    { label: "Aktiv e'lonlar", value: statsData?.active_properties ?? effectiveListings.filter((l) => l.apiStatus === "active").length, icon: CheckCircle, iconCls: "text-green-600", bgCls: "bg-green-50" },
    { label: "Moderatsiyada", value: statsData?.pending_properties ?? effectiveListings.filter((l) => l.apiStatus === "pending").length, icon: Clock, iconCls: "text-amber-600", bgCls: "bg-amber-50" },
    { label: "Foydalanuvchilar", value: statsData?.total_users ?? usersData.length, icon: Users, iconCls: "text-purple-600", bgCls: "bg-purple-50" },
    { label: "Agentlar", value: statsData?.agents ?? usersData.filter((u) => u.role === "AGENT").length, icon: User, iconCls: "text-indigo-600", bgCls: "bg-indigo-50" },
    { label: "Bugungi e'lonlar", value: statsData?.today_properties ?? 0, icon: TrendingUp, iconCls: "text-teal-600", bgCls: "bg-teal-50" },
  ];

  const visibleListings = effectiveListings.filter((listing) => {
    if (activeTab === "pending") return listing.apiStatus === "pending";
    if (activeTab === "approved") return listing.apiStatus === "active";
    if (activeTab === "rejected") return listing.apiStatus === "rejected";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin size={15} className="text-white" />
            </div>
            <span className="font-extrabold text-gray-900">UyMap.uz</span>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              {t("admin")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => onNav("home")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <LogOut size={14} /> {t("logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
          {stats.map(({ label, value, icon: Icon, iconCls, bgCls }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bgCls}`}>
                <Icon size={16} className={iconCls} />
              </div>
              <div className="text-xl font-extrabold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {modError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl mb-4">
            {modError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto w-fit">
          {[
            { id: "pending", label: `Kutilayotgan (${effectiveListings.filter((l) => l.apiStatus === "pending").length})` },
            { id: "approved", label: "Tasdiqlangan" },
            { id: "rejected", label: "Rad etilgan" },
            { id: "users", label: "Foydalanuvchilar" },
            { id: "companies", label: `Kompaniyalar (${companies.filter(c => !c.is_verified).length})` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "companies" ? (
          <div className="space-y-3">
            {companies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Building2 size={44} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Hali kompaniyalar mavjud emas</p>
              </div>
            ) : (
              companies.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-extrabold shrink-0">
                          {c.company_name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900">{c.company_name}</h3>
                        <p className="text-xs text-gray-400">{c.user_name} · {c.user_phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Litsenziya: {c.license_number}</p>
                        {c.documents && c.documents.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {c.documents.map((doc: string, i: number) => (
                              <a key={i} href={doc} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
                                <FileText size={10} /> Hujjat {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.is_verified ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                          <CheckCircle size={12} /> Tasdiqlangan
                        </span>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                            <Clock size={12} className="inline mr-1" />Tekshirilmoqda
                          </span>
                          <button onClick={() => handleVerifyCompany(c.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
                            <Check size={12} /> Tasdiqlash
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab !== "users" ? (
          <div className="space-y-3">
            {visibleListings.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-start hover:shadow-sm transition-shadow">
                <img
                  src={l.image}
                  alt=""
                  className="w-24 h-20 rounded-xl object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-bold text-gray-900">{l.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin size={10} /> {l.location}
                      </div>
                      <div className="text-sm font-extrabold text-green-600 mt-1.5">{l.price}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-gray-700">{l.owner.name}</div>
                      <div className="text-xs text-gray-400">{l.owner.phone}</div>
                      <div className="text-xs text-gray-300 mt-1">3 soat oldin</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => handleModerate(l.id, { status: "active" })}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      <Check size={11} /> Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleModerate(l.id, { status: "rejected" })}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      <X size={11} /> Rad etish
                    </button>
                    <button
                      onClick={() => handleModerate(l.id, { status: "active", is_verified: true, is_premium: true })}
                      className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      <Shield size={11} /> Tekshirilgan
                    </button>
                    <button
                      onClick={() => onNav("detail", l.id)}
                      className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      <Eye size={11} /> Ko'rish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Foydalanuvchi", "Rol", t("listings"), "A'zo bo'lgan sana", "Holat", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(usersData.length ? usersData : []).map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {user.full_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {effectiveListings.filter((listing) => listing.ownerId === user.id).length}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{user.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                        Aktiv
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => {
                        if (confirm(`${user.full_name} foydalanuvchisini bloklashni tasdiqlaysizmi?`)) {
                          alert("Bloklash funksiyasi backendda amalga oshiriladi.");
                        }
                      }} className="text-xs text-gray-300 hover:text-red-500 font-medium transition-colors">
                        Bloklash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
