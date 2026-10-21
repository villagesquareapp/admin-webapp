import config from "./config";

// The light/dark mode lives in localStorage and the `dark` class on <html>;
// the customizer context reads it from here so there is one writer.
export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "admin-theme-mode";
const CHANGE_EVENT = "admin-theme-mode-change";
const DEFAULT_MODE: ThemeMode = config.activeMode === "light" ? "light" : "dark";

const toMode = (value: unknown): ThemeMode =>
  value === "light" || value === "dark" ? value : DEFAULT_MODE;

const applyMode = (mode: ThemeMode) =>
  document.documentElement.classList.toggle("dark", mode === "dark");

// Inlined in <head> so the stored mode is applied before the first paint.
export const themeModeScript = `(function(){var m;try{m=localStorage.getItem("${STORAGE_KEY}")}catch(e){}if(m!=="light"&&m!=="dark")m="${DEFAULT_MODE}";document.documentElement.classList.toggle("dark",m==="dark")})()`;

export const getThemeMode = (): ThemeMode =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export const getServerThemeMode = (): ThemeMode => DEFAULT_MODE;

export function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
  applyMode(mode);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeThemeMode(onChange: () => void) {
  // Keeps other open tabs on the mode just picked.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    applyMode(toMode(e.newValue));
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
