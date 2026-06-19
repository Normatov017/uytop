export type UserRole = "USER" | "OWNER" | "AGENT" | "ADMIN" | "DEVELOPER";

export interface ApiUser {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  role: UserRole;
  region: string;
  district: string;
  is_active: boolean;
  created_at: string;
}

export interface ApiPropertyImage {
  id: number;
  url: string;
  is_main: boolean;
  sort_order: number;
  created_at: string;
}

export interface ApiProperty {
  id: number;
  title: string;
  description: string;
  operation_type: "sale" | "rent" | "daily_rent";
  property_type: "apartment" | "house" | "land" | "commercial" | "new_building";
  price: string;
  currency: "USD" | "UZS";
  price_period: null | "month" | "day";
  district: string;
  city: string;
  address: string;
  metro_station: string | null;
  latitude: number | null;
  longitude: number | null;
  rooms: number | null;
  area_m2: number | null;
  floor: number | null;
  total_floors: number | null;
  building_type: string | null;
  repair_type: string | null;
  document_status: string | null;
  owner_type: "owner" | "agent" | "developer";
  status: "pending" | "active" | "rejected" | "sold" | "rented";
  is_verified: boolean;
  is_premium: boolean;
  views_count: number;
  phone_clicks: number;
  telegram_clicks: number;
  owner_id: number;
  owner: ApiUser;
  images: ApiPropertyImage[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedProperties {
  items: ApiProperty[];
  total: number;
  page: number;
  pages: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: ApiUser;
}

export interface PropertyInsight {
  estimated_market_price: number;
  price_delta_percent: number;
  price_label: string;
  mahalla_score: number;
  commute_score: number;
  liquidity_score: number;
  trust_score: number;
  scam_risk: string;
  mortgage_monthly_usd: number | null;
  negotiation_tip: string;
  highlights: string[];
  noise_score: number;
  air_quality_score: number;
  green_zone_score: number;
  transport_score: number;
  school_rating: number;
  family_score: number;
  solo_score: number;
  investor_score: number;
}

export interface AVMEstimate {
  estimated_min: number;
  estimated_max: number;
  estimated_mid: number;
  confidence: string;
  similar_count: number;
  similar_avg_price: number;
  adjustments: string[];
}

export interface AdminStats {
  total_properties: number;
  active_properties: number;
  pending_properties: number;
  total_users: number;
  agents: number;
  today_properties: number;
}

export type PropertyCreatePayload = {
  title: string;
  description: string;
  operation_type: ApiProperty["operation_type"];
  property_type: ApiProperty["property_type"];
  price: number;
  currency: ApiProperty["currency"];
  price_period?: null | "month" | "day";
  district: string;
  city: string;
  address: string;
  metro_station?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  rooms?: number | null;
  area_m2?: number | null;
  floor?: number | null;
  total_floors?: number | null;
  building_type?: string | null;
  repair_type?: string | null;
  document_status?: string | null;
  owner_type: ApiProperty["owner_type"];
  amenities: string[];
  image_urls?: string[];
};

export interface BoostData {
  id: number;
  property_id: number;
  days: number;
  price_paid: number;
  currency: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface ViewStatsResponse {
  views_count: number;
  phone_clicks: number;
  telegram_clicks: number;
  recent_views: { date: string; count: number }[];
  unique_viewers: number;
}

export interface MarketSummary {
  total_listings: number;
  avg_price: number | null;
  avg_price_per_m2: number | null;
  by_district: { district: string; listings_count: number; avg_price: number | null; avg_price_per_m2: number | null }[];
}

export interface DistrictAnalytics {
  district: string;
  avg_price: number | null;
  avg_price_per_m2: number | null;
  listings_count: number;
  price_trends: { month: string; avg_price: number | null }[];
}

export interface PriceTrend {
  month: string;
  avg_price: number | null;
}

export interface TranslationMap {
  [key: string]: string;
}
