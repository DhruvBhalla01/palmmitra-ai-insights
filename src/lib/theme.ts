export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  let stored: string | null = null;
  try {
    stored = window.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
  return stored === "light" || stored === "dark" ? stored : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
}

export function initTheme(): Theme {
  const theme = getStoredTheme() ?? getSystemTheme();
  applyTheme(theme);
  return theme;
}

export function persistTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
}

export function clearStoredTheme() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
}
