import { useState } from "react";
import { Search, ChevronDown, MapPin, ArrowRight, Shield, Map,
  MessageCircle, Home, Layers, Building, Clock, Star } from "lucide-react";
import type { Listing, Page } from "../types";
import PropertyCard from "../components/PropertyCard";
import { osmOpenUrl } from "../utils";
import { getRecentlyViewed, getPreferences } from "../../lib/storage";
import { t } from "../../lib/i18n";

function HomePage({
  onNav,
  listings,
  favorites,
  toggleFav,
}: {
  onNav: (p: Page, id?: number) => void;
  listings: Listing[];
  favorites: number[];
  toggleFav: (id: number) => void;
}) {
  const [activeTab, setActiveTab] = useState("Sotib olish");
  const tabs = ["Sotib olish", "Ijaraga olish", "Kunlik ijara", t("new_buildings")];
  const recentlyViewed = getRecentlyViewed();
  const prefs = getPreferences();

  const recommended = prefs.budgetMin || prefs.region || prefs.district
    ? listings.filter((l) => {
        if (prefs.region && l.region !== prefs.region) return false;
        if (prefs.district && l.district !== prefs.district) return false;
        if (prefs.budgetMin && l.priceNum < prefs.budgetMin) return false;
        if (prefs.budgetMax && l.priceNum > prefs.budgetMax) return false;
        if (prefs.propertyType && l.type !== prefs.propertyType) return false;
        if (prefs.rooms) {
          const num = Number(prefs.rooms);
          if (prefs.rooms === "4+" ? l.rooms < 4 : l.rooms !== num) return false;
        }
        return true;
      })
    : [];

  const recentListings = listings.filter((l) => recentlyViewed.includes(l.id));

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 flex items-center min-h-[540px]">
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1440&h=600&fit=crop&auto=format"
          alt="Toshkent shahri"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/55 to-gray-900/80" />

        <div className="relative max-w-4xl mx-auto px-4 py-16 w-full text-center">
          <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <CheckCircle size={12} /> 5,200+ tekshirilgan e'lon
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Orzuyingizdagi uyni <br />
            <span className="text-green-400">O'zbekistonda toping</span>
          </h1>
          <p className="text-gray-300 text-lg mb-9">
            Toshkent va butun O'zbekiston bo'ylab tekshirilgan e'lonlar — xaritada, qulay va ishonchli
          </p>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-left">
            <div className="flex border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-xs md:text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Shahar, tuman yoki manzil kiriting"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
                <button
                  onClick={() => onNav("listings")}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm"
                >
                  {t("search")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[t("price"), t("rooms"), t("area"), t("district")].map((f) => (
                  <button
                    key={f}
                    className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-green-400 hover:text-green-600 transition-colors"
                  >
                    {f} <ChevronDown size={11} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Districts */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Mashhur tumanlar</h2>
            <button
              onClick={() => onNav("listings")}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              Barchasini ko'rish <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: "Yunusobod", count: 234, img: "1477959858617-67f85cf4f1df" },
              { name: "Chilonzor", count: 189, img: "1518005020951-eccb494ad742" },
              { name: "Mirzo Ulug'bek", count: 156, img: "1449824913935-59a10b8d2000" },
              { name: "Yakkasaroy", count: 98, img: "1486325212027-8081e485255e" },
              { name: "Sergeli", count: 112, img: "1480074568708-e7b720bb3f09" },
            ].map(({ name, count, img }) => (
              <button
                key={name}
                onClick={() => onNav("listings")}
                className="relative rounded-2xl overflow-hidden group h-32 md:h-36"
              >
                <img
                  src={`https://images.unsplash.com/photo-${img}?w=300&h=200&fit=crop&auto=format`}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/15" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <div className="text-white font-bold text-sm">{name}</div>
                  <div className="text-gray-300 text-xs">{count} e'lon</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recently viewed */}
      {recentListings.length > 0 && (
        <section className="py-10 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-green-600" /> Yaqinda ko'rganlar
              </h2>
              <button onClick={() => onNav("listings")}
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                Barchasini ko'rish <ArrowRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recentListings.slice(0, 4).map((l) => (
                <PropertyCard key={l.id} listing={l} onView={() => onNav("detail", l.id)}
                  onFav={() => toggleFav(l.id)} isFav={favorites.includes(l.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tanlanma e'lonlar</h2>
            <button
              onClick={() => onNav("listings")}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              Barchasini ko'rish <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.slice(0, 4).map((l) => (
              <PropertyCard
                key={l.id}
                listing={l}
                onView={() => onNav("detail", l.id)}
                onFav={() => toggleFav(l.id)}
                isFav={favorites.includes(l.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="py-10 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star size={18} className="text-green-600" /> Sizga mos e'lonlar
              </h2>
              <button onClick={() => onNav("listings")}
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                Barchasini ko'rish <ArrowRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recommended.slice(0, 4).map((l) => (
                <PropertyCard key={l.id} listing={l} onView={() => onNav("detail", l.id)}
                  onFav={() => toggleFav(l.id)} isFav={favorites.includes(l.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map CTA */}
      <section className="bg-green-600 py-14">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Xaritada mulk qidiring</h2>
            <p className="text-green-100">Toshkentdagi barcha e'lonlarni interaktiv xaritada ko'ring</p>
          </div>
          <button
            onClick={() => onNav("map")}
            className="bg-white hover:bg-gray-50 text-green-700 font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
          >
            <Map size={18} /> Xaritani ochish
          </button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Nima uchun UyMap.uz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Tekshirilgan e'lonlar",
                desc: "Barcha e'lonlar moderatsiyadan o'tadi va hujjatlari tekshiriladi",
                iconCls: "text-green-600",
                bgCls: "bg-green-50",
              },
              {
                icon: Map,
                title: "Xaritada qidirish",
                desc: "Metro, maktab va bozorga masofani interaktiv xaritada ko'ring",
                iconCls: "text-blue-600",
                bgCls: "bg-blue-50",
              },
              {
                icon: MessageCircle,
                title: "Tez aloqa",
                desc: "Egasi yoki agent bilan to'g'ridan-to'g'ri Telegram orqali bog'laning",
                iconCls: "text-purple-600",
                bgCls: "bg-purple-50",
              },
            ].map(({ icon: Icon, title, desc, iconCls, bgCls }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-shadow text-center"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${bgCls}`}>
                  <Icon size={24} className={iconCls} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "5,200+", label: "Aktiv e'lonlar" },
              { num: "3,800+", label: "Sotilgan mulklar" },
              { num: "12,000+", label: "Foydalanuvchilar" },
              { num: "450+", label: "Agentlar" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold text-green-600 mb-1">{num}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
