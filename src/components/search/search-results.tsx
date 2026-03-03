"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, FileText, Calendar, Tag, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import TetrisLoading from "@/components/ui/tetris-loader"

interface Notebook {
  _id: string
  title: string
  category: string
  appearance: {
    coverImageUrl?: string
    themeColor: string
    paperPattern: string
    fontStyle: string
  }
  tags: string[]
  pageCount: number
  updatedAt: string
}

interface SearchResultsProps {
  query: string
  userId: string
}

export function SearchResults({ query, userId }: SearchResultsProps) {
  const router = useRouter()
  const [results, setResults] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      searchNotebooks()
    } else {
      setResults([])
      setLoading(false)
    }
  }, [query])

  const searchNotebooks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/notebooks?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.notebooks || [])
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
        <Search className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Enter a search query to find notebooks</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <TetrisLoading 
          size="sm" 
          speed="fast" 
          showLoadingText={true}
          loadingText="Searching notebooks..."
        />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
        <Search className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg mb-2">No notebooks found</p>
        <p className="text-sm">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Found {results.length} {results.length === 1 ? 'notebook' : 'notebooks'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((notebook, index) => (
          <motion.div
            key={notebook._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(`/dashboard/notebook/${notebook._id}`)}
            className="group cursor-pointer"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg hover:border-amber-500/50 transition-all">
              {/* Cover Preview */}
              <div 
                className="w-full h-32 rounded-lg mb-4 relative overflow-hidden"
                style={{ 
                  backgroundColor: notebook.appearance.themeColor || '#8B4513'
                }}
              >
                {notebook.appearance.coverImageUrl && (
                  <img 
                    src={notebook.appearance.coverImageUrl} 
                    alt={notebook.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-white font-semibold text-lg truncate">
                    {notebook.title}
                  </h3>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Tag className="w-3 h-3" />
                  <span>{notebook.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <FileText className="w-3 h-3" />
                  <span>{notebook.pageCount} {notebook.pageCount === 1 ? 'page' : 'pages'}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Calendar className="w-3 h-3" />
                  <span>Updated {new Date(notebook.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              {notebook.tags && notebook.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {notebook.tags.slice(0, 3).map((tag, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {notebook.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-neutral-500">
                      +{notebook.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Open Button */}
              <div className="mt-4 flex items-center justify-end text-amber-600 dark:text-amber-500 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Open</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
