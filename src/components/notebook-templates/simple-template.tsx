"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Sparkles, Zap, Layers } from "lucide-react"
import { PageContent } from "@/components/notebook/page-content"

interface Page {
  _id: string
  pageNumber: number
  title: string
  content: string
  chapterId?: string
}

interface SimpleTemplateProps {
  notebookId: string
  pages: Page[]
  onUpdate: () => void
  onAddPage: () => void
  appearance: {
    themeColor: string
    pageColor: string
    paperPattern: string
  }
}

export function SimpleTemplate({ 
  notebookId, 
  pages, 
  onUpdate, 
  onAddPage,
  appearance 
}: SimpleTemplateProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward')

  const handleNextPage = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('forward')
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setIsFlipping(false)
      }, 600)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('backward')
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setIsFlipping(false)
      }, 600)
    }
  }

  const page = pages[currentPage]

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 0 || isFlipping}
        className="absolute left-8 z-50 p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-lg shadow-purple-500/20"
      >
        <ChevronLeft className="h-8 w-8 text-purple-300" />
      </button>

      <button
        onClick={handleNextPage}
        disabled={currentPage === pages.length - 1 || isFlipping}
        className="absolute right-8 z-50 p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-lg shadow-cyan-500/20"
      >
        <ChevronRight className="h-8 w-8 text-cyan-300" />
      </button>

      {/* Main Notebook Container */}
      <div className="relative" style={{ perspective: '2000px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{
              rotateY: flipDirection === 'forward' ? -90 : 90,
              opacity: 0,
              scale: 0.8
            }}
            animate={{
              rotateY: 0,
              opacity: 1,
              scale: 1
            }}
            exit={{
              rotateY: flipDirection === 'forward' ? 90 : -90,
              opacity: 0,
              scale: 0.8
            }}
            transition={{
              duration: 0.6,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Notebook */}
            <div 
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                width: '900px',
                height: '650px',
                boxShadow: `
                  0 0 80px rgba(139, 92, 246, 0.4),
                  0 0 40px rgba(6, 182, 212, 0.3),
                  inset 0 0 60px rgba(139, 92, 246, 0.1)
                `
              }}
            >
              {/* Glassmorphism Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-purple-500/5 to-cyan-500/10 backdrop-blur-2xl" />
              
              {/* Border Glow */}
              <div className="absolute inset-0 rounded-3xl border-2 border-purple-500/30" />
              <div className="absolute inset-0 rounded-3xl border border-cyan-500/20" />

              {/* Top Bar with Neon Accent */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 backdrop-blur-xl border-b border-purple-500/30 flex items-center justify-between px-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse shadow-lg shadow-purple-500/50" />
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse delay-150 shadow-lg shadow-cyan-500/50" />
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse delay-300 shadow-lg shadow-purple-500/50" />
                </div>
                
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Page {currentPage + 1} of {pages.length}
                  </span>
                  <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
                </div>

                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-400" />
                </div>
              </div>

              {/* Page Content Area */}
              <div className="absolute top-16 left-0 right-0 bottom-0 overflow-auto">
                <div className="p-12">
                  {/* Holographic Page Title */}
                  {page?.title && (
                    <div className="mb-8 pb-4 border-b border-purple-500/20">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                        {page.title}
                      </h2>
                    </div>
                  )}

                  {/* Content with Futuristic Styling */}
                  <div className="relative">
                    {/* Subtle Grid Background */}
                    <div className="absolute inset-0 opacity-5" style={{
                      backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }} />
                    
                    <div className="relative z-10">
                      {page ? (
                        <PageContent
                          page={page}
                          notebookId={notebookId}
                          paperPattern={appearance.paperPattern}
                          onUpdate={onUpdate}
                          isEditing={true}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-purple-300/50">
                          <Sparkles className="h-16 w-16 mb-4 animate-pulse" />
                          <p className="text-lg">No content yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 animate-gradient" />

              {/* Corner Decorations */}
              <div className="absolute top-16 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-br-full" />
              <div className="absolute top-16 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-tr-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-tl-full" />
            </div>

            {/* 3D Shadow Effect */}
            <div 
              className="absolute inset-0 -z-10 rounded-3xl blur-2xl opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))',
                transform: 'translateZ(-50px) scale(1.05)'
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Page Button */}
      <button
        onClick={onAddPage}
        className="absolute bottom-8 right-8 p-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 hover:scale-110 shadow-lg shadow-purple-500/50 group"
      >
        <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Page Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentPage && !isFlipping) {
                setIsFlipping(true)
                setFlipDirection(index > currentPage ? 'forward' : 'backward')
                setTimeout(() => {
                  setCurrentPage(index)
                  setIsFlipping(false)
                }, 600)
              }
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentPage 
                ? 'w-8 bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/50' 
                : 'w-2 bg-purple-500/30 hover:bg-purple-500/50'
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
