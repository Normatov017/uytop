import { MapPin, Phone, Mail, Map, Plus, Home, Building, Briefcase } from "lucide-react";
import type { Page } from "../types";
import { t } from "../../lib/i18n";

function Footer({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <button onClick={() => onNav("home")} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin size={15} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                UyMap<span className="text-green-400">.uz</span>
              </span>
            </button>
            <p className="text-sm text-gray-400 leading-relaxed">
              O'zbekistondagi eng ishonchli ko'chmas mulk platformasi.
            </p>
            <div className="flex gap-3 mt-4">
              <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </div>
              <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </div>
              <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zM17 16h-2v-3c0-1.03-.007-2.36-1.529-2.36-1.529 0-1.764 1.194-1.764 2.425V16h-2v-6h1.938V11h.026c.27-.506 1.02-1.04 2.129-1.04 2.275 0 2.694 1.497 2.694 3.445V16z"/></svg>
              </div>
            </div>
          </div>

          {/* Mulk turi */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Mulk turi</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Kvartiralar", icon: Home },
                { label: "Uylar", icon: Home },
                { label: "Yangi binolar", icon: Building },
                { label: t("commercial"), icon: Briefcase },
              ].map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button onClick={() => onNav("listings")}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    <Icon size={13} className="text-gray-600" /> {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tezkor havolalar */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Tezkor havolalar</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Xaritada qidirish", icon: Map, page: "map" as Page },
                { label: t("add_listing"), icon: Plus, page: "add" as Page },
                { label: t("login"), icon: null, page: "login" as Page },
                { label: t("register"), icon: null, page: "register" as Page },
              ].map(({ label, icon: Icon, page }) => (
                <li key={label}>
                  <button onClick={() => onNav(page)}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    {Icon && <Icon size={13} className="text-gray-600" />} {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kompaniya */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Kompaniya</h3>
            <ul className="space-y-2.5">
              {["Biz haqimizda", "Aloqa", "Shartlar", "Maxfiylik"].map((label) => (
                <li key={label}>
                  <button className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    {label}
                  </button>
                </li>
              ))}
              <li className="pt-2">
                <a href="tel:+998781234567" className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                  <Phone size={13} className="text-gray-600" /> +998 78 123-45-67
                </a>
              </li>
              <li>
                <a href="mailto:info@uymap.uz" className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                  <Mail size={13} className="text-gray-600" /> info@uymap.uz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2025 UyMap.uz. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <span>O'zbekistondagi eng ishonchli ko'chmas mulk platformasi.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
