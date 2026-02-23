"use client"

import { useState } from "react"
import { Plus, Edit2, Check, X } from "lucide-react"

interface Chapter {
  _id: string
  title: string
  orderIndex: number
  color: string
}

interface Page {
  _id: string
  pageNumber: number
  chapterId?: string
}

interface ChapterTabsProps {
  chapters: Chapter[]
  pages: Page[]
  currentPage: number
  onSelectChapter: (pageNumber: number) => void
}

export function ChapterTabs({
  chapters,
  pages,
  currentPage,
  onSelectChapter,
}: ChapterTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  // Get first page of each chapter
  const getChapterStartPage = (chapterId: string): number => {
    const chapterPages = pages.filter((p) => p.chapterId === chapterId)
    if (chapterPages.length === 0) return 1
    return Math.min(...chapterPages.map((p) => p.pageNumber))
  }

  // Check if current page is in chapter
  const isInChapter = (chapterId: string): boolean => {
    const currentPageData = pages.find((p) => p.pageNumber === currentPage)
    return currentPageData?.chapterId === chapterId
  }

  const startEdit = (chapter: Chapter) => {
    setEditingId(chapter._id)
    setEditTitle(chapter.title)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const saveEdit = async (chapterId: string) => {
    // API call would go here
    setEditingId(null)
  }

  return (
    <div className="w-12 flex flex-col items-end py-20 pr-0 relative z-10">
      {chapters
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((chapter, index) => {
          const isActive = isInChapter(chapter._id)
          const startPage = getChapterStartPage(chapter._id)

          return (
            <button
              key={chapter._id}
              onClick={() => onSelectChapter(startPage)}
              className="sticky-tab group"
              style={{
                backgroundColor: chapter.color,
                top: `${80 + index * 50}px`,
              }}
              title={chapter.title}
            >
              {/* Tab Content */}
              <div
                className={`absolute right-full mr-2 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                  isActive ? "opacity-100" : ""
                }`}
              >
                <span className="text-sm font-medium text-gray-800">
                  {chapter.title}
                </span>
                <span className="text-xs text-gray-500 ml-2">p.{startPage}</span>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-white/30 rounded-r" />
              )}
            </button>
          )
        })}

      {/* Add Chapter Button */}
      <button
        className="sticky-tab mt-4 bg-amber-200 hover:bg-amber-300 transition-colors"
        style={{ top: `${80 + chapters.length * 50}px` }}
        title="Add Chapter"
      >
        <Plus className="h-4 w-4 text-amber-700 mx-auto" />
      </button>
    </div>
  )
}
