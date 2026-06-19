import { useState, useEffect } from "react";
import { Star, Phone, MessageCircle, MapPin, CheckCircle, Clock, Eye, TrendingUp, Home, Award, ChevronRight } from "lucide-react";
import type { Listing, Page } from "../types";
import { api } from "../../lib/api";
import type { ApiUser } from "../../lib/types";
import PropertyCard from "../components/PropertyCard";

function AgentPage({
  ownerId,
  listings,
  onNav,
  favorites,
  toggleFav,
  currentUser,
}: {
  ownerId: number;
  listings: Listing[];
  onNav: (p: Page, id?: number) => void;
  favorites: number[];
  toggleFav: (id: number) => void;
  currentUser: ApiUser | null;
}) {
  const [agentListings, setAgentListings] = useState<Listing[]>([]);
  const [rating, setRating] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    const filtered = listings.filter(l => l.ownerId === ownerId);
    setAgentListings(filtered);
    api.agentRatingSummary(ownerId).then(setRating).catch(() => undefined);
    api.agentReviews(ownerId).then(setReviews).catch(() => undefined);
    api.agentAnalytics().then(setAnalytics).catch(() => undefined);
  }, [ownerId, listings]);

  const agentName = agentListings[0]?.owner.name ?? "Noma'lum";
  const agentPhone = agentListings[0]?.owner.phone ?? "";
  const agentTelegram = agentListings[0]?.owner.telegram ?? "";
  const activeListings = agentListings.filter(l => l.status === "sotuv" || l.status === "ijara");
  const soldCount = agentListings.filter(l => l.status === "sotuv" || l.status === "ijara").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
          <button onClick={() => onNav("home")} className="hover:text-green-600 transition-colors">Bosh sahifa</button>
          <span>/</span>
          <span className="text-gray-600 font-medium">{agentName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {agentName[0]}
            </div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl font-bold text-gray-900">{agentName}</h1>
              <p className="text-sm text-gray-500">Rieltor</p>
              {rating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} className={i <= Math.round(rating.avg_rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{rating.avg_rating}</span>
                  <span className="text-xs text-gray-400">({rating.total_reviews} ta sharh)</span>
                </div>
              )}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Home size={14} /> {activeListings.length} ta e'lon</span>
                <span className="flex items-center gap-1"><Award size={14} /> {soldCount} ta sotilgan</span>
              </div>
            </div>
            <div className="flex gap-2">
              {agentPhone && (
                <a href={`tel:${agentPhone}`} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  <Phone size={14} /> Qo'ng'iroq
                </a>
              )}
              {agentTelegram && (
                <a href={`https://t.me/${agentTelegram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  <MessageCircle size={14} /> Telegram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">E'lonlari ({agentListings.length})</h2>
            {agentListings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Hozircha e'lonlar yo'q</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agentListings.map(l => (
                  <PropertyCard key={l.id} listing={l} onView={() => onNav("detail", l.id)}
                    onFav={() => toggleFav(l.id)} isFav={favorites.includes(l.id)} />
                ))}
              </div>
            )}
            {agentListings.length > 4 && (
              <button onClick={() => onNav("listings")}
                className="w-full text-center text-sm font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 py-3 rounded-xl transition-colors">
                Barcha e'lonlarni ko'rish <ChevronRight size={14} className="inline" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {analytics && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-600" /> Statistika
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-extrabold text-gray-900">{analytics.total_listings ?? agentListings.length}</div>
                    <div className="text-[10px] text-gray-400">Jami e'lonlar</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-extrabold text-gray-900">{analytics.total_views ?? 0}</div>
                    <div className="text-[10px] text-gray-400">Ko'rishlar</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-extrabold text-gray-900">{analytics.total_phone_clicks ?? 0}</div>
                    <div className="text-[10px] text-gray-400">Qo'ng'iroqlar</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-extrabold text-gray-900">{analytics.conversion_rate ?? "—"}%</div>
                    <div className="text-[10px] text-gray-400">Konversiya</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">Sharhlar ({reviews.length})</h3>
                {currentUser && currentUser.id !== ownerId && (
                  <button onClick={() => setShowReviewForm(true)}
                    className="text-xs font-semibold text-green-600 hover:text-green-700">
                    Sharh qoldirish
                  </button>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400">Hali sharhlar yo'q</p>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 5).map((r, i) => (
                    <div key={r.id ?? i} className="pb-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(j => (
                            <Star key={j} size={10} className={j <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{r.user_name ?? "Foydalanuvchi"}</span>
                      </div>
                      {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowReviewForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rieltorga baho bering</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => setReviewRating(i)}
                  className={`p-1 rounded-full transition-colors ${i <= reviewRating ? "text-amber-400" : "text-gray-200"}`}>
                  <Star size={28} fill={i <= reviewRating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              placeholder="Sharhingiz (ixtiyoriy)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 h-24 resize-none focus:outline-none focus:border-green-500" />
            <button onClick={async () => {
              try {
                await api.createAgentReview(ownerId, reviewRating, reviewComment);
                setShowReviewForm(false);
                setReviewRating(5);
                setReviewComment("");
                const updated = await api.agentReviews(ownerId);
                setReviews(updated);
                api.agentRatingSummary(ownerId).then(setRating).catch(() => {});
              } catch { alert("Xatolik"); }
            }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">Yuborish</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentPage;
