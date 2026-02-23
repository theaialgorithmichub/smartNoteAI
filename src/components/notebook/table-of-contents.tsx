"use client"

import { BookOpen, FileText } from "lucide-react"

interface Chapter {
  _id: string
  title: string
  orderIndex: number
  color: string
}

interface Page {
  _id: string
  pageNumber: number
  title: string
  chapterId?: string
}

interface TableOfContentsProps {
  chapters: Chapter[]
  pages: Page[]
  onNavigate: (pageNumber: number) => void
  onClose?: () => void
}

export function TableOfContents({
  chapters,
  pages,
  onNavigate,
  onClose,
}: TableOfContentsProps) {
  // Group pages by chapter
  const getChapterPages = (chapterId: string) => {
    return pages
      .filter((p) => p.chapterId === chapterId)
      .sort((a, b) => a.pageNumber - b.pageNumber)
  }

  // Get pages without chapter
  const unassignedPages = pages
    .filter((p) => !p.chapterId)
    .sort((a, b) => a.pageNumber - b.pageNumber)

  return (
    <div className="h-full flex flex-col">
      {/* Sticky top bar with Cover button */}
      {onClose && (
        <div className="flex-shrink-0 px-6 pt-4 pb-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors bg-amber-50 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-neutral-700 px-3 py-1.5 rounded-lg"
          >
            <BookOpen className="h-4 w-4" />
            ← Cover Page
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
      {/* Header */}
      <div className="text-center mb-8 mt-4">
        <BookOpen className="h-12 w-12 text-amber-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-200">Table of Contents</h1>
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        {chapters
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((chapter) => {
            const chapterPages = getChapterPages(chapter._id)
            const startPage = chapterPages[0]?.pageNumber || "-"

            return (
              <div key={chapter._id}>
                {/* Chapter Header */}
                <button
                  onClick={() => chapterPages[0] && onNavigate(chapterPages[0].pageNumber)}
                  className="w-full flex items-center gap-3 group"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: chapter.color }}
                  />
                  <span className="flex-1 text-left font-semibold text-amber-900 group-hover:text-amber-700">
                    {chapter.title}
                  </span>
                  <span className="text-amber-500 text-sm">{startPage}</span>
                  <div className="flex-1 border-b border-dotted border-amber-300" />
                </button>

                {/* Chapter Pages */}
                <div className="ml-6 mt-2 space-y-1">
                  {chapterPages.map((page) => (
                    <button
                      key={page._id}
                      onClick={() => onNavigate(page.pageNumber)}
                      className="w-full flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 py-1"
                    >
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">
                        {page.title || `Page ${page.pageNumber}`}
                      </span>
                      <span className="text-amber-400">{page.pageNumber}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

        {/* Unassigned Pages */}
        {unassignedPages.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="font-semibold text-gray-600">Other Pages</span>
            </div>
            <div className="ml-6 space-y-1">
              {unassignedPages.map((page) => (
                <button
                  key={page._id}
                  onClick={() => onNavigate(page.pageNumber)}
                  className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 py-1"
                >
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">
                    {page.title || `Page ${page.pageNumber}`}
                  </span>
                  <span className="text-gray-400">{page.pageNumber}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {chapters.length === 0 && pages.length === 0 && (
          <div className="text-center py-12 text-amber-500">
            <p>No content yet.</p>
            <p className="text-sm mt-1">Add pages to get started!</p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
