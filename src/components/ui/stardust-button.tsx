'use client'

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type ColorKey =
  | 'color1' | 'color2' | 'color3' | 'color4' | 'color5' | 'color6' | 'color7'
  | 'color8' | 'color9' | 'color10' | 'color11' | 'color12' | 'color13' | 'color14'
  | 'color15' | 'color16' | 'color17';

type Colors = Record<ColorKey, string>;

const svgOrder = ['svg1', 'svg2', 'svg3', 'svg4', 'svg3', 'svg2', 'svg1'] as const;
type SvgKey = (typeof svgOrder)[number];

type Stop = { offset: number; stopColor: string; };
type SvgState = { gradientTransform: string; stops: Stop[]; };
type SvgStates = Record<SvgKey, SvgState>;

const createStopsArray = (svgStates: SvgStates, svgOrder: readonly SvgKey[], maxStops: number): Stop[][] => {
  const stopsArray: Stop[][] = [];
  for (let i = 0; i < maxStops; i++) {
    const stopConfigurations = svgOrder.map((svgKey) => {
      const svg = svgStates[svgKey];
      return svg.stops[i] || svg.stops[svg.stops.length - 1];
    });
    stopsArray.push(stopConfigurations);
  }
  return stopsArray;
};

const GradientSvg: React.FC<{ className: string; isHovered: boolean; colors: Colors }> = ({ className, isHovered, colors }) => {
  const svgStates: SvgStates = {
    svg1: {
      gradientTransform: 'translate(287.5 280) rotate(-29.0546) scale(689.807 1000)',
      stops: [
        { offset: 0, stopColor: colors.color1 }, { offset: 0.188423, stopColor: colors.color2 },
        { offset: 0.260417, stopColor: colors.color3 }, { offset: 0.328792, stopColor: colors.color4 },
        { offset: 0.328892, stopColor: colors.color5 }, { offset: 0.328992, stopColor: colors.color1 },
        { offset: 0.442708, stopColor: colors.color6 }, { offset: 0.537556, stopColor: colors.color7 },
        { offset: 0.631738, stopColor: colors.color1 }, { offset: 0.725645, stopColor: colors.color8 },
        { offset: 0.817779, stopColor: colors.color9 }, { offset: 0.84375, stopColor: colors.color10 },
        { offset: 0.90569, stopColor: colors.color1 }, { offset: 1, stopColor: colors.color11 },
      ],
    },
    svg2: {
      gradientTransform: 'translate(126.5 418.5) rotate(-64.756) scale(533.444 773.324)',
      stops: [
        { offset: 0, stopColor: colors.color1 }, { offset: 0.104167, stopColor: colors.color12 },
        { offset: 0.182292, stopColor: colors.color13 }, { offset: 0.28125, stopColor: colors.color1 },
        { offset: 0.328792, stopColor: colors.color4 }, { offset: 0.328892, stopColor: colors.color5 },
        { offset: 0.453125, stopColor: colors.color6 }, { offset: 0.515625, stopColor: colors.color7 },
        { offset: 0.631738, stopColor: colors.color1 }, { offset: 0.692708, stopColor: colors.color8 },
        { offset: 0.75, stopColor: colors.color14 }, { offset: 0.817708, stopColor: colors.color9 },
        { offset: 0.869792, stopColor: colors.color10 }, { offset: 1, stopColor: colors.color1 },
      ],
    },
    svg3: {
      gradientTransform: 'translate(264.5 339.5) rotate(-42.3022) scale(946.451 1372.05)',
      stops: [
        { offset: 0, stopColor: colors.color1 }, { offset: 0.188423, stopColor: colors.color2 },
        { offset: 0.307292, stopColor: colors.color1 }, { offset: 0.328792, stopColor: colors.color4 },
        { offset: 0.328892, stopColor: colors.color5 }, { offset: 0.442708, stopColor: colors.color15 },
        { offset: 0.537556, stopColor: colors.color16 }, { offset: 0.631738, stopColor: colors.color1 },
        { offset: 0.725645, stopColor: colors.color17 }, { offset: 0.817779, stopColor: colors.color9 },
        { offset: 0.84375, stopColor: colors.color10 }, { offset: 0.90569, stopColor: colors.color1 },
        { offset: 1, stopColor: colors.color11 },
      ],
    },
    svg4: {
      gradientTransform: 'translate(860.5 420) rotate(-153.984) scale(957.528 1388.11)',
      stops: [
        { offset: 0.109375, stopColor: colors.color11 }, { offset: 0.171875, stopColor: colors.color2 },
        { offset: 0.260417, stopColor: colors.color13 }, { offset: 0.328792, stopColor: colors.color4 },
        { offset: 0.328892, stopColor: colors.color5 }, { offset: 0.328992, stopColor: colors.color1 },
        { offset: 0.442708, stopColor: colors.color6 }, { offset: 0.515625, stopColor: colors.color7 },
        { offset: 0.631738, stopColor: colors.color1 }, { offset: 0.692708, stopColor: colors.color8 },
        { offset: 0.817708, stopColor: colors.color9 }, { offset: 0.869792, stopColor: colors.color10 },
        { offset: 1, stopColor: colors.color11 },
      ],
    },
  };

  const maxStops = Math.max(...Object.values(svgStates).map((svg) => svg.stops.length));
  const stopsAnimationArray = createStopsArray(svgStates, svgOrder, maxStops);
  const gradientTransform = svgOrder.map((svgKey) => svgStates[svgKey].gradientTransform);

  const variants = {
    hovered: { gradientTransform, transition: { duration: 50, repeat: Infinity, ease: 'linear' } },
    notHovered: { gradientTransform, transition: { duration: 10, repeat: Infinity, ease: 'linear' } },
  };

  return (
    <svg className={className} width='1030' height='280' viewBox='0 0 1030 280' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect width='1030' height='280' rx='140' fill='url(#paint0_radial_stardust)' />
      <defs>
        <motion.radialGradient id='paint0_radial_stardust' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' animate={isHovered ? variants.hovered : variants.notHovered}>
          {stopsAnimationArray.map((stopConfigs, index) => (
            <AnimatePresence key={index}>
              <motion.stop
                initial={{ offset: stopConfigs[0].offset, stopColor: stopConfigs[0].stopColor }}
                animate={{ offset: stopConfigs.map((config) => config.offset), stopColor: stopConfigs.map((config) => config.stopColor) }}
                transition={{ duration: 0, ease: 'linear', repeat: Infinity }}
              />
            </AnimatePresence>
          ))}
        </motion.radialGradient>
      </defs>
    </svg>
  );
};

