"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "piltover-day";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("nebula-theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      updateThemeClass(savedTheme);
    }
  }, []);

  const updateThemeClass = (theme: Theme) => {
    // Remove all theme classes
    document.documentElement.classList.remove("light", "piltover-day");
    
    // Add the appropriate class
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else if (theme === "piltover-day") {
      document.documentElement.classList.add("piltover-day");
    }
  };

  const toggleTheme = () => {
    const themeOrder: Theme[] = ["dark", "light", "piltover-day"];
    const currentIndex = themeOrder.indexOf(theme);
    const newTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    
    setTheme(newTheme);
    localStorage.setItem("nebula-theme", newTheme);
    updateThemeClass(newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values instead of throwing error
    // This allows components to work even without ThemeProvider
    return {
      theme: "dark" as const,
      toggleTheme: () => {
        console.warn("toggleTheme called but ThemeProvider is not available");
      }
    };
  }
  return context;
}
