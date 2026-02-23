"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-[88px] h-8 rounded-full bg-neutral-800", className)} />
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-1.5 rounded-full bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm cursor-pointer",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Sun Icon */}
      <Sun
        className={cn(
          "h-4 w-4 transition-colors duration-300",
          !isDark ? "text-amber-400" : "text-neutral-600"
        )}
      />

      {/* Switch Track */}
      <motion.div
        className="relative w-10 h-5 rounded-full shadow-inner"
        initial={false}
        animate={{
          backgroundColor: isDark ? "#1e293b" : "#fef3c7",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Switch Thumb */}
        <motion.div
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full border border-white/10 shadow-md"
          initial={false}
          animate={{
            x: isDark ? 20 : 0,
            backgroundColor: isDark ? "#3b82f6" : "#f59e0b",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Thumb Highlight (Gloss) */}
          <div className="absolute top-0.5 left-1 w-1.5 h-0.5 bg-white/30 rounded-full blur-[1px]" />
        </motion.div>
      </motion.div>

      {/* Moon Icon */}
      <Moon
        className={cn(
          "h-4 w-4 transition-colors duration-300",
          isDark ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-neutral-600"
        )}
      />
    </div>
  );
}
