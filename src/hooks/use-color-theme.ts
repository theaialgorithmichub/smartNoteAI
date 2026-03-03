"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ColorThemeStore {
  colorTheme: string;
  setColorTheme: (theme: string) => void;
}

export const useColorTheme = create<ColorThemeStore>()(
  persist(
    (set) => ({
      colorTheme: "leather-brown",
      setColorTheme: (theme: string) => {
        set({ colorTheme: theme });
        // Apply theme to document root
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-color-theme", theme);
        }
      },
    }),
    {
      name: "color-theme-storage",
    }
  )
);
