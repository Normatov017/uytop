import { useEffect, useRef, useState } from "react";
import { Building2, Plus, Layers, X, Check, Upload, FileText, Shield, MapPin, Home, Image as ImageIcon, Loader, ChevronDown } from "lucide-react";
import { api } from "../../lib/api";
import type { Page } from "../types";
import { REGIONS } from "../types";
import { t } from "../../lib/i18n";
import { MOCK_BUILDINGS } from "../data/mockData";

interface Apartment {
  id: number; floor: number; number: string; rooms: number;
  area_m2: number; price: number; status: string;
  plan_image?: string;
}

interface Building {
  id: number; name: string; district: string; city: string;
  total_floors: number; total_apartments: number; status: string;
  property_type: string; images: string[]; completion_date: string | null;
  free: number; booked: number; sold: number;
  apartments: Apartment[];
}

const statusColors: Record<string, string> = {
  free: "bg-green-100 text-green-700",
  booked: "bg-amber-100 text-amber-700",
  sold: "bg-gray-200 text-gray-500",
};

const propertyTypes = [
  { value: "apartment", label: "Kvartira" },
  { value: "house", label: "Uy" },
  { value: "commercial", label: "Tijoriy" },
  { value: "elite", label: "Elit" },
];
const materialOptions = ["Monolit", "Panel", "G'isht", "Karkas", "Blok"];
const parkingOptions = ["Er osti", "Yer ustki", "Ko'p qavatli", "Mavjud emas"];

