"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "dark" | "light" | "normal";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "normal",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ponto-theme") as ThemeMode | null;
    if (saved && ["dark", "light", "normal"].includes(saved)) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme("normal");
    }
  }, []);

  function applyTheme(mode: ThemeMode) {
    const root = document.documentElement;

    // Remove todas as classes de tema
    root.classList.remove("theme-dark", "theme-light", "theme-normal");

    if (mode === "dark") {
      root.classList.add("theme-dark");
    } else if (mode === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.add("theme-normal");
    }
  }

  function setTheme(mode: ThemeMode) {
    setThemeState(mode);
    localStorage.setItem("ponto-theme", mode);
    applyTheme(mode);
  }

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
