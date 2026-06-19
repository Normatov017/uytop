import { useState, useEffect } from "react";
import {
  MapPin, Heart, CheckCircle, Eye, Clock, Phone, MessageCircle, Check, X, Shield, Calendar, Bell, BellOff, TrendingUp, Share2, Send, Copy, Scale, Star, Maximize2,   Zap, Trash2,
} from "lucide-react";
import BoostModal from "../components/BoostModal";
import type { Listing, Page } from "../types";
import { api } from "../../lib/api";
import type { ApiUser, PropertyInsight } from "../../lib/types";
import { addRecentlyViewed } from "../../lib/storage";
import { VerifiedBadge, StatusBadge } from "../components/Badges";
import PropertyCard from "../components/PropertyCard";
import { osmEmbedUrl, osmOpenUrl, toListing } from "../utils";
import { t } from "../../lib/i18n";

function DetailPage({
  listing,
  listings,
  onNav,
  favorites,
  toggleFav,
  currentUser,
  viewOwnerListings,
}: {
  listing: Listing;
  listings: Listing[];
  onNav: (p: Page, id?: number) => void;
  favorites: number[];
  toggleFav: (id: number) => void;
  currentUser: ApiUser | null;
  viewOwnerListings?: (ownerId: number) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [insight, setInsight] = useState<PropertyInsight | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [shareToast, setShareToast] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{ price: number; recorded_at: string }[]>([]);
  const [agentRating, setAgentRating] = useState<any>(null);
  const [showBoost, setShowBoost] = useState(false);
  const [showViewingForm, setShowViewingForm] = useState(false);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [showTargetPrice, setShowTargetPrice] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [existingAlerts, setExistingAlerts] = useState<any[]>([]);
  const [districtRatingData, setDistrictRatingData] = useState<any>(null);
  const gallery = listing.images.length > 0 ? listing.images : [listing.image];
  const amenityMap: Record<string, string> = {
    lift: "Lift",
    parking: "Parking",
    metro: "Metro yaqin",
    school: "Maktab yaqin",
    balcony: "Balkon",
    ac: "Konditsioner",
  };
  const isFav = favorites.includes(listing.id);

  const alreadyWatching = existingAlerts.some((a: any) => a.property_id === listing.id);

  useEffect(() => {
    addRecentlyViewed(listing.id);
    setInsight(null);
    api.propertyInsights(listing.id).then(setInsight).catch(() => undefined);
    api.similarProperties(listing.id).then(async (props) => {
      setSimilar(props.map(toListing));
    }).catch(() => undefined);
    api.priceHistory(listing.id).then(setPriceHistory).catch(() => undefined);
    if (listing.ownerId) {
      api.agentRatingSummary(listing.ownerId).then(setAgentRating).catch(() => undefined);
    }
    if (listing.district) {
      api.districtRating(listing.district).then(setDistrictRatingData).catch(() => undefined);
    }
    api.alerts().then(setExistingAlerts).catch(() => undefined);
  }, [listing.id]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/listing/${listing.id}` : "";
  const shareText = `${listing.title} - ${listing.price}\n${listing.location}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
          <button onClick={() => onNav("home")} className="hover:text-green-600 transition-colors">
            Bosh sahifa
          </button>
          <span>/</span>
          <button onClick={() => onNav("listings")} className="hover:text-green-600 transition-colors">
            {t("listings")}
          </button>
          <span>/</span>
          <span className="text-gray-600 font-medium">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-4">
            {/* Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="relative">
                <img
                  src={gallery[activeImg]}
                  alt={listing.title}
                  className="w-full h-72 md:h-[420px] object-cover bg-gray-100"
                />
                <button
                  onClick={() => toggleFav(listing.id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                    isFav ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-red-50"
                  }`}
                >
                  <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                </button>
                <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                  {listing.verified && (
                    <>
                      <VerifiedBadge />
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full shadow">
                        Hujjat ✓
                      </span>
                    </>
                  )}
                  {!listing.verified && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full shadow">
                      Hujjat tekshirilmagan
                    </span>
                  )}
                </div>
                <div className="absolute top-4 left-4">
                  <StatusBadge status={listing.status} />
                </div>
              </div>
              <div className="flex gap-2 p-3 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImg === i ? "border-green-500" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title & specs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-2 gap-4">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-extrabold text-green-600">{listing.price}</div>
                  {listing.area > 0 && listing.priceNum > 1000 && (
                    <div className="text-xs text-gray-400">
                      ≈ ${Math.round(listing.priceNum / listing.area)}/m²
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                <MapPin size={14} className="text-green-500" />
                {listing.location}
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  { l: "Xona", v: listing.rooms > 0 ? `${listing.rooms} ta` : "—" },
                  { l: "Maydon", v: `${listing.area} m²` },
                  { l: "Qavat", v: listing.floor },
                  { l: "Bino turi", v: listing.type },
                  { l: "Remont", v: listing.repair },
                  { l: "Hujjat", v: listing.verified ? "Tekshirilgan ✓" : "Tekshirilmagan" },
                ].map(({ l, v }) => (
                  <div key={l} className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="text-[11px] text-gray-400 mb-1">{l}</div>
                    <div className="text-xs font-bold text-gray-800">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-3">{t("description")}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Smart insights */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="font-bold text-gray-900">Aqlli tahlil</h2>
                {insight && (
                  <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                    {insight.price_label}
                  </span>
                )}
              </div>
              {insight ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                    {[
                      { l: "Mahalla", v: insight.mahalla_score },
                      { l: "Transport", v: insight.commute_score },
                      { l: "Likvidlik", v: insight.liquidity_score },
                      { l: "Ishonch", v: insight.trust_score },
                    ].map(({ l, v }) => (
                      <div key={l} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between text-xs font-bold mb-2">
                          <span className="text-gray-500">{l}</span>
                          <span className="text-gray-900">{v}/100</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full" style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
                    <div className="bg-green-50 rounded-xl p-3">
                      <div className="text-[11px] text-green-700 font-bold mb-1">Bozor bahosi</div>
                      <div className="text-sm font-extrabold text-green-800">
                        ${Math.round(insight.estimated_market_price).toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <div className="text-[11px] text-blue-700 font-bold mb-1">Farq</div>
                      <div className="text-sm font-extrabold text-blue-800">{insight.price_delta_percent}%</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <div className="text-[11px] text-amber-700 font-bold mb-1">Xavf</div>
                      <div className="text-sm font-extrabold text-amber-800">{insight.scam_risk}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{insight.negotiation_tip}</p>
                  {insight.mortgage_monthly_usd && (
                    <p className="text-xs text-gray-400 mt-2">
                      Ipoteka taxmini: ${Math.round(insight.mortgage_monthly_usd).toLocaleString("en-US")}/oy
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Tahlil yuklanmoqda...</p>
              )}
            </div>

            {/* Quality of Life Index */}
            {insight && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">🏙️ Hayot sifati indeksi</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { l: "Shovqin darajasi", v: insight.noise_score, color: insight.noise_score >= 70 ? "text-green-600" : "text-amber-600" },
                    { l: "Havo sifati", v: insight.air_quality_score },
                    { l: "Yashil zonalar", v: insight.green_zone_score },
                    { l: "Transport", v: insight.transport_score },
                    { l: "Maktab reytingi", v: insight.school_rating },
                  ].map(({ l, v, color }) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-500">{l}</span>
                        <span className={`${color || "text-gray-900"}`}>{v}/100</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { l: "👨‍👩‍👧‍👦 Oila uchun", v: insight.family_score },
                    { l: "🧑 Yolg'iz uchun", v: insight.solo_score },
                    { l: "💰 Investor uchun", v: insight.investor_score },
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-green-50 rounded-xl p-3 text-center">
                      <div className="text-[18px] font-extrabold text-green-700">{v}/100</div>
                      <div className="text-[10px] text-green-600">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price history chart */}
            {priceHistory.length >= 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">📈 Narx tarixi</h2>
                <div className="relative h-36">
                  <svg viewBox="0 0 300 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#16a34a" stopOpacity="0.25" />
                        <stop offset="1" stopColor="#16a34a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const prices = priceHistory.map(p => p.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const range = max - min || 1;
                      const xStep = 300 / (prices.length - 1);
                      const points = prices.map((p, i) => `${i * xStep},${100 - ((p - min) / range) * 80}`);
                      const line = points.join(" ");
                      const area = `M0,100 ${points.join(" L")} L${(prices.length - 1) * xStep},100 Z`;
                      return (
                        <>
                          <path d={area} fill="url(#chartGrad)" />
                          <polyline points={line} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" />
                          {prices.map((p, i) => (
                            <circle key={i} cx={i * xStep} cy={100 - ((p - min) / range) * 80} r="3" fill="#16a34a" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>${Math.min(...priceHistory.map(p => p.price)).toLocaleString()}</span>
                  <span>${Math.max(...priceHistory.map(p => p.price)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                  <span>{new Date(priceHistory[0].recorded_at).toLocaleDateString("uz")}</span>
                  <span>{new Date(priceHistory[priceHistory.length - 1].recorded_at).toLocaleDateString("uz")}</span>
                </div>
              </div>
            )}

            {/* Virtual tour */}
            {(listing as any).virtualTourUrl && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">🎥 Virtual sayohat</h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <iframe
                    src={(listing as any).virtualTourUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">{t("amenities")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.entries(amenityMap).map(([key, label]) => {
                  const has = listing.amenities.includes(key);
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${
                        has
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-100 bg-gray-50 text-gray-400"
                      }`}
                    >
                      {has ? <Check size={13} className="text-green-500" /> : <X size={13} />}
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Neighborhood Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" id="reviews">
              <h2 className="font-bold text-gray-900 mb-4">🏘️ Mahalla reytingi</h2>
              {districtRatingData ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    {[
                      { label: "Xavfsizlik", value: Math.round(districtRatingData.avg_safety) },
                      { label: "Infratuzilma", value: Math.round(districtRatingData.avg_infrastructure) },
                      { label: "Transport", value: Math.round(districtRatingData.avg_transport) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex-1 text-center bg-gray-50 rounded-xl p-3">
                        <div className="text-[18px] font-extrabold text-green-600">{value}/10</div>
                        <div className="text-[10px] text-gray-400">{label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {districtRatingData.review_count > 0
                      ? `${districtRatingData.review_count} ta sharh asosida`
                      : "Ma'lumotlar foydalanuvchi sharhlari asosida shakllantiriladi."}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Yuklanmoqda...</p>
              )}
            </div>

            {/* Map preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-3">Xaritada joylashuv</h2>
              <div className="h-44 rounded-xl relative overflow-hidden bg-gray-100">
                  <iframe
                  title={`${listing.title} xarita`}
                  src={osmEmbedUrl(listing.lat, listing.lng)}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                />
                <div className="absolute left-3 bottom-3 right-3 flex gap-2">
                  <button
                    onClick={() => onNav("map")}
                    className="flex-1 bg-white/95 hover:bg-white text-green-700 text-xs font-bold py-2 rounded-xl shadow"
                  >
                    UyMap xaritada
                  </button>
                  <a
                    href={osmOpenUrl(listing.lat, listing.lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-xl shadow"
                  >
                    OSM da ochish
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Contact card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {listing.owner.name[0]}
                  </div>
                  <div className="flex-1">
                    <button onClick={() => { if (listing.ownerId) onNav("agent", listing.ownerId); }}
                      className="font-bold text-gray-900 hover:text-green-600 transition-colors text-left">{listing.owner.name}</button>
                    <div className="text-xs text-gray-400">Rieltor</div>
                    {agentRating && agentRating.total_reviews > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="text-xs font-bold text-gray-900">{agentRating.avg_rating}</div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={10} className={i <= Math.round(agentRating.avg_rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400">({agentRating.total_reviews})</span>
                      </div>
                    )}
                  </div>
                  {listing.verified && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                </div>
                {listing.ownerId && viewOwnerListings && (
                  <button
                    onClick={() => viewOwnerListings(listing.ownerId)}
                    className="w-full text-center text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 py-2.5 rounded-xl transition-colors mb-3"
                  >
                    Barcha e'lonlarni ko'rish ({listings.filter(l => l.ownerId === listing.ownerId).length})
                  </button>
                )}

                <div className="space-y-2.5">
                  <a
                    href={`tel:${listing.owner.phone}`}
                    onClick={() => api.trackContact(listing.id, "phone").catch(() => undefined)}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                  >
                    <Phone size={15} /> {listing.owner.phone}
                  </a>
                  <a
                    href={listing.owner.telegram ? `https://t.me/${listing.owner.telegram.replace(/^@/, "")}` : "#"}
                    target={listing.owner.telegram ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!listing.owner.telegram) e.preventDefault();
                      api.trackContact(listing.id, "telegram").catch(() => undefined);
                    }}
                    className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-colors text-sm ${
                      listing.owner.telegram
                        ? "bg-blue-50 hover:bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <MessageCircle size={15} /> {listing.owner.telegram ? "Telegramda yozish" : "Telegram mavjud emas"}
                  </a>
                  {currentUser && currentUser.id !== listing.ownerId ? (
                    <button
                      onClick={async () => {
                        try {
                          const conv = await api.createConversation(listing.id, listing.ownerId);
                          onNav("chat");
                        } catch (e) {
                          alert("Xatolik yuz berdi");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 border border-green-200 hover:border-green-400 text-green-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                      <MessageCircle size={15} /> Chatda yozish
                    </button>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-green-400 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">
                      <Clock size={15} /> Ko'rishga yozilish
                    </button>
                  )}
                  {currentUser && currentUser.id !== listing.ownerId && (
                    <button
                      onClick={() => setShowViewingForm(true)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      <Calendar size={15} /> Ko'rish vaqtini belgilash
                    </button>
                  )}
                  {currentUser && (
                    <button
                      onClick={async () => {
                        try {
                          await api.createBooking(listing.id);
                          onNav("bookings");
                        } catch (e: any) {
                          alert(e.message || "Bron qilishda xatolik");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      <Calendar size={15} /> Bron qilish
                    </button>
                  )}
                  {currentUser && !alreadyWatching && (
                    <button
                      onClick={() => setShowTargetPrice(true)}
                      className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-green-400 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                      <Bell size={15} /> Narxni kuzatish
                    </button>
                  )}
                  {currentUser && alreadyWatching && (
                    <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 font-semibold py-3 rounded-xl text-sm border border-green-200">
                      <BellOff size={15} /> Kuzatilmoqda
                    </div>
                  )}
                  {currentUser && currentUser.id === listing.ownerId && (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            const result = await api.postToTelegram(listing.id);
                            if (result.url) window.open(result.url, "_blank");
                            alert("Telegramga joylandi!");
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Xatolik");
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        <Send size={14} /> Telegramga post
                      </button>
                      <a
                        href={api.qrUrl(listing.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-xl transition-colors"
                      >
                        QR kod
                      </a>
                      <button
                        onClick={() => setShowBoost(true)}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                      >
                        <Zap size={15} /> {t("boost")}
                      </button>
                      {showBoost && (
                        <BoostModal
                          propertyId={listing.id}
                          onClose={() => setShowBoost(false)}
                          onBoosted={() => setShowBoost(false)}
                        />
                      )}
                    </>
                  )}
                  {currentUser && currentUser.id === listing.ownerId && (
                    <>
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{t("auto_decrease")}</div>
                            <div className="text-xs text-gray-400">Har kuni narx 1% ga kamayadi</div>
                          </div>
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-green-600 rounded"
                            onChange={async (e) => {
                              try {
                                await api.setAutoDecrease(listing.id, e.target.checked, 1);
                              } catch {}
                            }}
                          />
                        </label>
                      </div>
                      {(listing.apiStatus !== "sold" && listing.apiStatus !== "rented") && (
                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <button
                            onClick={async () => {
                              const newStatus = listing.status === "sotuv" ? "sold" : "rented";
                              if (confirm(`${listing.status === "sotuv" ? "Sotilgan" : "Ijaraga berilgan"} deb belgilansinmi?`)) {
                                try {
                                  await api.moderateProperty(listing.id, { status: newStatus as any });
                                  alert("Status yangilandi! E'lon endi umumiy ro'yxatda ko'rinmaydi.");
                                  window.location.reload();
                                } catch (err) {
                                  alert(err instanceof Error ? err.message : "Xatolik");
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                          >
                            <CheckCircle size={15} /> {listing.status === "sotuv" ? "Sotilgan deb belgilash" : "Ijaraga berilgan deb belgilash"}
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("E'lonni o'chirishni tasdiqlaysizmi?")) {
                                try {
                                  await api.deleteProperty(listing.id);
                                  alert("E'lon o'chirildi!");
                                  window.location.reload();
                                } catch (err) {
                                  alert(err instanceof Error ? err.message : "Xatolik");
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2"
                          >
                            <Trash2 size={15} /> E'lonni o'chirish
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Agent rating */}
              {agentRating && agentRating.total_reviews > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h4 className="text-xs font-bold text-gray-500 mb-2">Egasining reytingi</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-extrabold text-gray-900">{agentRating.avg_rating}</div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={13} className={i <= Math.round(agentRating.avg_rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-1">({agentRating.total_reviews})</span>
                  </div>
                </div>
              )}

              {/* Compare button */}
              <button onClick={() => onNav("compare")}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-green-400 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm">
                <Scale size={15} /> Solishtirishga qo'shish
              </button>

              {/* Quick sale badge */}
              {listing.isUrgent && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white text-center">
                  <div className="text-lg font-extrabold">🏚️ Tez sotish</div>
                  <div className="text-xs text-red-100 mt-1">Mulk tez sotilishi kerak — eng yaxshi taklifni qiling</div>
                  <div className="text-sm font-bold mt-2">{listing.price}</div>
                  {listing.priceNum > 0 && (
                    <div className="text-xs text-red-200 line-through mt-0.5">
                      Bozor narxi: ~${Math.round(listing.priceNum * 1.15).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Eye size={13} /> {listing.views} ko'rishlar
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} /> 2 kun oldin
                </span>
              </div>

              {/* Share */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h4 className="text-xs font-bold text-gray-500 mb-3">Ulashish</h4>
                <div className="flex gap-2">
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0088cc] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                    <Send size={13} /> Telegram
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); setShareToast(true); setTimeout(() => setShareToast(false), 2000); }}
                    className="flex items-center gap-2 border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <Copy size={13} /> Nusxa
                  </button>
                </div>
                {shareToast && (
                  <div className="mt-2 text-xs text-green-600 font-semibold">Havola nusxalandi ✓</div>
                )}
              </div>

              {/* Safety */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2.5">
                <Shield size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 mb-1">Xavfsizlik eslatmasi</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Avans o'tkazishdan avval mulkni shaxsan ko'ring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Viewing form modal */}
        {showViewingForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowViewingForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ko'rish vaqtini belgilash</h3>
              <div className="space-y-3">
                <input type="date" value={viewingDate} onChange={e => setViewingDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                <input type="time" value={viewingTime} onChange={e => setViewingTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                <input type="text" placeholder="Ismingiz" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                <input type="tel" placeholder="Telefon" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                <button onClick={async () => {
                  try {
                    await api.createViewing(listing.id, `${viewingDate}T${viewingTime}`, buyerName, buyerPhone);
                    setShowViewingForm(false);
                    alert("Ko'rish vaqti belgilandi! Agent siz bilan bog'lanadi.");
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Xatolik");
                  }
                }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl">Yuborish</button>
              </div>
            </div>
          </div>
        )}

        {/* Target price modal */}
        {showTargetPrice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowTargetPrice(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Narxni kuzatish</h3>
              <p className="text-xs text-gray-400 mb-4">Maqsadli narxni kiriting (ixtiyoriy)</p>
              <input type="number" placeholder="Maqsadli narx ($)" value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-green-500" />
              <div className="flex gap-2">
                <button onClick={() => { setShowTargetPrice(false); setTargetPrice(""); }}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-3 text-sm font-semibold hover:bg-gray-50 transition-colors">Bekor qilish</button>
                <button onClick={async () => {
                  try {
                    await api.createAlert(listing.id, targetPrice ? Number(targetPrice) : undefined);
                    setShowTargetPrice(false); setTargetPrice("");
                    alert("Narx kuzatuvga olindi!");
                  } catch (e: any) {
                    alert(e.message || "Xatolik");
                  }
                }}
                  className="flex-1 bg-green-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-green-700 transition-colors">Kuzatishni boshlash</button>
              </div>
            </div>
          </div>
        )}

        {/* Similar listings */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Shunga o'xshash e'lonlar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.slice(0, 4).map((l) => (
                <PropertyCard
                  key={l.id}
                  listing={l}
                  onView={() => onNav("detail", l.id)}
                  onFav={() => toggleFav(l.id)}
                  isFav={favorites.includes(l.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailPage;
