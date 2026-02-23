"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Command, FileText, Book, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchResult {
  _id: string
  notebookId: string
  notebookTitle: string
  pageNumber: number
  title: string
  snippet: string
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Debounced search
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, search])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    router.push(`/dashboard/notebook/${result.notebookId}?page=${result.pageNumber}`)
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition-colors text-neutral-300"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search notebooks...</span>
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-neutral-700 rounded text-xs text-neutral-400">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-neutral-800">
                <Search className="h-5 w-5 text-amber-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search across all notebooks..."
                  className="flex-1 outline-none text-lg text-white bg-transparent placeholder:text-neutral-500"
                />
                {loading && <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-neutral-800 rounded"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {results.length === 0 && query && !loading && (
                  <div className="p-8 text-center text-neutral-500">
                    No results found for "{query}"
                  </div>
                )}

                {results.length === 0 && !query && (
                  <div className="p-8 text-center text-neutral-500">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Start typing to search across all your notebooks</p>
                    <p className="text-sm mt-2 text-neutral-600">Tip: Use fuzzy search - typos are okay!</p>
                  </div>
                )}

                {results.map((result, index) => (
                  <button
                    key={result._id}
                    onClick={() => handleSelect(result)}
                    className="w-full p-4 text-left hover:bg-neutral-800 border-b border-neutral-800 last:border-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <FileText className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">
                            {result.title || `Page ${result.pageNumber}`}
                          </span>
                          <span className="text-xs text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded">
                            Page {result.pageNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-neutral-400 mt-1">
                          <Book className="h-3 w-3" />
                          <span className="truncate">{result.notebookTitle}</span>
                        </div>
                        {result.snippet && (
                          <p className="text-sm text-neutral-500 mt-2 line-clamp-2">
                            ...{result.snippet}...
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 bg-neutral-800/50 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>Press ESC to close</span>
                <span>↵ to select</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
