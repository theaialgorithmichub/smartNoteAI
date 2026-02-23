"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  Sun, 
  Moon, 
  ArrowUp, 
  Mail, 
  Heart,
  BookOpen,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github
} from "lucide-react";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const navigation = {
  sections: [
    {
      id: "product",
      name: "Product",
      items: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Dashboard", href: "/dashboard" },
      ],
    },
    {
      id: "resources",
      name: "Resources",
      items: [
        { name: "Documentation", href: "#" },
        { name: "Tutorials", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    {
      id: "company",
      name: "Company",
      items: [
        { name: "About", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Careers", href: "#" },
      ],
    },
    {
      id: "legal",
      name: "Legal",
      items: [
        { name: "Privacy", href: "#" },
        { name: "Terms", href: "#" },
        { name: "Cookie Policy", href: "#" },
      ],
    },
  ],
};

const Underline = `hover:-translate-y-1 border border-dotted border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 transition-transform text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white`;

const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted border-neutral-300 dark:border-neutral-700">
        <button
          onClick={() => setTheme("light")}
          className="bg-neutral-900 dark:bg-neutral-800 mr-3 rounded-full p-2 text-white"
        >
          <Sun className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Light mode</span>
        </button>

        <button 
          type="button" 
          onClick={handleScrollTop}
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Scroll to top</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className="dark:bg-neutral-900 bg-neutral-200 ml-3 rounded-full p-2 text-neutral-900 dark:text-white"
        >
          <Moon className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Dark mode</span>
        </button>
      </div>
    </div>
  );
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-colors">
      {/* Brand Section */}
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-amber-500" />
        </Link>
        <p className="bg-transparent text-center text-xs leading-5 text-neutral-500 dark:text-neutral-400 md:text-left max-w-2xl">
          Welcome to SmartNote AI, where traditional note-taking meets cutting-edge AI technology. 
          Experience the nostalgic feel of physical notebooks combined with powerful AI assistance. 
          Organize your thoughts, flip through pages, and let AI be your research companion. 
          Transform the way you capture and organize knowledge.
        </p>
      </div>

      {/* Navigation Links */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-dotted border-neutral-200 dark:border-neutral-800" />
        <div className="py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {navigation.sections.map((section) => (
              <div key={section.name}>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                  {section.name}
                </h3>
                <ul role="list" className="flex flex-col space-y-3">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-b border-dotted border-neutral-200 dark:border-neutral-800" />
      </div>

      {/* Social Links & Theme Toggle */}
      <div className="flex flex-wrap justify-center gap-y-6 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 px-6">
          <Link
            aria-label="Email"
            href="mailto:contact@smartnote.ai"
            className={Underline}
          >
            <Mail strokeWidth={1.5} className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Twitter"
            href="https://twitter.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Instagram"
            href="https://instagram.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            aria-label="LinkedIn"
            href="https://linkedin.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <Linkedin className="h-5 w-5" />
          </Link>
          <Link
            aria-label="YouTube"
            href="https://youtube.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <Youtube className="h-5 w-5" />
          </Link>
          <Link
            aria-label="GitHub"
            href="https://github.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
        <ThemeToggle />
      </div>

      {/* Copyright */}
      <div className="mx-auto mb-10 mt-4 flex flex-col justify-between text-center text-xs">
        <div className="flex flex-row items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400">
          <span>©</span>
          <span>{new Date().getFullYear()}</span>
          <span>Made with</span>
          <Heart className="text-red-500 mx-1 h-4 w-4 animate-pulse fill-red-500" />
          <span>by</span>
          <Link
            aria-label="Creator"
            className="font-bold text-neutral-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 transition-colors"
            href="#"
          >
            The AIAlgorithmichub
          </Link>
          <span>-</span>
          <Link 
            aria-label="SmartNote AI" 
            className="hover:text-amber-500 transition-colors" 
            href="/"
          >
            SmartNote AI
          </Link>
        </div>
      </div>
    </footer>
  );
}
