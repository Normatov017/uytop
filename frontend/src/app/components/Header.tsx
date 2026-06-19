import { useState, useRef } from "react";
import { MapPin, Plus, Map, Menu, X, ChevronDown, Search, MessageCircle, Users, BarChart3, Home, Building2, LogOut, User, Bell } from "lucide-react";
import type { Page } from "../types";
import type { ApiUser } from "../../lib/types";
import { api } from "../../lib/api";
import LangSwitcher from "./LangSwitcher";

function Header({
  onNav,
  currentPage,
  currentUser,
  onLogout,
  unreadCount = 0,
  dark,
  toggleDark,
}: {
  onNav: (p: Page) => void;
  currentPage: Page;
  currentUser: ApiUser | null;
  onLogout: () => void;
  unreadCount?: number;
  dark?: boolean;
  toggleDark?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const isActive = (page: Page) =>
    currentPage === page
      ? "text-green-600 border-b-2 border-green-600"
      : "text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-400";

  const navLinks = [
    { page: "listings" as Page, label: "Sotuv" },
    { page: "listings" as Page, label: "Ijara" },
    { page: "public-buildings" as Page, label: "Yangi qurilish" },
    { page: "wanted" as Page, label: "Men qidiryapman" },
    { page: "map" as Page, label: "Xarita", icon: <Map size={13} /> },
    { page: "analytics" as Page, label: "Analitika", icon: <BarChart3 size={13} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => onNav("home")} className="flex items-center gap-1.5 shrink-0">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Uy<span className="text-green-600">Map</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ page, label, icon }) => (
              <button
                key={label}
                onClick={() => onNav(page)}
                className={`px-3 py-4 text-sm font-medium flex items-center gap-1 transition-all ${isActive(page)}`}
              >
                {icon} {label}
              </button>
            ))}
            {currentUser && (currentUser.role === "AGENT" || currentUser.role === "ADMIN" || currentUser.role === "DEVELOPER") && (
              <button onClick={() => onNav("developer")}
                className={`px-3 py-4 text-sm font-medium transition-all ${isActive("developer")}`}>
                Panel
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-green-600 transition-colors"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => onNav("add")}
            className="hidden md:flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> E'lon berish
          </button>
          <LangSwitcher />
          {toggleDark && (
            <button onClick={toggleDark} className="p-2 text-gray-400 hover:text-amber-500 transition-colors" title={dark ? "Yorug' rejim" : "Tungi rejim"}>
              {dark ? <span className="text-sm">☀️</span> : <span className="text-sm">🌙</span>}
            </button>
          )}
          {currentUser ? (
            <div className="flex items-center gap-1">
              {currentUser.role === "ADMIN" && (
                <button onClick={() => onNav("admin")}
                  className="text-xs font-medium text-gray-500 hover:text-green-600 px-2 py-1 transition-colors">
                  Admin
                </button>
              )}
              <button onClick={() => onNav("chat")} className="relative p-2 text-gray-500 hover:text-green-600 transition-colors">
                <MessageCircle size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onNav("dashboard")}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-green-600 px-2.5 py-1.5 transition-colors"
              >
                <User size={16} />
                <span className="hidden md:inline">{currentUser.full_name.split(" ")[0]}</span>
              </button>
              <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Chiqish">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => onNav("login")}
                className="text-sm font-medium text-gray-700 hover:text-green-600 px-3 py-1.5 transition-colors">
                Kirish
              </button>
              <button onClick={() => onNav("register")}
                className="text-sm font-medium border border-gray-200 hover:border-green-500 hover:text-green-600 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                Ro'yxatdan o'tish
              </button>
            </div>
          )}
          <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {(searchOpen || true) && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Shahar, tuman yoki manzil..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => {
                  localStorage.setItem("uymap_header_search", searchText);
                  onNav("listings");
                }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white transition-all"
              />
            </div>
            <button onClick={() => onNav("map")}
              className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors bg-white">
              <Map size={14} /> Xarita
            </button>
            <button onClick={() => onNav("add")}
              className="md:hidden flex items-center gap-1.5 bg-green-600 text-white text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
          {navLinks.map(({ page, label, icon }) => (
            <button key={label}
              onClick={() => { onNav(page); setMenuOpen(false); }}
              className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 flex items-center gap-2">
              {icon} {label}
            </button>
          ))}
          {currentUser && (currentUser.role === "AGENT" || currentUser.role === "ADMIN" || currentUser.role === "DEVELOPER") && (
            <button onClick={() => { onNav("developer"); setMenuOpen(false); }}
              className="block w-full text-left text-sm font-medium text-gray-700 py-2.5">Panel</button>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
            {currentUser ? (
              <>
                <button onClick={() => { onNav("dashboard"); setMenuOpen(false); }}
                  className="block w-full text-left text-sm font-medium text-gray-700 py-2.5">Profil</button>
                <button onClick={() => { onNav("chat"); setMenuOpen(false); }}
                  className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 flex items-center gap-2">
                  Xabarlar {unreadCount > 0 && `(${unreadCount})`}
                </button>
                <button onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="block w-full text-left text-sm font-medium text-red-600 py-2.5">Chiqish</button>
              </>
            ) : (
              <>
                <button onClick={() => { onNav("login"); setMenuOpen(false); }}
                  className="block w-full text-left text-sm font-medium text-gray-700 py-2.5">Kirish</button>
                <button onClick={() => { onNav("register"); setMenuOpen(false); }}
                  className="block w-full text-left text-sm font-medium text-green-600 py-2.5">Ro'yxatdan o'tish</button>
              </>
            )}
          </div>
          <div className="pt-2"><LangSwitcher /></div>
        </div>
      )}
    </header>
  );
}

export default Header;
