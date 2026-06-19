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
import BoostModal from "./components/BoostModal";
import LangSwitcher from "./components/LangSwitcher";
import { useDarkMode } from "../lib/useDarkMode";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [listings, setListings] = useState<Listing[]>(LISTINGS);
  const [myProperties, setMyProperties] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [loadError, setLoadError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ownerFilter, setOwnerFilter] = useState<number | null>(null);
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
    const ws = new WebSocket(`ws://localhost:8000/api/ws/${currentUser?.id}?token=${token}`);
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

  const navigate = (p: Page, id?: number) => {
    setPage(p);
    if (id !== undefined) setSelectedId(id);
    if (p !== "listings") setOwnerFilter(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      {showHeader && <Header onNav={navigate} currentPage={page} currentUser={currentUser} onLogout={handleLogout} unreadCount={unreadCount} dark={dark} toggleDark={toggleDark} />}

      <main className={showMobileNav && !isMapPage ? "pb-16 md:pb-0" : ""}>
        {loadError && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-medium text-amber-800">
            Backend ulanmagani uchun demo e'lonlar ko'rsatilmoqda.
          </div>
        )}
        {page === "home" && (
          <HomePage onNav={navigate} listings={listings} favorites={favorites} toggleFav={toggleFav} />
        )}
        {page === "listings" && (
          <ListingsPage onNav={navigate} listings={listings} favorites={favorites} toggleFav={toggleFav} ownerFilter={ownerFilter} onClearOwnerFilter={() => setOwnerFilter(null)} />
        )}
        {page === "map" && (
          <MapPage onNav={navigate} listings={listings} favorites={favorites} toggleFav={toggleFav} />
        )}
        {page === "detail" && (
          <DetailPage listing={selectedListing} listings={listings} onNav={navigate} favorites={favorites} toggleFav={toggleFav} currentUser={currentUser} viewOwnerListings={viewOwnerListings} />
        )}
        {page === "add" && <AddListingPage onNav={navigate} currentUser={currentUser} onCreated={handleCreated} />}
        {page === "login" && <LoginPage onNav={navigate} onAuth={handleAuth} />}
        {page === "register" && <RegisterPage onNav={navigate} onAuth={handleAuth} />}
        {page === "dashboard" && (
          <DashboardPage
            onNav={navigate}
            listings={myProperties.length > 0 ? myProperties : listings}
            favorites={favorites}
            toggleFav={toggleFav}
            currentUser={currentUser}
            onDelete={handleDelete}
          />
        )}
        {page === "admin" && <AdminPage onNav={navigate} listings={listings} />}
        {page === "calculator" && <CalculatorPage onNav={navigate} />}
        {page === "chat" && <ChatPage onNav={navigate} />}
        {page === "roi" && <ROICalculatorPage onNav={navigate} />}
        {page === "developer" && <DeveloperPage onNav={navigate} />}
        {page === "public-buildings" && <PublicBuildingsPage onNav={navigate} />}
        {page === "compare" && <ComparePage listings={listings} onNav={navigate} />}
        {page === "bookings" && <BookingsPage onNav={navigate} />}
        {page === "avm" && <AVMPage onNav={navigate} />}
        {page === "education" && <EducationPage onNav={navigate} />}
        {page === "analytics" && <AnalyticsPage onNav={navigate} />}
        {page === "crm" && <CRMPage onNav={navigate} />}
        {page === "agent" && (
          <AgentPage ownerId={selectedId} listings={listings} onNav={navigate} favorites={favorites} toggleFav={toggleFav} currentUser={currentUser} />
        )}
        {page === "wanted" && (
          <WantedBoardPage onNav={navigate} currentUser={currentUser} />
        )}
      </main>

      {showFooter && <Footer onNav={navigate} />}
      {showMobileNav && <MobileNav onNav={navigate} currentPage={page} />}
    </div>
  );
}
