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
  "Chilonzor", "Olmazor", "Milliy bog'", "Ming Urik", "Oybek",
  "Mustaqillik maydoni", "Amir Temur", "Novza", "Kosmonavtlar",
  "Toshkent", "Bodomzor", "Minor", "Abdulla Qodiriy",
  "Yunus Rajabiy", "Buyuk Turon", "Qipchoq",
];
