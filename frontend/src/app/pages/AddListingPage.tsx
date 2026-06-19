import { useState } from "react";
import { Building, Home, Star, Layers, BarChart2, Upload, X, Shield, Check, Plus, Zap, ChevronDown } from "lucide-react";
import type { Page } from "../types";
import type { PropertyCreatePayload, ApiProperty, ApiUser } from "../../lib/types";
import { api } from "../../lib/api";
import { REGIONS, METRO_STATIONS } from "../types";
import LocationPicker from "../components/LocationPicker";
import { t } from "../../lib/i18n";

function AddListingPage({
  onNav,
  currentUser,
  onCreated,
}: {
  onNav: (p: Page) => void;
  currentUser: ApiUser | null;
  onCreated: (property: ApiProperty) => void;
}) {
  const [step, setStep] = useState(1);
  const [adType, setAdType] = useState("");
  const [objType, setObjType] = useState("");
  const [repair, setRepair] = useState("");
  const [currency, setCurrency] = useState("USD ($)");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [metroStation, setMetroStation] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(41.311);
  const [lng, setLng] = useState(69.279);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [area, setArea] = useState("");
  const [floorText, setFloorText] = useState("");
  const [buildingType, setBuildingType] = useState("Panel");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const totalSteps = 6;
  const stepLabels = ["E'lon turi", "Obyekt turi", "Manzil", "Ma'lumotlar", "Rasmlar", "Aloqa"];
  const adTypeMap: Record<string, PropertyCreatePayload["operation_type"]> = {
    sotuv: "sale",
    ijara: "rent",
    kunlik: "daily_rent",
  };
  const objTypeMap: Record<string, PropertyCreatePayload["property_type"]> = {
    kvartira: "apartment",
    uy: "house",
    yer: "land",
    tijoriy: "commercial",
  };
  const ownerTypeMap: Record<string, PropertyCreatePayload["owner_type"]> = {
    user: "owner",
    owner: "owner",
    agent: "agent",
  };

  const toggleAmenity = (key: string) => {
    setAmenities((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const submitListing = async () => {
    if (!currentUser) {
      onNav("login");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    const [floor, totalFloors] = floorText.split("/").map((value) => Number(value.trim()));
    try {
      const property = await api.createProperty({
        title: title || `${rooms || ""} xonali ${objType || "mulk"}, ${district}`.trim(),
        description: description || "UyMap.uz orqali qo'shilgan e'lon.",
        operation_type: adTypeMap[adType] ?? "sale",
        property_type: objTypeMap[objType] ?? "apartment",
        price: Number(price || 0),
        currency: currency.startsWith("USD") ? "USD" : "UZS",
        price_period: adType === "ijara" ? "month" : adType === "kunlik" ? "day" : null,
        district: district || "Yunusobod",
        city: region || city,
        address,
        metro_station: metroStation || null,
        latitude: lat,
        longitude: lng,
        rooms: Number(rooms || 0),
        area_m2: Number(area || 0),
        floor: Number.isFinite(floor) ? floor : null,
        total_floors: Number.isFinite(totalFloors) ? totalFloors : null,
        building_type: buildingType,
        repair_type: repair || null,
        document_status: "Tekshiruvda",
        owner_type: ownerTypeMap[role] ?? "owner",
        amenities,
        image_urls: imageUrls,
      });
      onCreated(property);
      onNav("dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "E'lon yuborishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!currentUser) {
      onNav("login");
      return;
    }
    setSubmitError("");
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setImageUrls(prev => [...prev, api.mediaUrl(result.url)]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Rasm yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Yangi e'lon qo'shish</h1>
          <p className="text-sm text-gray-500">E'loningiz moderatsiyadan so'ng joylashtiriladi</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            return (
              <div key={n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      n < step
                        ? "bg-green-600 text-white"
                        : n === step
                        ? "bg-green-600 text-white ring-4 ring-green-100"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {n < step ? <Check size={13} /> : n}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 hidden md:block text-center w-16 leading-tight">
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 mb-4 md:mb-0 transition-colors ${
                      n < step ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">E'lon turini tanlang</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: "sotuv", label: t("sale"), icon: Building, desc: "Mulkni sotish" },
                  { v: "ijara", label: t("rent"), icon: Home, desc: "Uzoq muddatli" },
                  { v: "kunlik", label: "Kunlik ijara", icon: Star, desc: "Qisqa muddatli" },
                ].map(({ v, label, icon: Icon, desc }) => (
                  <button
                    key={v}
                    onClick={() => setAdType(v)}
                    className={`border-2 rounded-2xl p-4 text-left transition-all ${
                      adType === v
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`mb-2 transition-colors ${adType === v ? "text-green-600" : "text-gray-400"}`}
                    />
                    <div className="font-bold text-gray-900 text-sm">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tezkor shablonlar</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Tez sotish", desc: "Bozordan 10% arzon, urg'ent", icon: Zap },
                    { label: "Premium", desc: "Reklama + tasdiqlangan", icon: Shield },
                    { label: "Ijaraga", desc: "Uzoq muddatli ijara", icon: Home },
                    { label: "Kvartira", desc: "Standart kvartira formati", icon: Building },
                  ].map(({ label, desc, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setAdType("sotuv");
                        setObjType("kvartira");
                        if (label === "Tez sotish") {
                          setPrice(String(Math.round(Math.random() * 50000 + 30000)));
                          setTitle("Tez sotiladi!");
                        } else if (label === "Ijaraga") {
                          setAdType("ijara");
                        }
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left"
                    >
                      <Icon size={16} className="text-green-500 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{label}</div>
                        <div className="text-[10px] text-gray-400">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Obyekt turini tanlang</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: "kvartira", label: "Kvartira", icon: Building },
                  { v: "uy", label: "Uy", icon: Home },
                  { v: "yer", label: "Yer", icon: Layers },
                  { v: "tijoriy", label: "Tijoriy obyekt", icon: BarChart2 },
                ].map(({ v, label, icon: Icon }) => (
                  <button
                    key={v}
                    onClick={() => setObjType(v)}
                    className={`border-2 rounded-2xl p-4 flex items-center gap-3 transition-all text-left ${
                      objType === v
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        objType === v ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={objType === v ? "text-green-600" : "text-gray-500"}
                      />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Manzil</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Viloyat</label>
                  <div className="relative">
                    <select value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white appearance-none cursor-pointer">
                      <option value="">Viloyatni tanlang</option>
                      {Object.keys(REGIONS).map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("district")}</label>
                  <div className="relative">
                    <select value={district} onChange={(e) => setDistrict(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white appearance-none cursor-pointer">
                      <option value="">Tumanni tanlang</option>
                      {region && REGIONS[region]?.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                {region === "Toshkent shahri" && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("metro")}</label>
                    <div className="relative">
                      <select value={metroStation} onChange={(e) => setMetroStation(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white appearance-none cursor-pointer">
                        <option value="">Metro tanlang</option>
                        {METRO_STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("address")}</label>
                  <input
                    type="text"
                    placeholder="Ko'cha, uy raqami"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Xaritadan joy tanlang
                  </label>
                  <LocationPicker
                    lat={lat}
                    lng={lng}
                    onChange={(newLat, newLng) => {
                      setLat(newLat);
                      setLng(newLng);
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Xaritadagi joyni bosing yoki markerni sudrab olib boring — koordinatalar avtomatik saqlanadi
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Asosiy ma'lumotlar</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Sarlavha</label>
                  <input
                    type="text"
                    placeholder="Masalan: 2 xonali kvartira, Yunusobod"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("price")}</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Valyuta</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white"
                    >
                      <option>USD ($)</option>
                      <option>UZS (so'm)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("rooms")}</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("area")}</label>
                    <input
                      type="number"
                      placeholder="60"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("floor")}</label>
                    <input
                      type="text"
                      placeholder="5/9"
                      value={floorText}
                      onChange={(e) => setFloorText(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Bino turi</label>
                    <select
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white"
                    >
                      <option>Panel</option>
                      <option>Monolitik</option>
                      <option>G'isht</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Remont holati</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Yangi", "Yaxshi", "O'rtacha", "Kapital", "Kosmetic", "Remontsiz"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRepair(r)}
                        className={`border-2 rounded-xl py-2 text-xs font-semibold transition-colors ${
                          repair === r
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 text-gray-600 hover:border-green-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">{t("description")}</label>
                  <textarea
                    placeholder="Mulk haqida qisqa va aniq ma'lumot yozing"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-24 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">{t("amenities")}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["lift", "Lift"],
                      ["parking", "Parking"],
                      ["metro", "Metro"],
                      ["school", "Maktab"],
                      ["balcony", "Balkon"],
                      ["ac", "Konditsioner"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => toggleAmenity(key)}
                        className={`border-2 rounded-xl py-2 text-xs font-semibold transition-colors ${
                          amenities.includes(key)
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 text-gray-600 hover:border-green-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">Rasmlar</h2>
              <p className="text-sm text-gray-400 mb-5">Kamida 3 ta rasm yuklang (maksimal 20 ta)</p>
              <div className="grid grid-cols-3 gap-3">
                <label className="aspect-square border-2 border-dashed border-green-300 rounded-2xl flex flex-col items-center justify-center bg-green-50 cursor-pointer hover:bg-green-100 transition-colors">
                  <Upload size={22} className="text-green-500 mb-2" />
                  <span className="text-xs text-green-600 font-semibold text-center leading-tight">
                    {uploading ? "Yuklanmoqda..." : "Rasm qo'shish"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    key={imageUrls.length}
                    onChange={(e) => {
                      handleImageUpload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={url} alt="" className="w-full h-full rounded-2xl object-cover bg-gray-100" />
                    <button
                      onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 5 - imageUrls.length) }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50 cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <Plus size={18} className="text-gray-300" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="url"
                  placeholder="Rasm URL manzili"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      setImageUrls(prev => [...prev, imageUrlInput.trim()]);
                      setImageUrlInput("");
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm"
                >
                  Qo'shish
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">JPG, PNG • Maksimal 5 MB har bir rasm</p>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Aloqa ma'lumotlari</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Ism</label>
                  <input
                    type="text"
                    placeholder="To'liq ismingiz"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Telefon raqam</label>
                  <div className="flex gap-2">
                    <div className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 bg-gray-50 font-medium">
                      +998
                    </div>
                    <input
                      type="tel"
                      placeholder="90 123 45 67"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Telegram username <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="username"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Siz kimsiiz?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "user", l: "Oddiy foydalanuvchi" },
                      { v: "owner", l: "Uy egasi" },
                      { v: "agent", l: "Agent" },
                    ].map(({ v, l }) => (
                      <button
                        key={v}
                        onClick={() => setRole(v)}
                        className={`border-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                          role === v
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 text-gray-600 hover:border-green-300"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 w-4 h-4 accent-green-600 rounded" />
                    <span className="text-xs text-gray-600">
                      UyMap.uz foydalanish shartlari va maxfiylik siyosatiga roziman
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {submitError && <div className="flex-1 text-sm font-semibold text-red-600">{submitError}</div>}
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors"
            >
              Orqaga
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Davom etish
            </button>
          ) : (
            <button
              onClick={submitListing}
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Shield size={15} /> {submitting ? "Yuborilmoqda..." : "Moderatsiyaga yuborish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddListingPage;
