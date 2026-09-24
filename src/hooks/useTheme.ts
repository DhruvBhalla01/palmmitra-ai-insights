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
    // Default to dark everywhere; only an explicit user choice of light overrides it.
    return "dark";
  });

  useEffect(() => {
    applyTheme(theme);
    if (isUserPreference) {
      persistTheme(theme);
    } else {
      clearStoredTheme();
    }
  }, [theme, isUserPreference]);


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