export default function DeveloperPage({ onNav }: { onNav: (p: Page) => void }) {
  const [tab, setTab] = useState<"buildings" | "company">("buildings");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddApt, setShowAddApt] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [region, setRegion] = useState("Toshkent shahri");

  // Company form
  const [company, setCompany] = useState({
    company_name: "", license_number: "", company_phone: "",
    company_address: "", company_description: "", logo_url: "",
    documents: [] as string[],
  });
  const [companyLoaded, setCompanyLoaded] = useState(false);

  // Building form
  const [form, setForm] = useState({
    name: "", description: "", district: "", city: "Toshkent",
    address: "", total_floors: 5, total_apartments: 0,
    property_type: "apartment", segment: "", building_material: "", parking_type: "",
    elevator_count: 0, images: [] as string[], amenities: [] as string[],
    completion_date: "",
  });
  const [aptForm, setAptForm] = useState({ floor: 1, number: "", rooms: 1, area_m2: 40, price: 30000, plan_image: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadBuildings = () => {
    setLoading(true);
    api.myBuildings().then(d => { setBuildings(d); setLoading(false); }).catch(() => { setBuildings(MOCK_BUILDINGS); setLoading(false); });
  };

  const loadCompany = async () => {
    try {
      const data = await api.myCompany();
      if (data) {
        setCompany({
          company_name: data.company_name,
          license_number: data.license_number,
          company_phone: data.company_phone,
          company_address: data.company_address || "",
          company_description: data.company_description || "",
          logo_url: data.logo_url || "",
          documents: data.documents || [],
        });
      }
      setCompanyLoaded(true);
    } catch { setCompanyLoaded(true); }
  };

  useEffect(() => { loadBuildings(); loadCompany(); }, []);

  const saveCompany = async () => {
    if (!company.company_name || !company.license_number || !company.company_phone) return;
    await api.saveCompany(company);
    alert("Kompaniya ma'lumotlari saqlandi!");
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm(f => ({ ...f, images: [...f.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const toggleAmenity = (a: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setCompany(c => ({ ...c, documents: [...c.documents, url] }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fayl yuklashda xatolik. Faqat JPG, PNG, WEBP va PDF formatlari qabul qilinadi.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const docName = (url: string) => {
    const parts = url.split("/");
    const name = parts[parts.length - 1] || "";
    if (name.endsWith(".pdf")) return name;
    return name.replace(/^[a-f0-9]{32}/, "Rasm");
  };

  const createBuilding = async () => {
    if (!form.name || !form.district) return;
    await api.createBuilding(form);
    setShowAdd(false);
    setStep(1);
    setForm({ name: "", description: "", district: "", city: "Toshkent", address: "", total_floors: 5, total_apartments: 0, property_type: "apartment", segment: "", building_material: "", parking_type: "", elevator_count: 0, images: [], amenities: [], completion_date: "" });
    loadBuildings();
  };

  const addApartment = async () => {
    if (!showAddApt || !aptForm.number) return;
    await api.addApartment(showAddApt, aptForm);
    setShowAddApt(null);
    setAptForm({ floor: 1, number: "", rooms: 1, area_m2: 40, price: 30000, plan_image: "" });
    loadBuildings();
  };

  const toggleAptStatus = async (apt: Apartment) => {
    const next = apt.status === "free" ? "booked" : apt.status === "booked" ? "sold" : "free";
    await api.updateApartmentStatus(apt.id, next);
    loadBuildings();
  };

  if (loading && !companyLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Developer paneli</h1>
            <p className="text-sm text-gray-400">Qurilish va kompaniya ma'lumotlarini boshqaring</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {[
            { id: "buildings", label: "Qurilishlar" },
            { id: "company", label: "Kompaniya" },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ───── COMPANY TAB ───── */}
        {tab === "company" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg">Kompaniya ma'lumotlari</h2>
            <p className="text-sm text-gray-400">Mijozlar kompaniyangiz haqida to'liq ma'lumot ko'rishi uchun quyidagi maydonlarni to'ldiring.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Kompaniya nomi *</label>
                <input value={company.company_name} onChange={e => setCompany(c => ({ ...c, company_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" placeholder={'MCHJ "Toshkent Qurilish"'} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Litsenziya raqami *</label>
                <input value={company.license_number} onChange={e => setCompany(c => ({ ...c, license_number: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" placeholder="Litsenziya № 001234" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Telefon *</label>
                <input value={company.company_phone} onChange={e => setCompany(c => ({ ...c, company_phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" placeholder="+998 78 123-45-67" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Manzil</label>
                <input value={company.company_address} onChange={e => setCompany(c => ({ ...c, company_address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" placeholder="Toshkent, Amir Temur 100" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Kompaniya haqida</label>
              <textarea value={company.company_description} onChange={e => setCompany(c => ({ ...c, company_description: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 min-h-[80px]" placeholder="Qurilish kompaniyangiz haqida qisqacha..." />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Logo</label>
              <div className="flex gap-2">
                <input value={company.logo_url} onChange={e => setCompany(c => ({ ...c, logo_url: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" placeholder="https://example.com/logo.png" />
                <label className="flex items-center gap-2 bg-gray-100 px-4 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload size={14} /> Yuklash
                  <input type="file" accept=".jpg,.jpeg,.png,.webp"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try { const { url } = await api.uploadImage(file); setCompany(c => ({ ...c, logo_url: url })); }
                      catch { alert("Yuklashda xatolik"); }
                      e.target.value = "";
                    }} className="hidden" />
                </label>
              </div>
            </div>

            {/* Documents */}
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-green-600" /> Hujjatlar (mijozlar ko'radi)
                </h3>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadDoc} className="hidden" />
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}>
                  {uploading ? (
                    <Loader size={28} className="text-green-500 mx-auto mb-2 animate-spin" />
                  ) : (
                    <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                  )}
                  <div className="text-sm font-semibold text-gray-600">Litsenziya, sertifikat va guvohnomalarni yuklang</div>
                  <div className="text-xs text-gray-400 mt-1">PDF, JPG, PNG formatida</div>
                  <button type="button" disabled={uploading}
                    className="mt-3 bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
                    {uploading ? "Yuklanmoqda..." : "Yuklash"}
                  </button>
                </div>
              {company.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {company.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <a href={doc} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:text-green-600 transition-colors min-w-0">
                        <FileText size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-700 truncate">{docName(doc)}</span>
                      </a>
                      <button onClick={() => setCompany(c => ({ ...c, documents: c.documents.filter((_, j) => j !== i) }))}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-lg shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <Shield size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <span className="font-bold">Tasdiqlash:</span> Hujjatlaringizni yuklaganingizdan so'ng, admin tomonidan tekshiriladi va kompaniyangiz "Tasdiqlangan" belgisiga ega bo'ladi.
              </div>
            </div>

            <button onClick={saveCompany}
              disabled={!company.company_name || !company.license_number || !company.company_phone}
              className="w-full bg-green-600 text-white rounded-xl py-3.5 text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
              Ma'lumotlarni saqlash
            </button>
          </div>
        )}

        {/* ───── BUILDINGS TAB ───── */}
        {tab === "buildings" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">{buildings.length} ta qurilish</p>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">
                <Plus size={16} /> {t("new_construction")}
              </button>
            </div>

            {buildings.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Building2 size={48} className="mx-auto mb-3 text-gray-200" />
                <div className="text-gray-500 text-sm">Hali qurilish qo'shilmagan</div>
                <button onClick={() => setShowAdd(true)}
                  className="mt-3 text-green-600 text-sm font-bold hover:underline">Birinchi qurilishni qo'shish</button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5">
              {buildings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-gray-900">{b.name}</h2>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          b.status === "completed" ? "bg-green-100 text-green-700" :
                          b.status === "construction" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {b.status === "completed" ? "Qurilgan" : b.status === "construction" ? "Qurilmoqda" : "Reja"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">
                        <MapPin size={12} className="inline mr-1" />{b.district}, {b.city}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        <span><Layers size={12} className="inline mr-1" />{b.total_floors} qavat</span>
                        <span className="text-green-600 font-bold">{b.free} ta bo'sh</span>
                        <span className="text-amber-600 font-bold">{b.booked} ta bron</span>
                        <span className="text-gray-400 font-bold">{b.sold} ta sotilgan</span>
                      </div>
                    </div>
                    <button onClick={() => setShowAddApt(b.id)}
                      className="flex items-center gap-1.5 text-green-600 text-sm font-bold border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors shrink-0">
                      <Plus size={14} /> Kvartira
                    </button>
                  </div>

                  {/* Apartment grid */}
                  {b.apartments.length > 0 ? (
                    <div>
                      <div className="flex gap-2 mb-3 overflow-x-auto">
                        {["Barchasi", "1 xona", "2 xona", "3 xona", "4 xona"].map(f => {
                          const roomCount = f === "Barchasi" ? -1 : parseInt(f);
                          const filtered = roomCount === -1 ? b.apartments : b.apartments.filter((a: Apartment) => a.rooms === roomCount);
                          if (filtered.length === 0) return null;
                          return (
                            <button key={f} onClick={() => {
                              const el = document.getElementById(`apt-group-${roomCount}`);
                              el?.scrollIntoView({ behavior: "smooth" });
                            }}
                              className="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                              {f} ({filtered.length})
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {b.apartments.map(apt => (
                          <div key={apt.id} className="relative group">
                            <button onClick={() => toggleAptStatus(apt)}
                              className={`w-full rounded-xl p-3 text-center border-2 transition-all cursor-pointer ${
                                apt.status === "free" ? "border-green-200 bg-green-50 hover:bg-green-100" :
                                apt.status === "booked" ? "border-amber-200 bg-amber-50 hover:bg-amber-100" :
                                "border-gray-200 bg-gray-50 opacity-60"
                              }`}>
                              <div className="text-base font-extrabold text-gray-900">{apt.number}</div>
                              <div className="text-[10px] text-gray-400">{apt.floor}-qavat</div>
                              <div className="text-xs font-bold text-gray-700">{apt.rooms} x</div>
                              <div className="text-[9px] text-gray-400">{apt.area_m2}m²</div>
                              <div className="mt-1 text-[9px] font-bold text-gray-700">${Number(apt.price).toLocaleString()}</div>
                              <div className={`mt-1 text-[8px] px-1 py-0.5 rounded-full font-medium inline-block ${
                                statusColors[apt.status] || "bg-gray-100 text-gray-500"
                              }`}>
                                {apt.status === "free" ? "Bo'sh" : apt.status === "booked" ? "Bron" : "Sotilgan"}
                              </div>
                            </button>
                            {apt.plan_image && (
                              <button onClick={(e) => { e.stopPropagation(); window.open(apt.plan_image, "_blank"); }}
                                className="absolute top-1 right-1 w-5 h-5 bg-white/80 hover:bg-white rounded text-[9px] font-bold text-gray-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                                P
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-xl">
                      Hali kvartiralar qo'shilmagan
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ───── ADD BUILDING MODAL ───── */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowAdd(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{t("new_construction")}</h3>
                <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Steps */}
              <div className="flex gap-1.5 mb-6">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? "bg-green-600" : "bg-gray-200"}`} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-4 px-1">
                <span className={step >= 1 ? "text-green-700 font-bold" : ""}>1. Asosiy</span>
                <span className={step >= 2 ? "text-green-700 font-bold" : ""}>2. Tafsilotlar</span>
                <span className={step >= 3 ? "text-green-700 font-bold" : ""}>3. Rasmlar</span>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Qurilish nomi *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" placeholder={'Masalan: "Yangi hayot turar-joy majmuasi"'} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Tavsif</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 min-h-[80px]" placeholder="Qurilish haqida batafsil ma'lumot..." />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Viloyat</label>
                    <div className="relative">
                      <select value={region} onChange={(e) => { setRegion(e.target.value); setForm(f => ({ ...f, district: "" })); }}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white appearance-none cursor-pointer">
                        {Object.keys(REGIONS).map(r => <option key={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Tuman *</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(REGIONS[region] || []).map(d => (
                          <button key={d} onClick={() => setForm(f => ({ ...f, district: d }))}
                            className={`text-xs py-2 rounded-xl border-2 font-medium transition-colors ${
                              form.district === d ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"
                            }`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block font-medium">Shahar</label>
                        <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block font-medium">Manzil</label>
                        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block font-medium">Mulk turi</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {propertyTypes.map(t => (
                            <button key={t.value} onClick={() => setForm(f => ({ ...f, property_type: t.value }))}
                              className={`text-xs py-2 rounded-xl border-2 font-medium transition-colors ${
                                form.property_type === t.value ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"
                              }`}>{t.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setStep(2)}
                    className="w-full bg-green-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-green-700 transition-colors">
                    Keyingi qadam
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Qavatlar</label>
                      <input type="number" value={form.total_floors} onChange={e => setForm(f => ({ ...f, total_floors: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Kvartiralar soni</label>
                      <input type="number" value={form.total_apartments} onChange={e => setForm(f => ({ ...f, total_apartments: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Liftlar</label>
                      <input type="number" value={form.elevator_count} onChange={e => setForm(f => ({ ...f, elevator_count: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Segment</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["Standart", "Komfort", "Biznes"].map(s => (
                        <button key={s} onClick={() => setForm(f => ({ ...f, segment: s }))}
                          className={`text-xs py-2.5 rounded-xl border-2 font-medium transition-colors ${
                            form.segment === s ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Qurilish materiali</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {materialOptions.map(m => (
                          <button key={m} onClick={() => setForm(f => ({ ...f, building_material: m }))}
                            className={`text-xs py-2 rounded-xl border-2 font-medium transition-colors ${
                              form.building_material === m ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"
                            }`}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Parkovka</label>
                      <div className="space-y-1.5">
                        {parkingOptions.map(p => (
                          <button key={p} onClick={() => setForm(f => ({ ...f, parking_type: p }))}
                            className={`block w-full text-xs py-2 rounded-xl border-2 font-medium transition-colors text-left px-3 ${
                              form.parking_type === p ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"
                            }`}>{p}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Qulayliklar</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Lift", "Parkovka", "Metro yaqin", "24/7 qo'riqlash", "Bolalar maydoni", "Sport zali", "Suzish havzasi", "Do'kon", "Maktab", "Bog'"].map(a => (
                        <button key={a} onClick={() => toggleAmenity(a)}
                          className={`text-xs px-3 py-1.5 rounded-xl border-2 font-medium transition-colors ${
                            form.amenities.includes(a) ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"
                          }`}>{a}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Tugash muddati</label>
                    <input placeholder="2026 yil" value={form.completion_date} onChange={e => setForm(f => ({ ...f, completion_date: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setStep(1)}
                      className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-bold hover:bg-gray-50 transition-colors">
                      Orqaga
                    </button>
                    <button onClick={() => setStep(3)}
                      className="flex-1 bg-green-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-green-700 transition-colors">
                      Keyingi qadam
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Rasmlar URL</label>
                    <div className="flex gap-2">
                      <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" placeholder="https://example.com/image.jpg" />
                      <button onClick={addImage} disabled={!imageUrl.trim()}
                        className="bg-gray-100 text-gray-700 px-4 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  {form.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setStep(2)}
                      className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-bold hover:bg-gray-50 transition-colors">
                      Orqaga
                    </button>
                    <button onClick={createBuilding}
                      disabled={!form.name || !form.district}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl py-3 text-sm font-bold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 shadow-lg shadow-green-200">
                      Qurilishni qo'shish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───── ADD APARTMENT MODAL ───── */}
        {showAddApt && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddApt(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Kvartira qo'shish</h3>
                <button onClick={() => setShowAddApt(null)}><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Qavat</label>
                    <input type="number" value={aptForm.floor} onChange={e => setAptForm(f => ({ ...f, floor: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Xona raqami</label>
                    <input value={aptForm.number} onChange={e => setAptForm(f => ({ ...f, number: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Xonalar</label>
                    <input type="number" min={1} max={10} value={aptForm.rooms} onChange={e => setAptForm(f => ({ ...f, rooms: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Maydon (m²)</label>
                    <input type="number" value={aptForm.area_m2} onChange={e => setAptForm(f => ({ ...f, area_m2: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Narxi (USD)</label>
                  <input type="number" value={aptForm.price} onChange={e => setAptForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Planirovka rasmi (URL)</label>
                  <input value={aptForm.plan_image} onChange={e => setAptForm(f => ({ ...f, plan_image: e.target.value }))}
                    placeholder="https://example.com/floorplan.jpg"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                </div>
                {aptForm.plan_image && (
                  <img src={aptForm.plan_image} alt="Planirovka" className="h-32 rounded-xl object-cover" />
                )}
                <button onClick={addApartment} disabled={!aptForm.number}
                  className="w-full bg-green-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
                  Qo'shish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
