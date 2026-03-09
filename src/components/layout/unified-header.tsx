"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Trash2,
  Settings,
  CreditCard,
  Users,
  Share2,
  MessageSquare,
  Sparkles,
  Home,
  Layers,
  DollarSign,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsBell } from "@/components/ui/notifications-bell";
import { ColorThemeSelector } from "@/components/ui/color-theme-selector";
import { ShamayimToggleSwitch } from "@/components/ui/shamayim-toggle-switch";
import { MenuBar } from "@/components/ui/glow-menu";

interface UnifiedHeaderProps {
  /** Used when inside a notebook: custom AI / Share / Chat buttons */
  extraRight?: React.ReactNode;
  homeHref?: string;
  /** Force layout variant (e.g. for templates page preview) */
  forceLoggedIn?: boolean;
  forceLoggedOut?: boolean;
  /** Use fixed positioning (e.g. for landing page nav) */
  fixed?: boolean;
}

const navItems = [
  { icon: Home, label: "Home", href: "/", iconColor: "text-blue-500", gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" },
  { icon: Layers, label: "Templates", href: "/templates", iconColor: "text-purple-500", gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)" },
  { icon: Sparkles, label: "Features", href: "#features", iconColor: "text-green-500", gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)" },
  { icon: DollarSign, label: "Pricing", href: "/pricing", iconColor: "text-orange-500", gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)" },
];

export function UnifiedHeader({
  extraRight,
  homeHref = "/dashboard",
  forceLoggedIn,
  forceLoggedOut,
  fixed = false,
}: UnifiedHeaderProps) {
  const { isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedInMobileOpen, setLoggedInMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const showLoggedIn = forceLoggedIn ?? (isSignedIn && !forceLoggedOut);
  const showLoggedOut = !showLoggedIn;

  const sharedHeaderClass =
    (fixed ? "fixed top-0 left-0 right-0 " : "sticky top-0 ") +
    "z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors w-full";

  const logo = (
    <Link
      href={showLoggedIn ? homeHref : "/"}
      className="flex items-center gap-2 shrink-0"
    >
      <BookOpen className="h-7 w-7 text-amber-500 sm:h-8 sm:w-8" />
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
        SmartNote AI
      </span>
    </Link>
  );

  const image2Icons = extraRight ?? (
    <>
      <Link
        href="/templates"
        className="p-2 text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        title="AI & Templates"
      >
        <Sparkles className="h-5 w-5" />
      </Link>
      <Link
        href={showLoggedIn ? "#" : "/sign-in"}
        className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        title="Share"
      >
        <Share2 className="h-5 w-5" />
      </Link>
      <Link
        href={showLoggedIn ? "#" : "/sign-in"}
        className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        title="Chat"
      >
        <MessageSquare className="h-5 w-5" />
      </Link>
    </>
  );

  if (showLoggedOut) {
    return (
      <header className={sharedHeaderClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Nav links (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              <MenuBar
                items={navItems.map((item) => ({
                  icon: item.icon,
                  label: item.label,
                  href: item.href,
                  gradient: item.gradient,
                  iconColor: item.iconColor,
                }))}
                activeItem={activeNav}
                onItemClick={setActiveNav}
              />
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">{logo}</div>

            {/* Right: Image 2 icons + theme + Sign in + See a demo */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              {image2Icons}
              <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
              <ColorThemeSelector />
              {mounted && (
                <div className="text-2xl">
                  <ShamayimToggleSwitch
                    defaultState={theme === "dark"}
                    onChange={(isDark) => setTheme(isDark ? "dark" : "light")}
                    pattern="dots"
                  />
                </div>
              )}
              <Link
                href="/sign-in"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-full transition-all shadow-lg"
                style={{
                  background: "linear-gradient(to right, var(--theme-primary), var(--theme-accent))",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
              >
                See a demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile: menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg"
              >
                See a demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  /* Logged-in: desktop row + mobile menu with account/sign out */
  return (
    <header className={sharedHeaderClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {logo}

          {/* Desktop: full row */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            {image2Icons}
            <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
            <ThemeToggle />
            <NotificationsBell />
            <Link href="/dashboard/workspaces" className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Workspaces">
              <Users className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/trash" className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Trash">
              <Trash2 className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/settings" className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Settings">
              <Settings className="h-5 w-5" />
            </Link>
            <Link href="/account" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Account / Subscription">
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Mobile: icons + hamburger that opens menu with Account / Sign out */}
          <div className="flex md:hidden items-center gap-1">
            {image2Icons}
            <ThemeToggle />
            <NotificationsBell />
            <button
              type="button"
              onClick={() => setLoggedInMobileOpen(!loggedInMobileOpen)}
              className="p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Menu"
            >
              {loggedInMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Mobile dropdown: Workspaces, Trash, Settings, Account */}
        {loggedInMobileOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 space-y-1">
            <Link href="/dashboard/workspaces" onClick={() => setLoggedInMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <Users className="w-4 h-4" /> Workspaces
            </Link>
            <Link href="/dashboard/trash" onClick={() => setLoggedInMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <Trash2 className="w-4 h-4" /> Trash
            </Link>
            <Link href="/dashboard/settings" onClick={() => setLoggedInMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <Link href="/account" onClick={() => setLoggedInMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
              <CreditCard className="w-4 h-4" /> Account / Subscription
            </Link>
            <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800">
              <p className="px-3 py-1 text-xs text-neutral-500 dark:text-neutral-400">Sign out using the account icon above</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
