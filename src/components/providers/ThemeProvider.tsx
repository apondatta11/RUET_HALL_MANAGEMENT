"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/store/slices/uiSlice";

/**
 * Custom hook to abstract Redux calls.
 * Components can use this instead of useSelector/useDispatch directly.
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  const toggleTheme = () => {
    dispatch(setTheme(theme === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const uiTheme = useAppSelector((state) => state.ui.theme);
  const [mounted, setMounted] = useState(false);

  // it runs first when the app loads & themeprovider is rendered
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
  // The first useEffect changes redux state , then the 2nd useEffect runs as 1st useEffect depends on dispatch, so it renders again & runs the 2nd useEffect to set localStorage & tailwind classes to body
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", uiTheme);
      if (uiTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [uiTheme, mounted]);

  return <>{children}</>;
}