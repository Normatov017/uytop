const RV_KEY = "uymap_recently_viewed";
const PREF_KEY = "uymap_buyer_prefs";

export interface BuyerPreferences {
  region?: string;
  district?: string;
  budgetMin?: number;
  budgetMax?: number;
  propertyType?: string;
  rooms?: string;
}

export function getRecentlyViewed(): number[] {
  try {
    return JSON.parse(localStorage.getItem(RV_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentlyViewed(id: number): void {
  const items = getRecentlyViewed().filter((i) => i !== id);
  items.unshift(id);
  localStorage.setItem(RV_KEY, JSON.stringify(items.slice(0, 30)));
}

export function clearRecentlyViewed(): void {
  localStorage.removeItem(RV_KEY);
}

export function getPreferences(): BuyerPreferences {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  } catch {
    return {};
  }
}

export function savePreferences(prefs: BuyerPreferences): void {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export function clearPreferences(): void {
  localStorage.removeItem(PREF_KEY);
}