const StardustLiquid: React.FC<{ isHovered: boolean; colors: Colors }> = ({ isHovered, colors }) => {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className={`absolute ${index < 3 ? 'w-[443px] h-[121px]' : 'w-[756px] h-[207px]'} ${
            index === 0 ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference'
            : index === 1 ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[164.971deg] mix-blend-difference'
            : index === 2 ? 'top-1/2 left-1/2 -translate-x-[53%] -translate-y-[53%] rotate-[-11.61deg] mix-blend-difference'
            : index === 3 ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[57%] rotate-[-179.012deg] mix-blend-difference'
            : index === 4 ? 'top-1/2 left-1/2 -translate-x-[57%] -translate-y-1/2 rotate-[-29.722deg] mix-blend-difference'
            : index === 5 ? 'top-1/2 left-1/2 -translate-x-[62%] -translate-y-[24%] rotate-[160.227deg] mix-blend-difference'
            : 'top-1/2 left-1/2 -translate-x-[67%] -translate-y-[29%] rotate-180 mix-blend-hard-light'
          }`}
        >
          <GradientSvg className='w-full h-full' isHovered={isHovered} colors={colors} />
        </div>
      ))}
    </>
  );
};

const STARDUST_COLORS: Colors = {
  // Futuristic neon spectrum
  color1: '#ffffff',
  color2: '#a855f7', // violet
  color3: '#22c1c3', // teal
  color4: '#4f46e5', // indigo
  color5: '#0ea5e9', // sky
  color6: '#22c55e', // emerald
  color7: '#f97316', // orange
  color8: '#06b6d4', // cyan
  color9: '#e11d48', // rose
  color10: '#6366f1', // indigo
  color11: '#020617', // deep slate
  color12: '#f5f3ff', // soft violet
  color13: '#1d4ed8', // blue
  color14: '#a5b4fc', // light indigo
  color15: '#f9a8d4', // pink
  color16: '#5b21b6', // deep purple
  color17: '#22d3ee', // bright cyan
};

interface StardustButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const StardustButton: React.FC<StardustButtonProps> = ({ 
  children = "Get Started Free",
  className,
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className={cn("relative inline-block w-52 h-[2.8em] group", className)}>
      {/* Outer glow */}
      <div className="pointer-events-none absolute -inset-[3px] rounded-full bg-[conic-gradient(from_140deg_at_50%_0%,#22d3ee,#6366f1,#e11d48,#22c55e,#22d3ee)] opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-90" />

      {/* Soft under-glow */}
      <div className="absolute w-[115%] h-[135%] top-[10%] left-1/2 -translate-x-1/2 filter blur-[26px] opacity-80">
        <span className="absolute inset-0 rounded-full bg-[#020617] filter blur-[10px]"></span>
        <div className="relative w-full h-full overflow-hidden rounded-full">
          <StardustLiquid isHovered={isHovered} colors={STARDUST_COLORS} />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92.23%] h-[112.85%] rounded-full bg-[#020617] filter blur-[8px]"></div>
      <div className="relative w-full h-full overflow-hidden rounded-full border border-cyan-400/40 shadow-[0_0_25px_rgba(56,189,248,0.6)] group-hover:shadow-[0_0_45px_rgba(129,140,248,0.9)] transition-shadow duration-300">
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"></span>
        <StardustLiquid isHovered={isHovered} colors={STARDUST_COLORS} />
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`absolute inset-0 rounded-full border-solid border-[2px] border-transparent bg-[conic-gradient(from_180deg_at_50%_0%,rgba(56,189,248,0.2),rgba(129,140,248,0.35),rgba(244,114,182,0.2),transparent)] mix-blend-screen filter ${
              i <= 2 ? 'blur-[3px]' : i === 3 ? 'blur-[5px]' : 'blur-[7px]'
            }`}
          ></span>
        ))}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-full filter blur-[18px] bg-gradient-to-r from-sky-500/40 via-indigo-500/35 to-fuchsia-500/40"></span>
      </div>
      <button
        className="absolute inset-0 rounded-full bg-transparent cursor-pointer"
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="flex items-center justify-center gap-2 rounded-full text-sky-100 group-hover:text-cyan-200 text-lg font-semibold tracking-wide whitespace-nowrap transition-colors">
          <span className="text-cyan-300 group-hover:animate-pulse">✧</span>
          {children}
        </span>
      </button>
    </div>
  );
};
