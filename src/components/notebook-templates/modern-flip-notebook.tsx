"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TemplateHeader } from './template-header'
import { ChevronLeft, ChevronRight, Plus, List, Save, Download, Palette } from "lucide-react"
import { QuillEditor } from "@/components/notebook/quill-editor"

interface Page {
  _id: string
  pageNumber: number
  title: string
  content: string
  chapterId?: string
}

interface ModernFlipNotebookProps {
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

export function ModernFlipNotebook({ 
  title,
  notebookId, 
  pages, 
  onUpdate, 
  onAddPage,
  appearance 
}: ModernFlipNotebookProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next')
  const [showTOC, setShowTOC] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const flushRef = useRef<(() => Promise<void>) | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/page-flip.mp3')
      audioRef.current.volume = 0.2
    }
  }, [])

  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  const handlePrevPage = async () => {
    if (currentPage > 0 && !isFlipping) {
      if (flushRef.current) {
        await flushRef.current()
      }
      setIsFlipping(true)
      setFlipDirection('prev')
      playFlipSound()
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setTimeout(() => setIsFlipping(false), 100)
      }, 300)
    }
  }

  const handleNextPage = async () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      if (flushRef.current) {
        await flushRef.current()
      }
      setIsFlipping(true)
      setFlipDirection('next')
      playFlipSound()
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setTimeout(() => setIsFlipping(false), 100)
      }, 300)
    }
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <TemplateHeader title={title} />
      
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
              Page {currentPage + 1} / {pages.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTOC(true)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Contents
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            {isSaving && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-sm">
                <Save className="h-4 w-4 animate-pulse" />
                Saving
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Maximum Space */}
      <div className="flex-1 relative overflow-hidden" style={{ perspective: '1500px' }}>
        {/* Navigation Arrows */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0 || isFlipping}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 rounded-full shadow-2xl transition-all disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage === pages.length - 1 || isFlipping}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 rounded-full shadow-2xl transition-all disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Page Container with Flip Effect */}
        <div className="h-full flex items-center justify-center p-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              initial={{
                rotateY: flipDirection === 'next' ? 180 : -180,
                opacity: 0,
              }}
              animate={{
                rotateY: 0,
                opacity: 1,
              }}
              exit={{
                rotateY: flipDirection === 'next' ? -180 : 180,
                opacity: 0,
              }}
              transition={{
                duration: 0.6,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              className="w-full h-full max-w-[1400px]"
            >
              {/* Paper Page */}
              <div 
                className="relative w-full h-full bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-lg shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              >
                {/* Page Number Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-lg z-10">
                  {currentPage + 1}
                </div>

                {/* Editor Area - Maximum Space */}
                <div className="h-full flex flex-col">
                  {/* Inline Toolbar */}
                  <div className="flex-shrink-0 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
                    <style jsx global>{`
                      .inline-toolbar {
                        position: relative;
                        z-index: 1000;
                      }
                      .inline-toolbar .ql-picker-label,
                      .inline-toolbar .ql-picker-item {
                        color: #1f2937 !important;
                      }
                      .inline-toolbar .ql-picker-options {
                        background-color: white !important;
                        border: 1px solid #e5e7eb !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                        z-index: 999999 !important;
                        position: absolute !important;
                      }
                      .inline-toolbar .ql-picker-item {
                        padding: 8px 12px !important;
                      }
                      .inline-toolbar .ql-picker-item:hover {
                        background-color: #f3f4f6 !important;
                      }
                      .inline-toolbar .ql-stroke {
                        stroke: #1f2937 !important;
                      }
                      .inline-toolbar .ql-fill {
                        fill: #1f2937 !important;
                      }
                      .inline-toolbar button:hover {
                        background-color: #f3f4f6 !important;
                      }
                      .inline-toolbar .ql-active {
                        background-color: #dbeafe !important;
                      }
                    `}</style>
                    <div id="quill-toolbar" className="ql-toolbar ql-snow inline-toolbar">
                      <span className="ql-formats">
                        <select className="ql-font"></select>
                        <select className="ql-header"></select>
                      </span>
                      <span className="ql-formats">
                        <button className="ql-bold"></button>
                        <button className="ql-italic"></button>
                        <button className="ql-underline"></button>
                      </span>
                      <span className="ql-formats">
                        <select className="ql-color"></select>
                        <select className="ql-background"></select>
                      </span>
                      <span className="ql-formats">
                        <button className="ql-list" value="ordered"></button>
                        <button className="ql-list" value="bullet"></button>
                      </span>
                      <span className="ql-formats">
                        <button className="ql-link"></button>
                        <button className="ql-image"></button>
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto px-12 py-8">
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
                        onContentChange={() => {}}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No page selected</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Page Button */}
                <button
                  onClick={onAddPage}
                  className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                  New Page
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-6"
            onClick={() => setShowTOC(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-white mb-4">Table of Contents</h2>
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
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
