import { api } from "../lib/api";
import type { ApiProperty } from "../lib/types";
import { propertyTypeLabels } from "./types";
import type { Listing } from "./types";

export const USD_TO_UZS = 12800;

export function formatPrice(property: ApiProperty, showInUzs = false): string {
  const value = Number(property.price);
  const suffix = property.price_period === "month" ? "/oy" : property.price_period === "day" ? "/kun" : "";
  if (property.currency === "USD" && showInUzs) {
    const uzsValue = Math.round(value * USD_TO_UZS);
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(uzsValue)} so'm${suffix}`;
  }
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  if (property.currency === "USD") return `$${formatted}${suffix}`;
  return `${formatted} so'm${suffix}`;
}

export function formatPriceNum(priceNum: number, currency: string, showInUzs = false): string {
  const suffix = "";
  if (currency === "USD" && showInUzs) {
    const uzsValue = Math.round(priceNum * USD_TO_UZS);
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(uzsValue)} so'm${suffix}`;
  }
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(priceNum)}${suffix}`;
}

export function toListing(property: ApiProperty): Listing {
  const mainImage = property.images.find((image) => image.is_main)?.url ?? property.images[0]?.url;
  const floor = property.floor && property.total_floors ? `${property.floor}/${property.total_floors}` : property.floor ? `${property.floor}` : "—";
  return {
    id: property.id,
    title: property.title,
    price: formatPrice(property),
    priceNum: Number(property.price),
    currency: property.currency,
    location: property.district ? `${property.district} tumani` : property.city,
    rooms: property.rooms ?? 0,
    area: property.area_m2 ?? 0,
    floor,
    type: propertyTypeLabels[property.property_type],
    repair: property.repair_type ?? "Ko'rsatilmagan",
    district: property.district,
    region: property.city,
    metroStation: property.metro_station ?? "",
    image: mainImage ? api.mediaUrl(mainImage) : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format",
    images: property.images.map(img => api.mediaUrl(img.url)),
    verified: property.is_verified,
    views: property.views_count,
    status: property.operation_type === "sale" ? "sotuv" : "ijara",
    apiStatus: property.status,
    isPremium: property.is_premium,
    isUrgent: false,
    lat: property.latitude ?? 41.31,
    lng: property.longitude ?? 69.28,
    description: property.description,
    amenities: property.amenities ?? [],
    ownerId: property.owner_id,
    owner: {
      name: property.owner.full_name,
      phone: property.owner.phone,
      telegram: "",
    },
  };
}

export function osmEmbedUrl(lat: number, lng: number) {
  const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export function osmOpenUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;
}

let cachedRate: number | null = null;
let rateLastFetch = 0;

export async function fetchUzsRate(): Promise<number> {
  if (cachedRate && Date.now() - rateLastFetch < 3600000) return cachedRate;
  try {
    const res = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/");
    const data = await res.json();
    cachedRate = Number(data[0]?.Rate) || USD_TO_UZS;
    rateLastFetch = Date.now();
    return cachedRate;
  } catch {
    return USD_TO_UZS;
  }
}
