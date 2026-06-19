import { Home, Search, Heart, Plus, User } from "lucide-react";
import type { Page } from "../types";
import { t } from "../../lib/i18n";

function MobileNav({ onNav, currentPage }: { onNav: (p: Page) => void; currentPage: Page }) {
  const items = [
    { icon: Home, label: t("home"), page: "home" as Page },
    { icon: Search, label: t("search"), page: "listings" as Page },
    { icon: Heart, label: t("favorites"), page: "dashboard" as Page },
    { icon: Plus, label: t("add_listing"), page: "add" as Page },
    { icon: User, label: t("profile"), page: "dashboard" as Page },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center">
      {items.map(({ icon: Icon, label, page }) => (
        <button
          key={label}
          onClick={() => onNav(page)}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
            currentPage === page ? "text-green-600" : "text-gray-400"
          }`}
        >
          {label === t("add_listing") ? (
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center -mt-6 shadow-lg shadow-green-200">
              <Icon size={19} className="text-white" />
            </div>
          ) : (
            <Icon size={19} />
          )}
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileNav;
