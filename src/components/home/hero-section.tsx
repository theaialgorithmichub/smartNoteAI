'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { SplineScene } from '@/components/ui/splite'
import { Card } from '@/components/ui/card'
import { Spotlight } from '@/components/ui/spotlight'
import { StardustButton } from '@/components/ui/stardust-button'
import { LiquidButton } from '@/components/ui/liquid-button'

export function HeroSection() {
  return (
    <section className="pt-16 w-full overflow-hidden">
      <Card className="w-full h-[calc(100vh-64px)] bg-neutral-50 dark:bg-black/[0.96] relative overflow-hidden rounded-none border-0 transition-colors max-w-full">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        <div className="flex h-full flex-col md:flex-row">
          {/* Left content */}
          <div className="flex-1 p-6 sm:p-8 md:p-12 lg:p-16 relative z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 border rounded-full px-4 py-2 mb-6 w-fit" style={{ backgroundColor: 'var(--theme-primary)20', borderColor: 'var(--theme-primary)40' }}>
              <Sparkles className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--theme-accent)' }}>AI-Powered Note Taking</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400 leading-tight">
              Your Digital
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))' }}>
                Notebook Shelf
              </span>
            </h1>
            
            <p className="mt-4 sm:mt-6 text-neutral-600 dark:text-neutral-300 max-w-lg text-base sm:text-lg md:text-xl leading-relaxed">
              Experience the nostalgic feel of physical notebooks combined with the power of AI. 
              Flip pages, organize chapters, and let AI be your research companion.
            </p>
            
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
              <Link href="/sign-up">
                <StardustButton>Get Started Free</StardustButton>
              </Link>
              <Link href="/sign-in">
                <LiquidButton>Sign In</LiquidButton>
              </Link>
            </div>
            
            <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">10K+</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">Active Users</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">50K+</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">Notebooks Created</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">4.9</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">User Rating</p>
              </div>
            </div>
          </div>

          {/* Right content - 3D Scene */}
          <div className="flex-1 relative hidden md:block">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
            
            {/* Gradient overlay for smooth blend */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-50 dark:from-black via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </Card>
    </section>
  )
}
