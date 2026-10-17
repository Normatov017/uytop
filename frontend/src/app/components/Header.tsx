import { useState, useRef, useEffect } from "react";
import { MapPin, Plus, Map, Menu, X, Search, MessageCircle, LogOut, User, Bell, XCircle } from "lucide-react";
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
  navigateWithOp,
}: {
  onNav: (p: Page, id?: number) => void;
  currentPage: Page;
  currentUser: ApiUser | null;
  onLogout: () => void;
  unreadCount?: number;
  dark?: boolean;
  toggleDark?: () => void;
  navigateWithOp?: (op: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    api.notificationUnreadCount().then(d => setNotifUnread(d.unread)).catch(() => {});
    const interval = setInterval(() => {
      api.notificationUnreadCount().then(d => setNotifUnread(d.unread)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const openNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && currentUser) {
      api.notifications().then(setNotifications).catch(() => {});
    }
  };

  const markRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setNotifUnread(prev => Math.max(0, prev - 1));
  };
  const isActive = (page: Page) =>
    currentPage === page
      ? "text-green-600 border-b-2 border-green-600"
      : "text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-400";

  const allNavLinks = [
    { page: "listings" as Page, label: "Sotuv", op: "sale" },
    { page: "listings" as Page, label: "Ijara", op: "rent" },
    { page: "map" as Page, label: "Xarita", icon: <Map size={13} /> },
    { page: "public-buildings" as Page, label: "Yangi qurilish" },
    { page: "wanted" as Page, label: "Menga mos uy" },
  ];
  const navLinks = allNavLinks;

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
            {navLinks.map((item) => {
              const { page, label, icon, op } = item as any;
              return (
                <button
                  key={label}
                  onClick={() => op && navigateWithOp ? navigateWithOp(op) : onNav(page)}
                  className={`px-3 py-4 text-sm font-medium flex items-center gap-1 transition-all ${isActive(page)}`}
                >
                  {icon} {label}
                </button>
              );
            })}
            {currentUser && (currentUser.role === "ADMIN" || currentUser.role === "DEVELOPER") && (
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
              <div className="relative" ref={notifRef}>
                <button onClick={openNotifications} className="relative p-2 text-gray-500 hover:text-green-600 transition-colors">
                  <Bell size={17} />
                  {notifUnread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {notifUnread > 9 ? "9+" : notifUnread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-80 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Bildirishnomalar</span>
                      {notifUnread > 0 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{notifUnread} ta yangi</span>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">Bildirishnomalar yo'q</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.link) {
                              const match = n.link.match(/^\/(\w+)\/(\d+)/);
                              if (match) {
                                const p = match[1] as Page;
                                const id = parseInt(match[2]);
                                onNav(p, id);
                              }
                            }
                            markRead(n.id);
                          }}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? "bg-blue-50/50" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>
                              <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                            </div>
                            {!n.is_read && (
                              <button onClick={() => markRead(n.id)} className="shrink-0 p-1 text-gray-300 hover:text-green-600 transition-colors">
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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
      <div className={`border-t border-gray-100 bg-gray-50 px-4 py-3 ${searchOpen ? "block" : "hidden md:block"}`}>
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
          {navLinks.map((item) => {
            const { page, label, icon, op } = item as any;
            return (
              <button key={label}
                onClick={() => { (op && navigateWithOp ? navigateWithOp(op) : onNav(page)); setMenuOpen(false); }}
                className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 flex items-center gap-2">
                {icon} {label}
              </button>
            );
          })}
          {moreItems.map(({ page, icon, label }) => (
            <button key={page}
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
