import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  clearStoredTheme,
  getStoredTheme,
  getSystemTheme,
  persistTheme,
  type Theme,
} from "@/lib/theme";

export function useTheme() {
  const [isUserPreference, setIsUserPreference] = useState(() => Boolean(getStoredTheme()));
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = getStoredTheme();
    if (stored) return stored;
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    return getSystemTheme();
  });

  useEffect(() => {
    applyTheme(theme);
    if (isUserPreference) {
      persistTheme(theme);
    } else {
      clearStoredTheme();
    }
  }, [theme, isUserPreference]);

  useEffect(() => {
    if (isUserPreference || typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };

    if (media.addEventListener) {
      media.addEventListener("change", handler);
    } else {
      media.addListener(handler);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handler);
      } else {
        media.removeListener(handler);
      }
    };
  }, [isUserPreference]);

  const toggleTheme = useCallback(() => {
    setIsUserPreference(true);
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setExplicitTheme = useCallback((next: Theme) => {
    setIsUserPreference(true);
    setTheme(next);
  }, []);

  return { theme, toggleTheme, setTheme: setExplicitTheme, isUserPreference };
}
