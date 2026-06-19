import { useState } from "react";
import { BookOpen, GraduationCap, FileText, Video, Users, ChevronRight, Play, ArrowRight, Star } from "lucide-react";
import type { Page } from "../types";
import { t } from "../../lib/i18n";

const categories = [
  { icon: Video, label: "Video darslar", count: 12, color: "bg-red-100 text-red-600" },
  { icon: FileText, label: "Maqolalar", count: 24, color: "bg-blue-100 text-blue-600" },
  { icon: Users, label: "Konsultatsiya", count: 3, color: "bg-green-100 text-green-600" },
];

const lessons = [
  {
    title: "Ipoteka qanday olish kerak?",
    desc: "O'zbekistonda ipoteka krediti olishning to'liq yo'riqnomasi. Banklar, foizlar va talab qilinadigan hujjatlar.",
    category: "video",
    duration: "14:32",
    level: "Boshlang'ich",
  },
  {
    title: "Mulk sotib olishda 10 ta xato",
    desc: "Ko'chmas mulk sotib olayotganda yo'l qo'yiladigan eng keng tarqalgan xatolar va ulardan qochish yo'llari.",
    category: "article",
    readTime: "8 daqiqa",
    level: "O'rta",
  },
  {
    title: "Uyni ijaraga berish: to'liq qo'llanma",
    desc: "Mulkni ijaraga berish, shartnoma tuzish, soliqlar va ijarachi bilan munosabatlar haqida batafsil.",
    category: "video",
    duration: "22:15",
    level: "Boshlang'ich",
  },
  {
    title: "Ko'chmas mulk soliqlari 2026",
    desc: "O'zbekistonda mulk solig'i, sotish solig'i va ijara daromad solig'i bo'yicha yangi qoidalar.",
    category: "article",
    readTime: "5 daqiqa",
    level: "Ilg'or",
  },
  {
    title: "Notarius va ro'yxatdan o'tish jarayoni",
    desc: "Mulk sotib olishda notarius xizmatlari, davlat ro'yxatidan o'tish tartibi va talab qilinadigan hujjatlar.",
    category: "article",
    readTime: "10 daqiqa",
    level: "Boshlang'ich",
  },
  {
    title: "Investitsiya sifatida mulk sotib olish",
    desc: "Qaysi hududlarga investitsiya qilish foydali, ROI hisoblash va risklarni boshqarish.",
    category: "video",
    duration: "18:45",
    level: "Ilg'or",
  },
];

const experts = [
  { name: "Aziz Karimov", title: "Ko'chmas mulk bo'yicha advokat", rating: 4.9, price: "$50/soat", tags: ["Huquq", "Shartnoma"] },
  { name: "Malika Rahimova", title: "Rieltorlik eksperti", rating: 4.8, price: "$35/soat", tags: ["Sotuv", "Marketing"] },
  { name: "Jahongir Aliyev", title: "Investitsiya maslahatchisi", rating: 4.7, price: "$60/soat", tags: ["Investitsiya", "Tahlil"] },
];

export default function EducationPage({ onNav }: { onNav: (p: Page) => void }) {
  const [tab, setTab] = useState<"all" | "video" | "article">("all");
  const filtered = tab === "all" ? lessons : lessons.filter(l => l.category === tab);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">O'quv markazi</h1>
        </div>
        <p className="text-sm text-gray-400 mb-6">Ko'chmas mulk bo'yicha bilimlar — videolar, maqolalar va mutaxassis maslahatlari</p>

        {/* Categories */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {categories.map(({ icon: Icon, label, count, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{label}</div>
                <div className="text-xs text-gray-400">{count} ta</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "video", "article"] as const).map((tabId) => (
            <button key={tabId} onClick={() => setTab(tabId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${tab === tabId ? "bg-green-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-green-300"}`}>
              {tabId === "all" ? t("all") : tabId === "video" ? "Video" : "Maqolalar"}
            </button>
          ))}
        </div>

        {/* Lessons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filtered.map((lesson, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lesson.category === "video" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}>
                  {lesson.category === "video" ? <Play size={20} /> : <FileText size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-sm">{lesson.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lesson.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {lesson.level}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {"duration" in lesson ? lesson.duration : "readTime" in lesson ? lesson.readTime : ""}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 mt-1 shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Expert consultations */}
        <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <Users size={18} className="text-green-600" /> Mutaxassis bilan konsultatsiya
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {experts.map((ex, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                {ex.name[0]}
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{ex.name}</h3>
              <p className="text-xs text-gray-400">{ex.title}</p>
              <div className="flex items-center gap-1 mt-2">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-gray-900">{ex.rating}</span>
                <span className="text-xs text-gray-400 ml-2">{ex.price}</span>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {ex.tags.map(t => (
                  <span key={t} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{t}</span>
                ))}
              </div>
              <button className="w-full mt-3 border border-green-200 text-green-700 text-xs font-bold py-2.5 rounded-xl hover:bg-green-50 transition-colors">
                Konsultatsiyaga yozilish
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
