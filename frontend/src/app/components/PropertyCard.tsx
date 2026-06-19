import { useState } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import type { Listing } from "../types";
import { formatPriceNum } from "../utils";

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
  const images = listing.images.length > 0 ? listing.images : [listing.image];
  const displayPrice = displayInUzs && listing.currency === "USD"
    ? formatPriceNum(listing.priceNum, listing.currency, true)
    : listing.price;

  const specParts = [
    listing.rooms > 0 && `${listing.rooms} Xona`,
    listing.area > 0 && `${listing.area} m²`,
    listing.type,
  ].filter(Boolean);

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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow text-gray-700 transition-colors">
              <ChevronRight size={14} />
            </button>
          </>
        )}

        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {listing.isUrgent && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Tez sotish</span>
          )}
          {listing.isPremium && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Premium</span>
          )}
          {listing.verified && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">Tekshirilgan</span>
          )}
        </div>

        <button onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors bg-white/80 hover:bg-white">
          <Heart size={13} fill={isFav ? "#ef4444" : "none"} className={isFav ? "text-red-500" : "text-gray-500"} />
        </button>

        <div className="absolute bottom-2.5 left-2.5 flex gap-1">
          {images.length > 1 && (
            <span className="bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {imgIdx + 1}/{images.length}
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5">
        <div className="text-lg font-bold text-gray-900 mb-1">{displayPrice}</div>
        <p className="text-sm text-gray-700 line-clamp-1 mb-1.5">{listing.title}</p>
        <p className="text-xs text-gray-400 mb-2 line-clamp-1">{listing.location}</p>
        <div className="text-xs text-gray-500">
          {specParts.map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="mx-1.5 text-gray-300">·</span>}
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
