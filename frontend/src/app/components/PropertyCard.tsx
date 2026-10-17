import { useState } from "react";
import { Heart, Eye, ChevronLeft, ChevronRight, Share2, Train, MessageCircle, Copy, Check } from "lucide-react";
import type { Listing } from "../types";
import { METRO_STATIONS } from "../types";
import { formatPriceNum } from "../utils";

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function PropertyCard({
  listing,
  onView,
  onFav,
  isFav,
  displayInUzs,
}: {
  listing: Listing;
  onView: () => void;
  onFav: () => void;
  isFav: boolean;
  displayInUzs?: boolean;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const [shareToast, setShareToast] = useState(false);
  const images = listing.images.length > 0 ? listing.images : [listing.image];
  const displayPrice = displayInUzs && listing.currency === "USD"
    ? formatPriceNum(listing.priceNum, listing.currency, true)
    : listing.price;

  const pricePerM2 = listing.area > 0 && listing.priceNum > 0 ? Math.round(listing.priceNum / listing.area) : 0;

  const nearestMetro = listing.lat && listing.lng
    ? METRO_STATIONS.reduce<{ name: string; dist: number } | null>((best, m) => {
        const d = haversineDistance(listing.lat, listing.lng, m.lat, m.lng);
        if (!best || d < best.dist) return { name: m.name, dist: d };
        return best;
      }, null)
    : null;

  const specParts = [
    listing.rooms > 0 && `${listing.rooms} Xona`,
    listing.area > 0 && `${listing.area} m²`,
    listing.type,
    nearestMetro && nearestMetro.dist < 3 && `Metro ${Math.round(nearestMetro.dist * 1000)}m`,
  ].filter(Boolean) as string[];

  const shareUrl = `${window.location.origin}/detail/${listing.id}`;
  const shareText = `${listing.title} - ${listing.price}\n${listing.location}`;
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: listing.title, text: shareText, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <div className="relative">
        <img src={images[imgIdx]} alt={listing.title}
          className="w-full h-48 object-cover bg-gray-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />

        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow text-gray-700 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
              className="absolute right-12 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow text-gray-700 transition-colors">
              <ChevronRight size={14} />
            </button>
          </>
        )}

        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">0% komissiya</span>
          <span className="bg-white text-green-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Egasidan</span>
          {listing.isUrgent && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Tez sotish</span>
          )}
          {listing.isPremium && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Reklama</span>
          )}
          {listing.verified && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">Tekshirilgan</span>
          )}
        </div>

        <button onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors bg-white/80 hover:bg-white">
          <Heart size={13} fill={isFav ? "#ef4444" : "none"} className={isFav ? "text-red-500" : "text-gray-500"} />
        </button>

        <button onClick={handleShare}
          className="absolute top-2.5 right-11 w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors bg-white/80 hover:bg-white">
          {shareToast ? <Check size={13} className="text-green-600" /> : <Share2 size={13} className="text-gray-500" />}
        </button>

        <div className="absolute bottom-2.5 left-2.5 flex gap-1">
          {images.length > 1 && (
            <span className="bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {imgIdx + 1}/{images.length}
            </span>
          )}
        </div>
        {listing.views > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
            <Eye size={10} /> {listing.views}
          </div>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-lg font-bold text-gray-900">{displayPrice}</div>
          {pricePerM2 > 0 && (
            <span className="text-[11px] text-gray-400 font-medium">${pricePerM2}/m²</span>
          )}
        </div>
        <p className="text-sm text-gray-700 line-clamp-1 mb-1.5">{listing.title}</p>
        <p className="text-xs text-gray-400 mb-2 line-clamp-1">{listing.location}</p>
        <div className="text-xs text-gray-500 flex flex-wrap gap-x-1">
          {specParts.map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="mx-1 text-gray-300">·</span>}
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
