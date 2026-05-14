"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { supportsWebGL } from "@/lib/webgl";

export function useWebGLSupport() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(supportsWebGL());
  }, []);

  return isSupported;
}

export function WebGLSceneFallback({
  className = "",
  title = "Interactive preview unavailable",
  description = "Your browser or device does not support WebGL. The rest of SmartNote AI is still ready to use.",
}: {
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div
      className={`relative flex h-full min-h-[320px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-purple-100 dark:from-neutral-950 dark:via-amber-950/40 dark:to-purple-950 ${className}`}
    >
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.35),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.35),transparent_30%)]" />
      <div className="relative max-w-sm rounded-3xl border border-white/40 bg-white/70 p-6 text-center shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {description}
        </p>
      </div>
    </div>
  );
}

export class WebGLSceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
