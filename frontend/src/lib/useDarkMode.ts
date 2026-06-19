import { useEffect, useState } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("uymap_dark") === "true";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("uymap_dark", String(dark));
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
