import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ApiProperty, ApiUser } from "../lib/types";
import type { Page, Listing } from "./types";
import { toListing } from "./utils";
import { LISTINGS } from "./data/mockData";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import MapPage from "./pages/MapPage";
import DetailPage from "./pages/DetailPage";
import AddListingPage from "./pages/AddListingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import CalculatorPage from "./pages/CalculatorPage";
import ChatPage from "./pages/ChatPage";
import ROICalculatorPage from "./pages/ROICalculatorPage";
import DeveloperPage from "./pages/DeveloperPage";
import PublicBuildingsPage from "./pages/PublicBuildingsPage";
import ComparePage from "./pages/ComparePage";
import BookingsPage from "./pages/BookingsPage";
import AVMPage from "./pages/AVMPage";
import EducationPage from "./pages/EducationPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CRMPage from "./pages/CRMPage";
import AgentPage from "./pages/AgentPage";
import WantedBoardPage from "./pages/WantedBoardPage";
import LangSwitcher from "./components/LangSwitcher";
import { useDarkMode } from "../lib/useDarkMode";

const PAGE_PATHS: Partial<Record<Page, string>> = {
  home: "/",
  listings: "/listings",
  map: "/map",
  add: "/add",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  admin: "/admin",
  calculator: "/calculator",
  chat: "/chat",
  roi: "/roi",
  developer: "/developer",
  "public-buildings": "/buildings",
  compare: "/compare",
  bookings: "/bookings",
  avm: "/avm",
  education: "/education",
  analytics: "/analytics",
  crm: "/crm",
  wanted: "/wanted",
};

const PATH_PAGES = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page]),
) as Record<string, Page>;

const getPageFromPath = () => PATH_PAGES[window.location.pathname] ?? "home";

