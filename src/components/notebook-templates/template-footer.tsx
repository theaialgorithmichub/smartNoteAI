"use client"

import React from 'react'
import { Heart, Github, Twitter, Mail } from 'lucide-react'

export function TemplateFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left side - Branding */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by SmartNote AI</span>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="/dashboard" 
              className="text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="/dashboard/settings" 
              className="text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              Settings
            </a>
            <a 
              href="#" 
              className="text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              Help
            </a>
          </div>

          {/* Right side - Social */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a 
              href="#" 
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a 
              href="#" 
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-500 dark:text-neutral-500">
          © {new Date().getFullYear()} SmartNote AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
