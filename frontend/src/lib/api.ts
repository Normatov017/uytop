import type {
  AdminStats,
  ApiProperty,
  ApiUser,
  AuthResponse,
  AVMEstimate,
  PaginatedProperties,
  PropertyCreatePayload,
  PropertyInsight,
  UserRole,
  BoostData,
  ViewStatsResponse,
  MarketSummary,
  DistrictAnalytics,
  PriceTrend,
  TranslationMap,
} from "./types";

const defaultApiHost =
  typeof window !== "undefined" && window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? `http://${defaultApiHost}:8000/api`;
const TOKEN_KEY = "uymap_access_token";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? "API request failed");
  }
  return response.json() as Promise<T>;
}

export const api = {
  sendOTP(phone: string) {
    return request<{ status: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  verifyOTP(phone: string, code: string) {
    return request<{ status: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
  },

  tokenKey: TOKEN_KEY,

  mediaUrl(url: string) {
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
    return url;
  },

  async properties(params: Record<string, string | number | boolean | undefined> = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") search.set(key, String(value));
    });
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<PaginatedProperties>(`/properties${suffix}`);
  },

  property(id: number) {
    return request<ApiProperty>(`/properties/${id}`);
  },

  myProperties() {
    return request<ApiProperty[]>("/properties/mine");
  },

  createProperty(payload: PropertyCreatePayload) {
    return request<ApiProperty>("/properties", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteProperty(id: number) {
    return fetch(`${API_BASE_URL}/properties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ""}` },
    });
  },

  propertyInsights(id: number) {
    return request<PropertyInsight>(`/properties/${id}/insights`);
  },

  propertyAVM(id: number) {
    return request<AVMEstimate>(`/properties/${id}/avm`);
  },
  similarProperties(id: number) {
    return request<ApiProperty[]>(`/properties/${id}/similar`);
  },

  // Price alerts
  alerts() {
    return request<{ id: number; property_id: number; property_title: string; current_price: number; target_price: number | null; notified: boolean }[]>("/alerts");
  },
  createAlert(property_id: number, target_price?: number) {
    return request<{ id: number }>(`/alerts/${property_id}?target_price=${target_price || ""}`, { method: "POST" });
  },
  deleteAlert(alertId: number) {
    return request<{ ok: boolean }>(`/alerts/${alertId}`, { method: "DELETE" });
  },

  // Agents
  agentAnalytics() {
    return request<{ total_listings: number; active_listings: number; sold_listings: number; total_views: number; total_phone_clicks: number; conversion_rate: number }>("/agents/analytics");
  },
  agentLeaderboard() {
    return request<{ id: number; full_name: string; total_listings: number; active_listings: number; sold_listings: number; total_views: number; score: number }[]>("/agents/leaderboard");
  },

  trackContact(id: number, channel: "phone" | "telegram") {
    return request<{ status: string }>(`/properties/${id}/contact/${channel}`, { method: "POST" });
  },

  async uploadImage(file: File) {
    const token = localStorage.getItem(TOKEN_KEY);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail ?? "Rasm yuklashda xatolik");
    }
    return response.json() as Promise<{ url: string }>;
  },

  featured() {
    return request<ApiProperty[]>("/properties/featured");
  },

  login(phone_or_email: string, password: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone_or_email, password }),
    });
  },

  register(payload: {
    full_name: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    region?: string;
    district?: string;
  }) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  me() {
    return request<ApiUser>("/auth/me");
  },

  favorites() {
    return request<{ id: number; property: ApiProperty }[]>("/favorites");
  },

  addFavorite(id: number) {
    return request<{ id: number; property: ApiProperty }>(`/favorites/${id}`, { method: "POST" });
  },

  removeFavorite(id: number) {
    return fetch(`${API_BASE_URL}/favorites/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ""}` },
    });
  },

  adminStats() {
    return request<AdminStats>("/admin/stats");
  },

  adminProperties() {
    return request<ApiProperty[]>("/admin/properties");
  },

  adminUsers() {
    return request<ApiUser[]>("/admin/users");
  },

  moderateProperty(id: number, payload: { status: ApiProperty["status"]; is_verified?: boolean; is_premium?: boolean }) {
    return request<ApiProperty>(`/admin/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Chat
  conversations() {
    return request<{ id: number; property_id: number; property_title: string; other_name: string; last_message: string | null; last_message_at: string | null; unread_count: number }[]>("/chat/conversations");
  },
  createConversation(property_id: number, seller_id: number) {
    return request<{ id: number }>("/chat/conversations", { method: "POST", body: JSON.stringify({ property_id, seller_id }) });
  },
  messages(convId: number) {
    return request<{ id: number; sender_id: number; sender_name: string; content: string; is_read: boolean; created_at: string }[]>(`/chat/conversations/${convId}/messages`);
  },
  sendMessage(convId: number, content: string) {
    return request<{ id: number }>(`/chat/conversations/${convId}/messages`, { method: "POST", body: JSON.stringify({ content }) });
  },
  unreadCount() {
    return request<{ unread: number }>("/chat/unread-count");
  },

  // Company / Developer profile
  myCompany() {
    return request<{ id: number; company_name: string; license_number: string; company_phone: string; company_address: string; company_description: string; logo_url: string | null; documents: string[]; is_verified: boolean } | null>("/buildings/company");
  },
  saveCompany(data: Record<string, unknown>) {
    return request<{ id: number }>("/buildings/company", { method: "POST", body: JSON.stringify(data) });
  },
  buildingDeveloper(id: number) {
    return request<{ developer_id: number; developer_name: string; company: any }>(`/buildings/${id}/developer`);
  },

  // Buildings
  myBuildings() {
    return request<{ id: number; name: string; district: string; total_floors: number; status: string; apartments: { id: number; floor: number; number: string; rooms: number; area_m2: number; price: number; status: string }[] }[]>("/buildings/mine");
  },
  createBuilding(data: Record<string, unknown>) {
    return request<{ id: number }>("/buildings", { method: "POST", body: JSON.stringify(data) });
  },
  addApartment(buildingId: number, data: Record<string, unknown>) {
    return request<{ id: number }>(`/buildings/${buildingId}/apartments`, { method: "POST", body: JSON.stringify(data) });
  },
  updateApartmentStatus(unitId: number, status: string) {
    return request<{ ok: boolean }>(`/buildings/apartments/${unitId}/status?status=${status}`, { method: "PATCH" });
  },
  publicBuildings(district?: string) {
    const q = district ? `?district=${encodeURIComponent(district)}` : "";
    return request<any[]>(`/buildings/public${q}`);
  },
  publicBuildingDetail(id: number) {
    return request<any>(`/buildings/public/${id}`);
  },

  // Price history
  priceHistory(id: number) {
    return request<{ price: number; recorded_at: string }[]>(`/price-history/${id}`);
  },
  // Agent reviews
  agentReviews(agentId: number) {
    return request<{ id: number; rating: number; comment: string; reviewer_name: string; created_at: string }[]>(`/agent-reviews/${agentId}`);
  },
  agentRatingSummary(agentId: number) {
    return request<{ avg_rating: number; total_reviews: number; distribution: Record<string, number> }>(`/agent-reviews/${agentId}/summary`);
  },
  createAgentReview(agentId: number, rating: number, comment: string) {
    return request<{ id: number }>(`/agent-reviews/${agentId}`, { method: "POST", body: JSON.stringify({ rating, comment }) });
  },

  // Admin companies
  adminCompanies() {
    return request<any[]>("/admin/companies");
  },
  verifyCompany(id: number) {
    return request<{ ok: boolean }>(`/admin/companies/${id}/verify`, { method: "POST" });
  },
  unverifyCompany(id: number) {
    return request<{ ok: boolean }>(`/admin/companies/${id}/unverify`, { method: "POST" });
  },

  // Saved searches
  savedSearches() {
    return request<{ id: number; name: string; filters: Record<string, unknown>; created_at: string }[]>("/saved-searches");
  },
  saveSearch(name: string, filters: Record<string, unknown>) {
    return request<{ id: number }>("/saved-searches", { method: "POST", body: JSON.stringify({ name, filters }) });
  },
  deleteSavedSearch(id: number) {
    return request<{ ok: boolean }>(`/saved-searches/${id}`, { method: "DELETE" });
  },

  // Bookings
  bookings() {
    return request<{ id: number; property_id: number; property_title: string; status: string; deposit_amount: number | null; deposit_paid: boolean; days: number; expires_at: string }[]>("/bookings");
  },
  createBooking(property_id: number, days: number = 3) {
    return request<{ id: number }>("/bookings", { method: "POST", body: JSON.stringify({ property_id, days }) });
  },
  payDeposit(bookingId: number) {
    return request<{ ok: boolean }>(`/bookings/${bookingId}/pay`, { method: "PATCH" });
  },
  cancelBooking(bookingId: number) {
    return request<{ ok: boolean }>(`/bookings/${bookingId}`, { method: "DELETE" });
  },

  // Reviews
  districtRating(district: string) {
    return request<{ district: string; avg_safety: number; avg_infrastructure: number; avg_transport: number; avg_overall: number; review_count: number }>(`/reviews/district/${encodeURIComponent(district)}`);
  },
  propertyReviews(propertyId: number) {
    return request<{ id: number; user_name: string; safety_rating: number; infrastructure_rating: number; transport_rating: number; comment: string; created_at: string }[]>(`/reviews/property/${propertyId}`);
  },
  createReview(propertyId: number, data: { safety_rating: number; infrastructure_rating: number; transport_rating: number; comment: string }) {
    return request<{ id: number }>(`/reviews/property/${propertyId}`, { method: "POST", body: JSON.stringify(data) });
  },

  saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Boost
  createBoost(property_id: number, days: number, price_paid: number) {
    return request<BoostData>("/boost", {
      method: "POST",
      body: JSON.stringify({ property_id, days, price_paid, currency: "USD" }),
    });
  },
  activeBoosts() {
    return request<BoostData[]>("/boost/active");
  },

  // Auto decrease
  setAutoDecrease(property_id: number, enabled: boolean, rate?: number) {
    return request<{ id: number; auto_decrease_enabled: boolean; auto_decrease_rate: number | null }>(
      `/properties/${property_id}/auto-decrease`,
      { method: "PUT", body: JSON.stringify({ enabled, rate }) }
    );
  },

  // View stats
  viewStats(property_id: number) {
    return request<ViewStatsResponse>(`/view-stats/${property_id}`);
  },

  // Analytics
  marketSummary() {
    return request<MarketSummary>("/analytics/market-summary");
  },
  districtAnalytics(district: string) {
    return request<DistrictAnalytics>(`/analytics/district/${encodeURIComponent(district)}`);
  },
  priceTrends() {
    return request<PriceTrend[]>("/analytics/price-trends");
  },

  // Translations
  translations(lang: string) {
    return request<TranslationMap>(`/translations?lang=${lang}`);
  },

  // Social Post
  postToTelegram(propertyId: number) {
    return request<{ status: string; url?: string }>(`/social-post/telegram/${propertyId}`, { method: "POST" });
  },
  shareLink(propertyId: number) {
    return request<{ telegram?: string; whatsapp?: string; facebook?: string }>(`/social-post/link/${propertyId}`);
  },

  // QR
  qrUrl(propertyId: number) {
    return `${API_BASE_URL}/qr/${propertyId}`;
  },

  // Viewings
  createViewing(property_id: number, scheduled_at: string, buyer_name: string, buyer_phone: string, notes?: string) {
    return request<{ id: number }>("/viewings", {
      method: "POST",
      body: JSON.stringify({ property_id, scheduled_at, buyer_name, buyer_phone, notes }),
    });
  },
  viewings() {
    return request<{ id: number; property_id: number; property_title: string; scheduled_at: string; status: string; buyer_name: string; buyer_phone: string; notes: string | null }[]>("/viewings");
  },
  updateViewingStatus(id: number, status: string) {
    return request<{ ok: boolean }>(`/viewings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Referrals
  generateReferralCode() {
    return request<{ code: string }>("/referrals/generate", { method: "POST" });
  },
  myReferralCode() {
    return request<{ code: string; url: string }>("/referrals/my-code");
  },
  myReferrals() {
    return request<{ id: number; referred_name: string; status: string; bonus_earned: number; created_at: string }[]>("/referrals/my-referrals");
  },

  // Report
  reportUrl: `${API_BASE_URL}/report/property-sales`,
};
