"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get saved preference or system preference
    const saved = localStorage.getItem("phoenixTheme") as Theme | null;
    let resolvedTheme: Theme = "dark";

    if (saved) {
      resolvedTheme = saved;
    } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
      resolvedTheme = "light";
    }

    setTheme(resolvedTheme);
    // Set immediately on mount
    const html = document.documentElement;
    html.setAttribute("data-theme", resolvedTheme);
    html.style.colorScheme = resolvedTheme;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Update DOM and localStorage when theme changes
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    html.style.colorScheme = theme;
    localStorage.setItem("phoenixTheme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Always render with provider to maintain context
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a default theme if not in a ThemeProvider (e.g., during SSR)
    return { theme: "dark" as const, toggleTheme: () => {} };
  }
  return context;
}
