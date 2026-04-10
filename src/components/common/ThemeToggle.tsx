"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full w-9 h-9 hover:bg-primary/10 hover:text-primary transition-all duration-300"
      onClick={toggleTheme}
    >
      {/* 
        For the local ThemeProvider, the 'dark' class is handled manually 
        on document.documentElement. We can rely on that for CSS-based icons 
        or just check the 'theme' variable.
      */}
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100"}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
