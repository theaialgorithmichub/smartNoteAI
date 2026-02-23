"use client"

import { useState } from "react"

interface PageScrubberProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PageScrubber({
  currentPage,
  totalPages,
  onPageChange,
}: PageScrubberProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [hoverPage, setHoverPage] = useState<number | null>(null)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    onPageChange(page)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const page = Math.round(percent * (totalPages - 1)) + 1
    setHoverPage(Math.max(1, Math.min(totalPages, page)))
  }

  if (totalPages <= 1) return null

  return (
    <div className="px-8 py-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-t border-amber-100 dark:border-neutral-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="text-sm text-amber-600 w-16">Page {currentPage}</span>
          
          <div className="flex-1 relative">
            {/* Hover Preview */}
            {hoverPage !== null && isDragging && (
              <div
                className="absolute -top-8 bg-amber-700 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2"
                style={{
                  left: `${((hoverPage - 1) / (totalPages - 1)) * 100}%`,
                }}
              >
                Page {hoverPage}
              </div>
            )}

            {/* Slider */}
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => {
                setIsDragging(false)
                setHoverPage(null)
              }}
              onMouseMove={handleMouseMove}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-amber-600
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:hover:bg-amber-700
                [&::-webkit-slider-thumb]:transition-colors"
            />

            {/* Page Markers */}
            <div className="flex justify-between mt-1">
              {totalPages <= 20 ? (
                [...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`w-1 h-1 rounded-full transition-colors ${
                      i + 1 === currentPage ? "bg-amber-600" : "bg-amber-300"
                    }`}
                  />
                ))
              ) : (
                <>
                  <span className="text-xs text-amber-400">1</span>
                  <span className="text-xs text-amber-400">{totalPages}</span>
                </>
              )}
            </div>
          </div>

          <span className="text-sm text-amber-600 w-16 text-right">of {totalPages}</span>
        </div>
      </div>
    </div>
  )
}
