"use client";

import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { colorThemes } from "@/lib/color-themes";
import { useColorTheme } from "@/hooks/use-color-theme";
import { motion, AnimatePresence } from "framer-motion";

export function ColorThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme on mount
    if (colorTheme) {
      document.documentElement.setAttribute("data-color-theme", colorTheme);
    }
  }, [colorTheme]);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Palette className="w-5 h-5 text-neutral-400" />
      </button>
    );
  }

  const currentTheme = colorThemes.find((t) => t.value === colorTheme) || colorThemes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
        aria-label="Select color theme"
        title={`Current theme: ${currentTheme.name}`}
      >
        <Palette 
          className="w-5 h-5" 
          style={{ color: currentTheme.primary }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Choose Color Theme
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Customize your experience
                </p>
              </div>

              <div className="p-3 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => {
                        setColorTheme(theme.value);
                        setIsOpen(false);
                      }}
                      className={`group relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        colorTheme === theme.value
                          ? "border-neutral-900 dark:border-white shadow-md"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      {/* Color Preview */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-md shadow-sm"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{ backgroundColor: theme.secondary }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{ backgroundColor: theme.accent }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{ backgroundColor: theme.light }}
                          />
                        </div>
                      </div>

                      {/* Theme Name */}
                      <div className="text-left">
                        <p className="text-xs font-medium text-neutral-900 dark:text-white">
                          {theme.name}
                        </p>
                      </div>

                      {/* Selected Indicator */}
                      {colorTheme === theme.value && (
                        <div className="absolute top-2 right-2">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.primary }}
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                  Theme applies to accents and highlights
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
