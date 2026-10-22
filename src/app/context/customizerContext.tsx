"use client";
import React, { createContext, useState, ReactNode, useEffect, useCallback, useSyncExternalStore } from "react";
import config from "./config";
import { getServerThemeMode, getThemeMode, setThemeMode, subscribeThemeMode } from "./themeMode";

// Define the shape of the context state
interface CustomizerContextState {
  isMobileSidebar: number;
  setIsMobileSidebar: (id: boolean) => void;
  selectedIconId: number;
  setSelectedIconId: (id: number) => void;
  activeDir: string;
  setActiveDir: (dir: string) => void;
  activeMode: string;
  setActiveMode: (mode: string | ((prevMode: string) => string)) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: string;
  setActiveLayout: (layout: string) => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: string;
  setIsLayout: (layout: string) => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
}

// Create the context with an initial value
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}
// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [isMobileSidebar, setIsMobileSidebar] = useState<boolean>(false);
  const [selectedIconId, setSelectedIconId] = useState<number>(1);
  const [activeDir, setActiveDir] = useState<string>(config.activeDir);
  const activeMode = useSyncExternalStore(subscribeThemeMode, getThemeMode, getServerThemeMode);
  const setActiveMode = useCallback((mode: string | ((prevMode: string) => string)) => {
    const next = typeof mode === "function" ? mode(getThemeMode()) : mode;
    setThemeMode(next === "light" ? "light" : "dark");
  }, []);
  const [activeTheme, setActiveTheme] = useState<string>(config.activeTheme);
  const [activeLayout, setActiveLayout] = useState<string>(config.activeLayout);
  const [isCardShadow, setIsCardShadow] = useState<boolean>(config.isCardShadow);
  const [isLayout, setIsLayout] = useState<string>(config.isLayout);
  const [isBorderRadius, setIsBorderRadius] = useState<number>(config.isBorderRadius);
  const [isCollapse, setIsCollapse] = useState<string>(config.isCollapse);
  const [isLanguage, setIsLanguage] = useState<string>(config.isLanguage);

  // Set attributes immediately
  useEffect(() => {
    document.documentElement.setAttribute("dir", activeDir);
    document.documentElement.setAttribute("data-color-theme", activeTheme);
    document.documentElement.setAttribute("data-layout", activeLayout);
    document.documentElement.setAttribute("data-boxed-layout", isLayout);
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);
  }, [activeDir, activeTheme, activeLayout, isLayout, isCollapse]);

  return (
    <CustomizerContext.Provider
      value={{
        isMobileSidebar,
        setIsMobileSidebar,
        selectedIconId,
        setSelectedIconId,
        activeDir,
        setActiveDir,
        activeMode,
        setActiveMode,
        activeTheme,
        setActiveTheme,
        activeLayout,
        setActiveLayout,
        isCardShadow,
        setIsCardShadow,
        isLayout,
        setIsLayout,
        isBorderRadius,
        setIsBorderRadius,
        isCollapse,
        setIsCollapse,
        isLanguage,
        setIsLanguage,
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};
