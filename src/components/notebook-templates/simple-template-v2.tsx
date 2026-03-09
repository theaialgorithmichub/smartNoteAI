"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, List, Hash, BookOpen, Save, Palette, Download } from "lucide-react"
import { QuillEditor } from "@/components/notebook/quill-editor"

interface Page {
  _id: string
  pageNumber: number
  title: string
  content: string
  chapterId?: string
}

interface SimpleTemplateProps {
  title: string
  notebookId: string
  pages: Page[]
  onUpdate: () => void
  onAddPage: () => void
  appearance?: {
    themeColor?: string
    pageColor?: string
    paperPattern?: string
  }
}

const themes = {
  default: {
    background: "from-slate-900 via-slate-800 to-slate-900",
    headerBg: "bg-slate-800/90",
    headerText: "text-slate-100",
    contentBg: "bg-gradient-to-br from-amber-50 to-orange-50",
    contentText: "text-slate-900",
    accent: "from-blue-500 to-purple-600",
    pageShadow: "shadow-2xl shadow-black/50"
  }
}

export function SimpleTemplate({ 
  title,
  notebookId, 
  pages, 
  onUpdate, 
  onAddPage,
  appearance 
}: SimpleTemplateProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [notebookTitle, setNotebookTitle] = useState(title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showTOC, setShowTOC] = useState(false)
  const [showGotoPage, setShowGotoPage] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next')
  const [isFlipping, setIsFlipping] = useState(false)
  
  const flushRef = useRef<(() => Promise<void>) | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTheme = themes.default

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/page-flip.mp3')
    audioRef.current.volume = 0.3
  }, [])

  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('prev')
      playFlipSound()
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setIsFlipping(false)
      }, 400)
    }
  }

  const handleNextPage = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('next')
      playFlipSound()
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setIsFlipping(false)
      }, 400)
    }
  }

  const handleContentChange = async (pageId: string, content: string, title: string) => {
    // QuillEditor auto-saves
  }

  const handleExportPDF = async () => {
    try {
      const { PDFExporter } = await import('@/lib/pdf-export')
      const exporter = new PDFExporter({
        title: title,
        author: 'SmartNote AI',
        includeHeader: true,
        includeFooter: true,
        includePageNumbers: true,
      })

      for (const page of pages) {
        exporter.addHeading(page.title || `Page ${page.pageNumber}`, 1)
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = page.content
        const textContent = tempDiv.textContent || tempDiv.innerText || ''
        if (textContent.trim()) {
          exporter.addText(textContent)
        }
        exporter.addHorizontalLine()
      }

      exporter.save(`${title}.pdf`)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    }
  }

  const page = pages[currentPage]

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Modern Header */}
      <div className="flex-shrink-0 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50">
        {/* Title Bar */}
        <div className="px-8 py-4 border-b border-slate-700/30">
          {isEditingTitle ? (
            <input
              type="text"
              value={notebookTitle}
              onChange={(e) => setNotebookTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setIsEditingTitle(false)
                }
              }}
              className="text-3xl font-bold text-slate-100 bg-transparent border-b-2 border-blue-400 outline-none px-2 py-1"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-3xl font-bold text-slate-100 cursor-pointer hover:text-blue-400 transition-colors"
            >
              {notebookTitle}
            </h1>
          )}
        </div>
        
        {/* Toolbar & Controls */}
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-semibold text-slate-200">
                Page {currentPage + 1} of {pages.length}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTOC(!showTOC)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-200 bg-slate-700/50 hover:bg-slate-700 text-sm transition-all"
            >
              <List className="h-4 w-4" />
              Contents
            </button>
            
            <button
              onClick={() => setShowGotoPage(!showGotoPage)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-200 bg-slate-700/50 hover:bg-slate-700 text-sm transition-all"
            >
              <Hash className="h-4 w-4" />
              Go to Page
            </button>
            
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-200 bg-slate-700/50 hover:bg-slate-700 text-sm transition-all"
            >
              <Palette className="h-4 w-4" />
              Theme
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-200 bg-slate-700/50 hover:bg-slate-700 text-sm transition-all"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            
            {isSaving && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-300 text-sm">
                <Save className="h-4 w-4 animate-pulse" />
                Saving...
              </div>
            )}
          </div>
        </div>

        {/* Quill Toolbar */}
        <div id="quill-toolbar" className="ql-toolbar ql-snow border-t border-slate-700/30 bg-slate-800/50">
          <span className="ql-formats">
            <select className="ql-font"></select>
            <select className="ql-header"></select>
          </span>
          <span className="ql-formats">
            <button className="ql-bold"></button>
            <button className="ql-italic"></button>
            <button className="ql-underline"></button>
            <button className="ql-strike"></button>
          </span>
          <span className="ql-formats">
            <select className="ql-color"></select>
            <select className="ql-background"></select>
          </span>
          <span className="ql-formats">
            <button className="ql-list" value="ordered"></button>
            <button className="ql-list" value="bullet"></button>
            <select className="ql-align"></select>
          </span>
          <span className="ql-formats">
            <button className="ql-blockquote"></button>
            <button className="ql-code-block"></button>
          </span>
          <span className="ql-formats">
            <button className="ql-link"></button>
            <button className="ql-image"></button>
          </span>
          <span className="ql-formats">
            <button className="ql-clean"></button>
          </span>
        </div>
      </div>

      {/* Main Notebook Area with 3D Perspective */}
      <div className="flex-1 relative overflow-hidden" style={{ perspective: '2000px' }}>
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0 || isFlipping}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-2 border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl hover:scale-110"
        >
          <ChevronLeft className="h-7 w-7 text-white" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage === pages.length - 1 || isFlipping}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-2 border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl hover:scale-110"
        >
          <ChevronRight className="h-7 w-7 text-white" />
        </button>

        {/* Notebook Pages with 3D Flip */}
        <div className="h-full flex items-center justify-center p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{
                rotateY: flipDirection === 'next' ? 90 : -90,
                opacity: 0,
                scale: 0.8
              }}
              animate={{
                rotateY: 0,
                opacity: 1,
                scale: 1
              }}
              exit={{
                rotateY: flipDirection === 'next' ? -90 : 90,
                opacity: 0,
                scale: 0.8
              }}
              transition={{
                duration: 0.6,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className="w-full max-w-6xl h-full"
            >
              <div className="relative w-full h-full bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl shadow-2xl border-4 border-amber-200/50 overflow-hidden"
                   style={{
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px 0 rgba(255, 255, 255, 0.6)'
                   }}>
                
                {/* Page Number Badge */}
                <div className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg z-10">
                  <span className="text-white font-bold text-sm">Page {currentPage + 1}</span>
                </div>

                {/* Page Content */}
                <div className="h-full overflow-y-auto p-12">
                  {page ? (
                    <QuillEditor
                      pageId={page._id}
                      notebookId={notebookId}
                      initialContent={page.content}
                      initialTitle={page.title}
                      pageNumber={page.pageNumber}
                      isEditing={true}
                      onSave={onUpdate}
                      flushRef={flushRef}
                      onContentChange={handleContentChange}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 opacity-40">
                      <p className="text-xl">No page selected</p>
                    </div>
                  )}
                </div>

                {/* Add New Page Button - Bottom Right */}
                <button
                  onClick={onAddPage}
                  className="absolute bottom-8 right-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all shadow-xl hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Add New Page
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Table of Contents Modal */}
      <AnimatePresence>
        {showTOC && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowTOC(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Table of Contents</h2>
              <div className="space-y-2">
                {pages.map((p, idx) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setCurrentPage(idx)
                      setShowTOC(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      idx === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{p.title || `Page ${p.pageNumber}`}</span>
                      <span className="text-sm opacity-70">Page {p.pageNumber}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