export default function App() {
  const [page, setPage] = useState<Page>(() => getPageFromPath());
  const [selectedId, setSelectedId] = useState<number>(1);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [listings, setListings] = useState<Listing[]>(LISTINGS);
  const [myProperties, setMyProperties] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [loadError, setLoadError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ownerFilter, setOwnerFilter] = useState<number | null>(null);
  const [operationFilter, setOperationFilter] = useState<string | null>(null);
  const { dark, toggle: toggleDark } = useDarkMode();

  const loadMyProperties = async () => {
    if (!localStorage.getItem(api.tokenKey)) return;
    const result = await api.myProperties();
    setMyProperties(result.map(toListing));
  };

  const loadListings = async () => {
    const result = await api.properties({ limit: 50 });
    if (result.items.length > 0) {
      const nextListings = result.items.map(toListing);
      setListings(nextListings);
      setSelectedId((current) => (nextListings.some((item) => item.id === current) ? current : nextListings[0].id));
    }
    setLoadError("");
  };

  const loadFavorites = async () => {
    if (!localStorage.getItem(api.tokenKey)) return;
    const result = await api.favorites();
    setFavorites(result.map((favorite) => favorite.property.id));
  };

  const handleAuth = (user: ApiUser) => {
    setCurrentUser(user);
    loadFavorites().catch(() => undefined);
    loadMyProperties().catch(() => undefined);
  };

  useEffect(() => {
    let mounted = true;
    loadListings()
      .catch((err) => {
        if (mounted) setLoadError(err instanceof Error ? err.message : "Backend bilan aloqa yo'q");
      });

    if (localStorage.getItem(api.tokenKey)) {
      api.me().then((user) => {
        if (mounted) setCurrentUser(user);
      }).catch(() => api.logout());
      loadFavorites().catch(() => undefined);
      loadMyProperties().catch(() => undefined);
      api.unreadCount().then(d => setUnreadCount(d.unread)).catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, []);

  // WebSocket connection for real-time chat
  useEffect(() => {
    const token = localStorage.getItem(api.tokenKey);
    if (!token) return;
    const wsBase = import.meta.env.VITE_API_URL ? `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api` : `ws://localhost:8000/api`;
    const ws = new WebSocket(`${wsBase}/ws/${currentUser?.id}?token=${token}`);
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          if (localStorage.getItem(api.tokenKey)) {
            api.unreadCount().then(d => setUnreadCount(d.unread)).catch(() => {});
          }
        }
      } catch {}
    };
    return () => ws.close();
  }, [currentUser?.id]);

  // Unread polling every 15s
  useEffect(() => {
    if (!localStorage.getItem(api.tokenKey)) return;
    const interval = setInterval(() => {
      api.unreadCount().then(d => setUnreadCount(d.unread)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const [history, setHistory] = useState<Page[]>([]);

  useEffect(() => {
    const syncFromPath = () => setPage(getPageFromPath());
    window.addEventListener("popstate", syncFromPath);
    return () => window.removeEventListener("popstate", syncFromPath);
  }, []);

  const navigate = (p: Page, id?: number) => {
    setHistory((prev) => [...prev, page]);
    setPage(p);
    const path = PAGE_PATHS[p];
    if (path && window.location.pathname !== path) {
      window.history.pushState({ page: p }, "", path);
    }
    if (id !== undefined) setSelectedId(id);
    if (p !== "listings") { setOwnerFilter(null); setOperationFilter(null); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateWithOp = (op: string) => {
    localStorage.setItem("uymap_op_filter", op);
    setOperationFilter(op);
    setHistory((prev) => [...prev, page]);
    setPage("listings");
    if (window.location.pathname !== "/listings") {
      window.history.pushState({ page: "listings" }, "", "/listings");
    }
    setOwnerFilter(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((prev) => prev.slice(0, -1));
      setPage(prev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("home");
    }
  };

  const viewOwnerListings = (ownerId: number) => {
    setOwnerFilter(ownerId);
    setPage("listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFav = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
    if (!currentUser) return;
    const isSaved = favorites.includes(id);
    const action = isSaved ? api.removeFavorite(id) : api.addFavorite(id);
    Promise.resolve(action).catch(() => {
      setFavorites((prev) => (isSaved ? [...prev, id] : prev.filter((f) => f !== id)));
    });
  };

  const handleCreated = (property: ApiProperty) => {
    const listing = toListing(property);
    setListings((prev) => [listing, ...prev]);
    setMyProperties((prev) => [listing, ...prev]);
  };

  const handleDelete = (id: number) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
    setMyProperties((prev) => prev.filter((listing) => listing.id !== id));
    api.deleteProperty(id).catch(() => loadMyProperties().catch(() => undefined));
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setFavorites([]);
    navigate("home");
  };

  const selectedListing = listings.find((l) => l.id === selectedId) ?? listings[0] ?? LISTINGS[0];

  const isAuthPage = page === "login" || page === "register";
  const isAdminPage = page === "admin";
  const isMapPage = page === "map";
  const showHeader = !isAdminPage;
  const showFooter = !isMapPage && !isAuthPage && !isAdminPage;
  const showMobileNav = !isAdminPage;

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header onNav={navigate} currentPage={page} currentUser={currentUser} onLogout={handleLogout} unreadCount={unreadCount} dark={dark} toggleDark={toggleDark} navigateWithOp={navigateWithOp} />}

      <main className={showMobileNav && !isMapPage ? "pb-16 md:pb-0" : ""}>
        {loadError && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-medium text-amber-800">
            Backend ulanmagani uchun demo e'lonlar ko'rsatilmoqda.
          </div>
        )}
        {page === "home" && (
          <HomePage onNav={navigate} goBack={goBack} listings={listings} favorites={favorites} toggleFav={toggleFav} />
        )}
        {page === "listings" && (
          <ListingsPage onNav={navigate} goBack={goBack} listings={listings} favorites={favorites} toggleFav={toggleFav} ownerFilter={ownerFilter} onClearOwnerFilter={() => setOwnerFilter(null)} operationFilter={operationFilter} />
        )}
        {page === "map" && (
          <MapPage onNav={navigate} goBack={goBack} listings={listings} favorites={favorites} toggleFav={toggleFav} />
        )}
        {page === "detail" && (
          <DetailPage listing={selectedListing} listings={listings} onNav={navigate} goBack={goBack} favorites={favorites} toggleFav={toggleFav} currentUser={currentUser} viewOwnerListings={viewOwnerListings} />
        )}
        {page === "add" && <AddListingPage onNav={navigate} goBack={goBack} currentUser={currentUser} onCreated={handleCreated} />}
        {page === "login" && <LoginPage onNav={navigate} goBack={goBack} onAuth={handleAuth} />}
        {page === "register" && <RegisterPage onNav={navigate} goBack={goBack} onAuth={handleAuth} />}
        {page === "dashboard" && (
          <DashboardPage
            onNav={navigate}
            goBack={goBack}
            listings={myProperties.length > 0 ? myProperties : listings}
            favorites={favorites}
            toggleFav={toggleFav}
            currentUser={currentUser}
            onDelete={handleDelete}
          />
        )}
        {page === "admin" && <AdminPage onNav={navigate} goBack={goBack} listings={listings} />}
        {page === "calculator" && <CalculatorPage onNav={navigate} goBack={goBack} />}
        {page === "chat" && <ChatPage onNav={navigate} goBack={goBack} />}
        {page === "roi" && <ROICalculatorPage onNav={navigate} goBack={goBack} />}
        {page === "developer" && <DeveloperPage onNav={navigate} goBack={goBack} />}
        {page === "public-buildings" && <PublicBuildingsPage onNav={navigate} goBack={goBack} />}
        {page === "compare" && <ComparePage listings={listings} onNav={navigate} goBack={goBack} />}
        {page === "bookings" && <BookingsPage onNav={navigate} goBack={goBack} />}
        {page === "avm" && <AVMPage onNav={navigate} goBack={goBack} />}
        {page === "education" && <EducationPage onNav={navigate} goBack={goBack} />}
        {page === "analytics" && <AnalyticsPage onNav={navigate} goBack={goBack} />}
        {page === "crm" && <CRMPage onNav={navigate} goBack={goBack} />}
        {page === "agent" && (
          <AgentPage ownerId={selectedId} listings={listings} onNav={navigate} goBack={goBack} favorites={favorites} toggleFav={toggleFav} currentUser={currentUser} />
        )}
        {page === "wanted" && (
          <WantedBoardPage onNav={navigate} goBack={goBack} currentUser={currentUser} />
        )}
      </main>

      {showFooter && <Footer onNav={navigate} />}
      {showMobileNav && <MobileNav onNav={navigate} currentPage={page} />}
    </div>
  );
}
