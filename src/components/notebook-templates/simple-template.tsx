"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, List, Save, Download, Sparkles } from "lucide-react"
import { AIToolbar } from "@/components/ai/AIToolbar"
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

export function SimpleTemplate({ 
  title,
  notebookId, 
  pages, 
  onUpdate, 
  onAddPage,
  appearance 
}: ModernFlipNotebookProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isAIOpen, setIsAIOpen] = useState(false)
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

  const FLIP_DURATION_MS = 450

  const handlePrevPage = async () => {
    if (currentPage > 0 && !isFlipping) {
      if (flushRef.current) {
        await flushRef.current()
      }
      setIsFlipping(true)
      setFlipDirection('prev')
      playFlipSound()
      setCurrentPage(currentPage - 1)
      setTimeout(() => setIsFlipping(false), FLIP_DURATION_MS)
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
      setCurrentPage(currentPage + 1)
      setTimeout(() => setIsFlipping(false), FLIP_DURATION_MS)
    }
  }

  const handleExportPDF = async () => {
    try {
      const { PDFExporter } = await import('@/lib/pdf-export')
      const exporter = new PDFExporter({
        title: title,
        author: 'smartDigitalNotes',
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
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <span className="px-3 py-1.5 bg-blue-500/25 text-blue-200 rounded-full text-sm font-medium border border-blue-400/20">
              Page {currentPage + 1} / {pages.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAIOpen(o => !o)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                isAIOpen ? 'bg-purple-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              }`}
              title="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
              AI
            </button>
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

      {/* Main Content - Maximum writing space */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0 || isFlipping}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 rounded-full shadow-xl transition-all disabled:cursor-not-allowed border border-blue-400/30"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage === pages.length - 1 || isFlipping}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 rounded-full shadow-xl transition-all disabled:cursor-not-allowed border border-blue-400/30"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Page Container with 3D Flip Effect */}
        <div className="h-full flex items-center justify-center p-4" style={{ perspective: 2000 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              initial={{
                rotateY: flipDirection === 'next' ? 90 : -90,
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                rotateY: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                rotateY: flipDirection === 'next' ? -90 : 90,
                opacity: 0,
                scale: 0.96,
              }}
              transition={{
                duration: 0.45,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full h-full max-w-[1400px]"
            >
              {/* Paper Page - clear single-page look */}
              <div
                className="relative w-full h-full bg-gradient-to-br from-white via-amber-50/95 to-orange-50/90 rounded-2xl overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                {/* Page Number Badge */}
                <div className="absolute top-5 right-5 px-3.5 py-1.5 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-lg z-10">
                  {currentPage + 1}
                </div>

                {/* Editor Area - QuillEditor has built-in toolbar on top (reliable font/color/heading) */}
                <div className="h-full flex flex-col overflow-hidden">
                  <style jsx global>{`
                      /* Google Fonts import */
                      @import url('https://fonts.googleapis.com/css2?family=Roboto&family=Lato&family=Poppins&family=Montserrat&family=Inter&family=Raleway&family=Nunito&family=Oswald&family=Merriweather&family=Ubuntu&family=Playfair+Display&family=Open+Sans&family=Source+Sans+3&family=Work+Sans&family=DM+Sans&display=swap');

                      /* Font picker scrollable */
                      .ql-snow .ql-picker.ql-font .ql-picker-options {
                        max-height: 300px !important;
                        overflow-y: auto !important;
                        width: 160px !important;
                      }

                      /* Font dropdown labels - lowercase values */
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=arial]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=arial]::before { content: 'Arial'; font-family: Arial; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=georgia]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=georgia]::before { content: 'Georgia'; font-family: Georgia; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=verdana]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=verdana]::before { content: 'Verdana'; font-family: Verdana; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=tahoma]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=tahoma]::before { content: 'Tahoma'; font-family: Tahoma; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=trebuchet]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=trebuchet]::before { content: 'Trebuchet'; font-family: 'Trebuchet MS'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=impact]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=impact]::before { content: 'Impact'; font-family: Impact; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=courier]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=courier]::before { content: 'Courier'; font-family: 'Courier New'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=times]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=times]::before { content: 'Times'; font-family: 'Times New Roman'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=palatino]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=palatino]::before { content: 'Palatino'; font-family: Palatino; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=garamond]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=garamond]::before { content: 'Garamond'; font-family: Garamond; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=roboto]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=roboto]::before { content: 'Roboto'; font-family: 'Roboto'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=lato]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=lato]::before { content: 'Lato'; font-family: 'Lato'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=poppins]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=poppins]::before { content: 'Poppins'; font-family: 'Poppins'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=montserrat]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=montserrat]::before { content: 'Montserrat'; font-family: 'Montserrat'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=inter]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=inter]::before { content: 'Inter'; font-family: 'Inter'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=raleway]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=raleway]::before { content: 'Raleway'; font-family: 'Raleway'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=nunito]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=nunito]::before { content: 'Nunito'; font-family: 'Nunito'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=oswald]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=oswald]::before { content: 'Oswald'; font-family: 'Oswald'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=merriweather]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=merriweather]::before { content: 'Merriweather'; font-family: 'Merriweather'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=ubuntu]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=ubuntu]::before { content: 'Ubuntu'; font-family: 'Ubuntu'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=playfair]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=playfair]::before { content: 'Playfair'; font-family: 'Playfair Display'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=opensans]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=opensans]::before { content: 'Open Sans'; font-family: 'Open Sans'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=sourcesans]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=sourcesans]::before { content: 'Source Sans'; font-family: 'Source Sans 3'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=worksans]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=worksans]::before { content: 'Work Sans'; font-family: 'Work Sans'; }
                      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=dmsans]::before,
                      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=dmsans]::before { content: 'DM Sans'; font-family: 'DM Sans'; }

                      /* Apply fonts to editor content - must match whitelist exactly */
                      .ql-font-arial { font-family: Arial, sans-serif !important; }
                      .ql-font-georgia { font-family: Georgia, serif !important; }
                      .ql-font-verdana { font-family: Verdana, sans-serif !important; }
                      .ql-font-tahoma { font-family: Tahoma, sans-serif !important; }
                      .ql-font-trebuchet { font-family: 'Trebuchet MS', sans-serif !important; }
                      .ql-font-impact { font-family: Impact, sans-serif !important; }
                      .ql-font-courier { font-family: 'Courier New', monospace !important; }
                      .ql-font-times { font-family: 'Times New Roman', serif !important; }
                      .ql-font-palatino { font-family: Palatino, serif !important; }
                      .ql-font-garamond { font-family: Garamond, serif !important; }
                      .ql-font-roboto { font-family: 'Roboto', sans-serif !important; }
                      .ql-font-lato { font-family: 'Lato', sans-serif !important; }
                      .ql-font-poppins { font-family: 'Poppins', sans-serif !important; }
                      .ql-font-montserrat { font-family: 'Montserrat', sans-serif !important; }
                      .ql-font-inter { font-family: 'Inter', sans-serif !important; }
                      .ql-font-raleway { font-family: 'Raleway', sans-serif !important; }
                      .ql-font-nunito { font-family: 'Nunito', sans-serif !important; }
                      .ql-font-oswald { font-family: 'Oswald', sans-serif !important; }
                      .ql-font-merriweather { font-family: 'Merriweather', serif !important; }
                      .ql-font-ubuntu { font-family: 'Ubuntu', sans-serif !important; }
                      .ql-font-playfair { font-family: 'Playfair Display', serif !important; }
                      .ql-font-opensans { font-family: 'Open Sans', sans-serif !important; }
                      .ql-font-sourcesans { font-family: 'Source Sans 3', sans-serif !important; }
                      .ql-font-worksans { font-family: 'Work Sans', sans-serif !important; }
                      .ql-font-dmsans { font-family: 'DM Sans', sans-serif !important; }
                      
                      #quill-toolbar {
                        position: relative !important;
                        z-index: 10000 !important;
                      }
                      #quill-toolbar .ql-picker {
                        position: relative !important;
                      }
                      #quill-toolbar .ql-picker-label,
                      #quill-toolbar .ql-picker-item {
                        color: #1f2937 !important;
                        cursor: pointer !important;
                      }
                      #quill-toolbar .ql-picker-options {
                        background-color: white !important;
                        border: 1px solid #e5e7eb !important;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2) !important;
                        z-index: 999999 !important;
                        position: absolute !important;
                        top: 100% !important;
                        left: 0 !important;
                        pointer-events: auto !important;
                        user-select: none !important;
                      }
                      #quill-toolbar .ql-picker.ql-expanded .ql-picker-options {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                      }
                      #quill-toolbar .ql-picker:not(.ql-expanded) .ql-picker-options {
                        display: none !important;
                      }
                      #quill-toolbar .ql-picker-item {
                        padding: 8px 12px !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                        user-select: none !important;
                      }
                      #quill-toolbar .ql-picker-item:hover {
                        background-color: #f3f4f6 !important;
                      }
                      #quill-toolbar .ql-color-picker .ql-picker-item {
                        width: 20px !important;
                        height: 20px !important;
                        padding: 2px !important;
                        margin: 2px !important;
                      }
                      #quill-toolbar .ql-stroke {
                        stroke: #1f2937 !important;
                      }
                      #quill-toolbar .ql-fill {
                        fill: #1f2937 !important;
                      }
                      #quill-toolbar button {
                        cursor: pointer !important;
                      }
                      #quill-toolbar button:hover {
                        background-color: #f3f4f6 !important;
                      }
                      #quill-toolbar .ql-active {
                        background-color: #dbeafe !important;
                      }
                    `}</style>

                  {/* Content Area - editor with built-in toolbar on top */}
                  <div className="notebook-paper-editor flex-1 min-h-0 overflow-hidden">
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
                  className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all border border-blue-400/30 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  New Page
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* AI Toolbar overlay */}
      <AnimatePresence>
        {isAIOpen && (
          <AIToolbar
            selectedText=""
            notebookId={notebookId}
            notebookTitle={title}
            currentPageContent={pages[currentPage]?.content || ""}
            onApply={() => setIsAIOpen(false)}
            onClose={() => setIsAIOpen(false)}
          />
        )}
      </AnimatePresence>

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
