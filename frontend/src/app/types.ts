import type { ApiProperty, UserRole } from "../lib/types";

export type Page = "home" | "listings" | "map" | "detail" | "add" | "login" | "register" | "dashboard" | "admin" | "calculator" | "chat" | "roi" | "developer" | "bookings" | "avm" | "education" | "public-buildings" | "compare" | "analytics" | "boost" | "crm" | "viewings" | "agent" | "wanted";

export interface Listing {
  id: number;
  title: string;
  price: string;
  priceNum: number;
  currency: string;
  location: string;
  rooms: number;
  area: number;
  floor: string;
  type: string;
  repair: string;
  district: string;
  region: string;
  image: string;
  images: string[];
  verified: boolean;
  views: number;
  status: string;
  apiStatus: ApiProperty["status"];
  isPremium: boolean;
  isUrgent: boolean;
  metroStation: string;
  lat: number;
  lng: number;
  description: string;
  amenities: string[];
  ownerId: number;
  owner: { name: string; phone: string; telegram: string };
}

export const roleLabels: Record<UserRole, string> = {
  USER: "Foydalanuvchi",
  OWNER: "Uy egasi",
  AGENT: "Agent",
  ADMIN: "Admin",
  DEVELOPER: "Qurilish kompaniyasi",
};

export const propertyTypeLabels: Record<ApiProperty["property_type"], string> = {
  apartment: "Kvartira",
  house: "Uy",
  land: "Yer",
  commercial: "Tijoriy",
  new_building: "Yangi bino",
};

const operationStatusLabels: Record<ApiProperty["operation_type"], string> = {
  sale: "sotuv",
  rent: "ijara",
  daily_rent: "ijara",
};

export const REGIONS: Record<string, string[]> = {
  "Toshkent shahri": [
    "Bektemir", "Chilonzor", "Yashnobod", "Mirobod", "Mirzo Ulug'bek",
    "Sergeli", "Shayxontohur", "Olmazor", "Uchtepa", "Yakkasaroy", "Yunusobod", "Yangihayot",
  ],
  "Toshkent viloyati": [
    "Oqqo'rg'on", "Ohangaron", "Bekobod", "Bo'stonliq", "Bo'ka", "Chinoz",
    "Qibray", "Parkent", "Piskent", "O'rta Chirchiq", "Yuqori Chirchiq",
    "Toyloq", "Zangiota", "Yangiyo'l",
  ],
  "Andijon viloyati": [
    "Andijon", "Asaka", "Baliqchi", "Bo'ston", "Buloqboshi", "Izboskan",
    "Jalaquduq", "Xo'jaobod", "Qo'rg'ontepa", "Marxamat", "Oltinko'l",
    "Paxtaobod", "Shahrixon", "Ulug'nor",
  ],
  "Buxoro viloyati": [
    "Buxoro", "G'ijduvon", "Jondor", "Kogon", "Qorako'l", "Qorovulbozor",
    "Olot", "Peshku", "Romitan", "Shofirkon", "Vobkent",
  ],
  "Farg'ona viloyati": [
    "Bog'dod", "Buvayda", "Beshariq", "Dang'ara", "Farg'ona", "Quvasoy",
    "Qo'qon", "Oltiariq", "Rishton", "So'x", "Toshloq", "O'zbekiston",
    "Uchko'prik", "Yozyovon",
  ],
  "Jizzax viloyati": [
    "Arnasoy", "Baxmal", "Do'stlik", "Forish", "G'allaorol", "Mirzacho'l",
    "Paxtakor", "Sharof Rashidov", "Zomin", "Zarbdor", "Zafarobod", "Yangiobod",
  ],
  "Namangan viloyati": [
    "Kosonsoy", "Mingbuloq", "Namangan", "Norin", "Pop", "To'raqo'rg'on",
    "Uchqo'rg'on", "Chortoq", "Chust", "Yangiqo'rg'on",
  ],
  "Navoiy viloyati": [
    "Karmana", "Qiziltepa", "Konimex", "Navbahor", "Nurota", "Tomdi",
    "Uchquduq", "Xatirchi",
  ],
  "Qashqadaryo viloyati": [
    "Chiroqchi", "Dehqonobod", "G'uzor", "Qamashi", "Qarshi", "Kasbi",
    "Kitob", "Koson", "Mirishkor", "Muborak", "Nishon", "Shahrisabz",
    "Yakkabog'",
  ],
  "Qoraqalpog'iston Respublikasi": [
    "Amudaryo", "Beruniy", "Chimboy", "Ellikqal'a", "Kegeyli", "Mo'ynoq",
    "Nukus", "Qanliko'l", "Qo'ng'irot", "Qorao'zak", "Shumanay", "Taxtako'pir",
    "To'rtko'l", "Xo'jayli",
  ],
  "Samarqand viloyati": [
    "Bulung'ur", "Ishtixon", "Jomboy", "Kattaqo'rg'on", "Qo'shrabot", "Narpay",
    "Nurobod", "Oqdaryo", "Payariq", "Pastdarg'om", "Paxtachi", "Samarqand",
    "Toyloq", "Urgut",
  ],
  "Sirdaryo viloyati": [
    "Boyovut", "Guliston", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod",
    "Sirdaryo", "Xovos",
  ],
  "Surxondaryo viloyati": [
    "Angor", "Bandixon", "Boysun", "Denov", "Jarqo'rg'on", "Muzrabot",
    "Oltinsoy", "Qiziriq", "Qumqo'rg'on", "Sariosiyo", "Sherobod", "Sho'rchi",
    "Termiz", "Uzun",
  ],
  "Xorazm viloyati": [
    "Bog'ot", "Gurlan", "Xonqa", "Xo'jayli", "Qo'shko'pir", "Shovot",
    "Urganch", "Yangiariq", "Yangibozor",
  ],
};

