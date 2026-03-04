"use client"

import React from 'react'
import Link from 'next/link'
import { BookOpen, Trash2, Settings } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface TemplateHeaderProps {
  title?: string
  showBackButton?: boolean
}

export function TemplateHeader({ title = "SmartNote AI", showBackButton = true }: TemplateHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
              {title}
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/dashboard/trash"
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Trash"
            >
              <Trash2 className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/settings"
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  )
}
