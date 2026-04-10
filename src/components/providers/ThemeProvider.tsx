"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/store/slices/uiSlice";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector((state) => state.ui);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme from localStorage or system preference
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      dispatch(setTheme(storedTheme));
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      dispatch(setTheme("dark"));
    } else {
      dispatch(setTheme("light"));
    }
  }, [dispatch]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", uiState.theme);
      if (uiState.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [uiState.theme, mounted]);

  const toggleTheme = () => {
    dispatch(setTheme(uiState.theme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme: uiState.theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}