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
    <section className="pt-16 min-h-screen">
      <Card className="w-full h-[calc(100vh-64px)] bg-neutral-50 dark:bg-black/[0.96] relative overflow-hidden rounded-none border-0 transition-colors">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        <div className="flex h-full flex-col md:flex-row">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-16 relative z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6 w-fit">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-amber-400 text-sm font-medium">AI-Powered Note Taking</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400 leading-tight">
              Your Digital
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                Notebook Shelf
              </span>
            </h1>
            
            <p className="mt-6 text-neutral-600 dark:text-neutral-300 max-w-lg text-lg md:text-xl leading-relaxed">
              Experience the nostalgic feel of physical notebooks combined with the power of AI. 
              Flip pages, organize chapters, and let AI be your research companion.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-6 items-center">
              <Link href="/sign-up">
                <StardustButton>Get Started Free</StardustButton>
              </Link>
              <Link href="/sign-in">
                <LiquidButton>Sign In</LiquidButton>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">10K+</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Active Users</p>
              </div>
              <div className="w-px h-12 bg-neutral-300 dark:bg-neutral-700" />
              <div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">50K+</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Notebooks Created</p>
              </div>
              <div className="w-px h-12 bg-neutral-300 dark:bg-neutral-700" />
              <div>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">4.9</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">User Rating</p>
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
