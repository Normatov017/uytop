import { createContext, useContext } from "react";

export type Lang = "uz" | "ru" | "en";

type Translations = Record<string, Record<Lang, string>>;

const translations: Translations = {
  // Navigation
  "nav.sale": { uz: "Sotuv", ru: "Продажа", en: "Sale" },
  "nav.rent": { uz: "Ijara", ru: "Аренда", en: "Rent" },
  "nav.new_homes": { uz: "Yangi uylar", ru: "Новые дома", en: "New homes" },
  "nav.commercial": { uz: "Tijoriy", ru: "Коммерческая", en: "Commercial" },
  "nav.map": { uz: "Xarita", ru: "Карта", en: "Map" },
  "nav.mortgage": { uz: "Ipoteka", ru: "Ипотека", en: "Mortgage" },
  "nav.messages": { uz: "Xabarlar", ru: "Сообщения", en: "Messages" },
  "nav.new_building": { uz: "Yangi qurilish", ru: "Новостройки", en: "New buildings" },
  "nav.compare": { uz: "Solishtirish", ru: "Сравнить", en: "Compare" },
  "nav.roi": { uz: "ROI", ru: "ROI", en: "ROI" },
  "nav.ai_price": { uz: "AI baho", ru: "AI оценка", en: "AI price" },
  "nav.panel": { uz: "Panel", ru: "Панель", en: "Panel" },
  "nav.education": { uz: "O'quv", ru: "Обучение", en: "Education" },
  "nav.bookings": { uz: "Bronlar", ru: "Брони", en: "Bookings" },
  "nav.add_listing": { uz: "E'lon berish", ru: "Подать объявление", en: "Add listing" },
  "nav.more": { uz: "Ko'proq", ru: "Ещё", en: "More" },
  "nav.analytics": { uz: "Analitika", ru: "Аналитика", en: "Analytics" },
  "nav.boost": { uz: "Reklama", ru: "Продвижение", en: "Boost" },
  "nav.view_stats": { uz: "Statistika", ru: "Статистика", en: "View stats" },

  // Auth
  "auth.login": { uz: "Kirish", ru: "Войти", en: "Login" },
  "auth.register": { uz: "Ro'yxatdan o'tish", ru: "Регистрация", en: "Register" },
  "auth.logout": { uz: "Chiqish", ru: "Выйти", en: "Logout" },
  "auth.profile": { uz: "Profil", ru: "Профиль", en: "Profile" },
  "auth.admin": { uz: "Admin", ru: "Админ", en: "Admin" },

  // Home
  "home.title": { uz: "O'zbekistondagi eng yaxshi ko'chmas mulk", ru: "Лучшая недвижимость в Узбекистане", en: "The best real estate in Uzbekistan" },
  "home.subtitle": { uz: "UyMap.uz orqali uy topish, sotish va ijaraga berish", ru: "Найдите, продайте или сдайте недвижимость на UyMap.uz", en: "Find, sell or rent property on UyMap.uz" },

  // Common
  "common.search": { uz: "Qidirish", ru: "Поиск", en: "Search" },
  "common.loading": { uz: "Yuklanmoqda...", ru: "Загрузка...", en: "Loading..." },
  "common.error": { uz: "Xatolik yuz berdi", ru: "Произошла ошибка", en: "An error occurred" },
  "common.save": { uz: "Saqlash", ru: "Сохранить", en: "Save" },
  "common.cancel": { uz: "Bekor qilish", ru: "Отмена", en: "Cancel" },
  "common.delete": { uz: "O'chirish", ru: "Удалить", en: "Delete" },
  "common.edit": { uz: "Tahrirlash", ru: "Редактировать", en: "Edit" },
  "common.back": { uz: "Orqaga", ru: "Назад", en: "Back" },

  // Analytics
  "analytics.title": { uz: "Bozor tahlili", ru: "Анализ рынка", en: "Market analytics" },
  "analytics.total_listings": { uz: "Jami e'lonlar", ru: "Всего объявлений", en: "Total listings" },
  "analytics.avg_price": { uz: "O'rtacha narx", ru: "Средняя цена", en: "Average price" },
  "analytics.avg_per_m2": { uz: "O'rtacha m² narxi", ru: "Средняя цена за м²", en: "Average per m²" },
  "analytics.by_district": { uz: "Tumanlar bo'yicha", ru: "По районам", en: "By district" },
  "analytics.price_trends": { uz: "Narx tendensiyalari", ru: "Тенденции цен", en: "Price trends" },

  // Boost
  "boost.title": { uz: "E'lonni reklama qilish", ru: "Продвижение объявления", en: "Boost listing" },
  "boost.description": { uz: "E'loningizni yuqori o'rinlarga chiqarib, ko'proq xaridorlarni jalb qiling", ru: "Поднимите объявление в топ и привлеките больше покупателей", en: "Get your listing to the top and attract more buyers" },
  "boost.days": { uz: "kun", ru: "дней", en: "days" },
  "boost.activate": { uz: "Reklama qilish", ru: "Продвинуть", en: "Boost now" },
  "boost.active": { uz: "Aktiv", ru: "Активно", en: "Active" },
  "boost.expires": { uz: "Tugash muddati", ru: "Срок действия", en: "Expires" },

  // View stats
  "stats.title": { uz: "Ko'rish statistikasi", ru: "Статистика просмотров", en: "View statistics" },
  "stats.views": { uz: "Ko'rishlar", ru: "Просмотры", en: "Views" },
  "stats.phone_clicks": { uz: "Telefon bosishlar", ru: "Клики телефона", en: "Phone clicks" },
  "stats.telegram_clicks": { uz: "Telegram bosishlar", ru: "Клики Telegram", en: "Telegram clicks" },
  "stats.unique_viewers": { uz: "Noyob ko'ruvchilar", ru: "Уникальные зрители", en: "Unique viewers" },
  "stats.recent_views": { uz: "Oxirgi 30 kun", ru: "Последние 30 дней", en: "Last 30 days" },

  // Auto decrease
  "autodecrease.title": { uz: "Avtomatik narx tushishi", ru: "Автоматическое снижение цены", en: "Auto price decrease" },
  "autodecrease.description": { uz: "Har kuni narx % ga kamayadi, tezroq sotish uchun", ru: "Цена снижается каждый день на %, для быстрой продажи", en: "Price decreases daily by % for quicker sale" },
  "autodecrease.enable": { uz: "Yoqish", ru: "Включить", en: "Enable" },
  "autodecrease.disable": { uz: "O'chirish", ru: "Отключить", en: "Disable" },
  "autodecrease.rate": { uz: "Kunlik pasayish %", ru: "Ежедневное снижение %", en: "Daily decrease %" },
};

export type { Translations };

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

export interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType>({
  lang: "uz",
  setLang: () => {},
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);
