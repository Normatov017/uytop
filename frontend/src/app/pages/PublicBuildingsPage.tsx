import { useEffect, useState } from "react";
import { Building2, MapPin, Home, Ruler, CheckCircle, X, Search, ChevronLeft, Image as ImageIcon, Phone, MessageCircle, DollarSign, Calendar, Shield, Users, Layers, Star, FileText } from "lucide-react";
import { api } from "../../lib/api";
import type { Page } from "../types";
import { t } from "../../lib/i18n";
import { MOCK_BUILDINGS } from "../data/mockData";

const districts = ["Barchasi", "Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yakkasaroy", "Sergeli", "Olmazor", "Uchtepa", "Bektemir", "Mirobod", "Shayxontohur"];

export default function PublicBuildingsPage({ onNav }: { onNav: (p: Page) => void }) {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"apartments" | "plans" | "info">("apartments");
  const [roomFilter, setRoomFilter] = useState<number | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  const load = async (d?: string) => {
    setLoading(true);
    try {
      const data = await api.publicBuildings(d || undefined);
      setBuildings(data);
    } catch {
      const filtered = d ? MOCK_BUILDINGS.filter(b => b.district === d) : MOCK_BUILDINGS;
      setBuildings(filtered);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    setSelectedId(id);
    setDetailTab("apartments");
    setRoomFilter(null);
    setActiveImg(0);
    try {
      const data = await api.publicBuildingDetail(id);
      setDetail(data);
    } catch {
      setDetail(MOCK_BUILDINGS.find(b => b.id === id) ?? null);
    }
    setDetailLoading(false);
  };

  const filterDistrict = (d: string) => {
    setDistrict(d);
    load(d === "Barchasi" ? "" : d);
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const filteredApartments = detail?.apartments?.filter((a: any) => {
    if (roomFilter !== null && a.rooms !== roomFilter) return false;
    return a.status === "free";
  }) ?? [];

  const allImgs = detail?.images ?? [];

  const minPricePerM2 = detail?.apartments?.length
    ? Math.min(...detail.apartments.filter((a: any) => a.status === "free").map((a: any) => a.price / a.area_m2))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {!selectedId ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Yangi qurilishlar</h1>
              <p className="text-sm text-gray-400">O'zbekistondagi yangi turar-joy majmualari</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {districts.map(d => (
              <button key={d} onClick={() => filterDistrict(d)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  (district === d || (!district && d === "Barchasi")) ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
                }`}>{d}</button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
          ) : buildings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Building2 size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Bu tumanda qurilish topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {buildings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => loadDetail(b.id)}>
                  <div className="h-44 bg-gray-100 relative">
                    {b.images?.[0] ? (
                      <img src={b.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Building2 size={48} className="text-gray-300" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {b.company_verified && (
                      <span className="absolute top-2.5 left-2.5 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={10} /> Tasdiqlangan
                      </span>
                    )}
                    {b.free_count > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {b.free_count} ta bo'sh
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-extrabold text-gray-900 truncate">{b.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={11} /> {b.district}, {b.city}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Home size={11} /> {b.property_type === "apartment" ? "Kvartira" : b.property_type}</span>
                      <span className="flex items-center gap-1"><Layers size={11} /> {b.total_floors} qavat</span>
                      {b.completion_date && <span className="flex items-center gap-1"><Calendar size={11} /> {b.completion_date}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400">dan</span>
                        {b.min_price > 0 ? (
                          <span className="text-lg font-extrabold text-green-600 ml-1">${Number(b.min_price).toLocaleString()}</span>
                        ) : (
                          <span className="text-sm text-gray-400 ml-1">Narx kelishiladi</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors">
                        Batafsil
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={closeDetail}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <ChevronLeft size={16} /> Barcha qurilishlar
          </button>

          {detailLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
          ) : detail ? (
            <>
              {/* Hero */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                <div className="relative h-64 md:h-80 bg-gray-100">
                  {allImgs[activeImg] ? (
                    <img src={allImgs[activeImg]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Building2 size={64} className="text-gray-300" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {allImgs.length > 1 && (
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {allImgs.map((_: string, i: number) => (
                        <button key={i} onClick={() => setActiveImg(i)}
                          className={`w-2 h-2 rounded-full ${i === activeImg ? "bg-white" : "bg-white/50"}`} />
                      ))}
                    </div>
                  )}
                  {detail.company_name && (
                    <div className="absolute top-3 left-3 bg-white/90 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {detail.company_name[0]}
                      </div>
                      <span className="text-xs font-bold text-gray-900">{detail.company_name}</span>
                      {detail.company_verified && <CheckCircle size={12} className="text-green-600" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Price */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">{detail.name}</h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={14} /> {detail.district}, {detail.city}
                    </p>
                  </div>
                  <div className="text-right">
                    {minPricePerM2 > 0 && (
                      <div className="text-xs text-gray-400">dan</div>
                    )}
                    {detail.min_price > 0 ? (
                      <div className="text-2xl font-extrabold text-green-600">${Number(detail.min_price).toLocaleString()}</div>
                    ) : (
                      <div className="text-lg font-bold text-gray-400">Narx kelishiladi</div>
                    )}
                    {minPricePerM2 > 0 && (
                      <div className="text-xs text-gray-400">${Math.round(minPricePerM2).toLocaleString()}/m²</div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-gray-900">{detail.total_floors}</div>
                    <div className="text-[10px] text-gray-400">Qavat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-gray-900">{detail.total_apartments}</div>
                    <div className="text-[10px] text-gray-400">Kvartira</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-green-600">{detail.free_count ?? 0}</div>
                    <div className="text-[10px] text-gray-400">Bo'sh</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-amber-600">{detail.booked_count ?? 0}</div>
                    <div className="text-[10px] text-gray-400">Bron</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-gray-400">{detail.sold_count ?? 0}</div>
                    <div className="text-[10px] text-gray-400">Sotilgan</div>
                  </div>
                  {detail.completion_date && (
                    <div className="text-center">
                      <div className="text-lg font-extrabold text-gray-900">{detail.completion_date}</div>
                      <div className="text-[10px] text-gray-400">Tugash muddati</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                {[
                  { id: "apartments", label: "Kvartiralar" },
                  { id: "plans", label: "Planirovka" },
                  { id: "info", label: "Ma'lumot" },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setDetailTab(id as typeof detailTab)}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                      detailTab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab: Apartments */}
              {detailTab === "apartments" && (
                <div>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {[null, 1, 2, 3, 4].map(r => {
                      const count = r === null
                        ? detail.apartments?.filter((a: any) => a.status === "free").length
                        : detail.apartments?.filter((a: any) => a.status === "free" && a.rooms === r).length;
                      if (!count) return null;
                      return (
                        <button key={r ?? -1} onClick={() => setRoomFilter(r)}
                          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                            roomFilter === r ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
                          }`}>
                          {r ? `${r} xona` : "Barchasi"} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {filteredApartments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <Home size={40} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Bu filtrlash bo'yicha kvartiralar yo'q</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredApartments.map((apt: any) => (
                        <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                          {apt.plan_image && (
                            <div className="h-36 bg-gray-50 border-b border-gray-100">
                              <img src={apt.plan_image} alt={`${apt.number} planirovka`}
                                className="w-full h-full object-contain p-2"
                                onClick={() => setDetailTab("plans")} />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-extrabold text-gray-900">{apt.number}</span>
                                <span className="text-xs text-gray-400 ml-2">{apt.floor}-qavat</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                apt.status === "free" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {apt.status === "free" ? "Bo'sh" : "Bron"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                              <span>{apt.rooms} xona</span>
                              <span>{apt.area_m2} m²</span>
                              {apt.area_m2 > 0 && apt.price > 0 && (
                                <span className="text-gray-400">${Math.round(apt.price / apt.area_m2).toLocaleString()}/m²</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-xl font-extrabold text-green-600">${Number(apt.price).toLocaleString()}</div>
                              <button onClick={() => { onNav("listings"); }}
                                className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors">
                                Bog'lanish
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Plans */}
              {detailTab === "plans" && (
                <div>
                  {detail.apartments?.filter((a: any) => a.plan_image).length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <ImageIcon size={40} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Hali planirovka rasmlari yuklanmagan</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail.apartments?.filter((a: any) => a.plan_image).map((apt: any) => (
                        <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                          <img src={apt.plan_image} alt={`${apt.number} planirovka`}
                            className="w-full h-48 object-contain rounded-xl bg-gray-50 mb-3" />
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-bold text-gray-900">{apt.number}</span>
                              <span className="text-gray-400 ml-2">{apt.rooms} xona · {apt.area_m2}m²</span>
                            </div>
                            <span className="font-bold text-green-600">${Number(apt.price).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{apt.floor}-qavat</span>
                            {apt.area_m2 > 0 && apt.price > 0 && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">${Math.round(apt.price / apt.area_m2).toLocaleString()}/m²</span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              apt.status === "free" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {apt.status === "free" ? "Bo'sh" : "Bron"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Info */}
              {detailTab === "info" && (
                <div className="space-y-5">
                  {detail.description && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h3 className="font-bold text-gray-900 mb-2">Qurilish haqida</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{detail.description}</p>
                    </div>
                  )}

                  {detail.documents && detail.documents.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-green-600" /> Hujjatlar
                      </h3>
                      <div className="space-y-2">
                        {detail.documents.map((doc: any, i: number) => (
                          <div key={i}
                            className="flex items-center gap-3 bg-gray-50 hover:bg-green-50 rounded-xl px-4 py-3 transition-colors">
                            <FileText size={16} className="text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700 font-medium">{doc.name}</span>
                            <span className="ml-auto text-xs text-gray-400">
                              {doc.url && doc.url !== "#" ? (
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-green-600">Ko'rish</a>
                              ) : (
                                <span className="text-gray-300">Yuklanmagan</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Xususiyatlari</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Tuman", value: detail.district },
                        { label: "Shahar", value: detail.city },
                        { label: "Qavatlar", value: `${detail.total_floors} qavat` },
                        { label: "Kvartiralar", value: `${detail.total_apartments} ta` },
                        { label: "Qurilish materiali", value: detail.building_material || "—" },
                        { label: "Parkovka", value: detail.parking_type || "—" },
                        { label: "Liftlar", value: detail.elevator_count ? `${detail.elevator_count} ta` : "—" },
                        { label: "Tugash muddati", value: detail.completion_date || "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <div className="text-[10px] text-gray-400">{label}</div>
                          <div className="text-sm font-bold text-gray-900 mt-0.5">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {detail.amenities?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h3 className="font-bold text-gray-900 mb-3">Qulayliklar</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.amenities.map((a: string, i: number) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 font-medium px-3 py-1 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.company_name && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h3 className="font-bold text-gray-900 mb-3">Qurilish kompaniyasi</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                          {detail.company_name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{detail.company_name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {detail.company_verified ? (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} /> Tasdiqlangan
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Tasdiqlanmagan</span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => load(detail.company_name)}
                          className="text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors">
                          Barcha loyihalari
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500">Ma'lumot topilmadi</p>
              <button onClick={closeDetail} className="mt-3 text-green-600 text-sm font-bold">Orqaga</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