export const DISTRICTS = Object.values(REGIONS).flat();

export const METRO_STATIONS = [
  { name: "Chilonzor", lat: 41.2889, lng: 69.2053 },
  { name: "Olmazor", lat: 41.2936, lng: 69.1925 },
  { name: "Milliy bog'", lat: 41.2988, lng: 69.2147 },
  { name: "Ming Urik", lat: 41.3029, lng: 69.2334 },
  { name: "Oybek", lat: 41.3080, lng: 69.2487 },
  { name: "Mustaqillik maydoni", lat: 41.3144, lng: 69.2487 },
  { name: "Amir Temur", lat: 41.3118, lng: 69.2795 },
  { name: "Novza", lat: 41.3157, lng: 69.2965 },
  { name: "Kosmonavtlar", lat: 41.3264, lng: 69.3105 },
  { name: "Toshkent", lat: 41.3365, lng: 69.3058 },
  { name: "Bodomzor", lat: 41.3456, lng: 69.2988 },
  { name: "Minor", lat: 41.3498, lng: 69.2895 },
  { name: "Abdulla Qodiriy", lat: 41.3404, lng: 69.2747 },
  { name: "Yunus Rajabiy", lat: 41.3326, lng: 69.2560 },
  { name: "Buyuk Turon", lat: 41.3248, lng: 69.2415 },
  { name: "Qipchoq", lat: 41.3185, lng: 69.2253 },
];

export const UNIVERSITIES = [
  { name: "Toshkent Davlat Universiteti (O'zMU)", lat: 41.3325, lng: 69.2455 },
  { name: "Toshkent Texnika Universiteti (TDTU)", lat: 41.3408, lng: 69.3025 },
  { name: "Toshkent Iqtisodiyot Universiteti (TDIU)", lat: 41.3124, lng: 69.2796 },
  { name: "Toshkent Tibbiyot Akademiyasi (TTA)", lat: 41.2568, lng: 69.2627 },
  { name: "Toshkent Arxitektura Instituti", lat: 41.3156, lng: 69.2789 },
  { name: "Toshkent Kimyo Texnologiya Instituti", lat: 41.3032, lng: 69.2689 },
  { name: "Toshkent Davlat Yuridik Universiteti (TDYU)", lat: 41.3495, lng: 69.2947 },
  { name: "Toshkent Avtomobil-Yo'llar Instituti", lat: 41.3018, lng: 69.3191 },
  { name: "Toshkent Irrigatsiya Instituti (TIIAME)", lat: 41.3467, lng: 69.2923 },
  { name: "O'zbekiston Milliy Universiteti (Jahon tillari)", lat: 41.2901, lng: 69.2188 },
  { name: "Toshkent Pediatriya Tibbiyot Instituti", lat: 41.3771, lng: 69.2851 },
  { name: "Toshkent Davlat Sharqshunoslik Instituti", lat: 41.3111, lng: 69.2785 },
  { name: "Toshkent Moliya Instituti", lat: 41.3223, lng: 69.2298 },
  { name: "Toshkent Davlat Agrar Universiteti", lat: 41.2701, lng: 69.1725 },
  { name: "Turin Politexnika Universiteti (Turin)", lat: 41.3346, lng: 69.2985 },
  { name: "Inha Universiteti", lat: 41.3360, lng: 69.2915 },
  { name: "Webster Universiteti", lat: 41.3215, lng: 69.2920 },
  { name: "Amir Temur nomidagi Toshkent Davlat Madaniyat Instituti", lat: 41.2944, lng: 69.2318 },
];
