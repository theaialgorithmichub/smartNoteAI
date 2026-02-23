"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  ChevronDown, 
  ArrowRight,
  Menu,
  X,
  Sparkles,
  FileText,
  LayoutDashboard,
  Code,
  Brain,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  isActive?: boolean;
}

const NavLink = ({ href, children, hasDropdown, isActive }: NavLinkProps) => {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
        isActive 
          ? "text-amber-600 dark:text-amber-400" 
          : "text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400"
      }`}
    >
      {children}
      {hasDropdown && <ChevronDown className="w-4 h-4" />}
    </Link>
  );
};

interface ProductDropdownProps {
  isOpen: boolean;
}

const ProductDropdown = ({ isOpen }: ProductDropdownProps) => {
  const products = [
    { icon: BookOpen, name: "Simple Notebook", description: "Classic flip-style notebook", href: "/templates" },
    { icon: FileText, name: "Meeting Notes", description: "Scratch pad & pinned notes", href: "/templates" },
    { icon: LayoutDashboard, name: "Dashboard", description: "All-in-one workspace", href: "/templates" },
    { icon: Code, name: "Code Notebook", description: "Interactive coding environment", href: "/templates" },
    { icon: Brain, name: "AI Research", description: "NotebookLM-style research", href: "/templates" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
        >
          <div className="p-2">
            {products.map((product, index) => (
              <Link
                key={index}
                href={product.href}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <product.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {product.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-800/50">
            <Link 
              href="/templates" 
              className="flex items-center justify-between text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
            >
              View all templates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function Navbar() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <div 
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Products
                <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              <ProductDropdown isOpen={isProductsOpen} />
            </div>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <BookOpen className="h-7 w-7 text-amber-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">
              SmartNote AI
            </span>
          </Link>

          {/* Right: Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && (
                theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )
              )}
            </button>
            <Link 
              href="/sign-in"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/sign-up"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              See a demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800"
          >
            <div className="px-4 py-4 space-y-2">
              <Link 
                href="/templates" 
                className="block px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Products
              </Link>
              <Link 
                href="#features" 
                className="block px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="block px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Pricing
              </Link>
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                {/* Mobile Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
                  {mounted && (theme === "dark" ? "Light Mode" : "Dark Mode")}
                </button>
                <Link 
                  href="/sign-in"
                  className="block px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Sign in
                </Link>
                <Link 
                  href="/sign-up"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full"
                >
                  See a demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
