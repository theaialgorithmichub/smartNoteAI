"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Filter, Sparkles } from "lucide-react"
import { NotebookCard } from "./notebook-card"
import { CreateNotebookDialog } from "./create-notebook-dialog"
import { CubeLoaderCard } from "./cube-loader-card"

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

interface BookshelfProps {
  userId: string
}

export function Bookshelf({ userId }: BookshelfProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchNotebooks()
  }, [filter])

  // Track mouse movement for floating gallery-style perspective
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / 25
      const y = (e.clientY - rect.top - rect.height / 2) / 25
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const fetchNotebooks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/notebooks?filter=${filter}`)
      const data = await res.json()
      setNotebooks(data.notebooks || [])
    } catch (error) {
      console.error("Failed to fetch notebooks:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["all", "Personal", "Work", "School", "Research"]

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <Filter className="h-5 w-5 text-amber-500 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              filter === cat
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {cat === "all" ? "All Notebooks" : cat}
          </button>
        ))}
      </div>

      {/* Bookshelf Grid */}
      <div
        ref={containerRef}
        className="relative"
        style={{ perspective: "1500px" }}
      >
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4"
          style={{
            transform: `rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Create New Notebook Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateOpen(true)}
            className="aspect-square rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:border-amber-500/50 flex flex-col items-center justify-center gap-4 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/25">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <span className="text-neutral-500 dark:text-neutral-400 font-medium text-sm group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">New Notebook</span>
          </motion.button>

          {/* Loading Animation */}
          {loading && (
            <>
              {[...Array(4)].map((_, i) => (
                <CubeLoaderCard key={i} />
              ))}
            </>
          )}

          {/* Notebook Cards */}
          <AnimatePresence>
            {!loading &&
              notebooks.map((notebook, index) => (
                <motion.div
                  key={notebook._id}
                  className="relative group"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.06, duration: 0.6, type: "spring", stiffness: 120 }}
                  whileHover={{
                    y: -6,
                    scale: 1.03,
                    transition: { duration: 0.25 },
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      className="h-full w-full rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(139,92,246,0.7), transparent 70%)",
                        boxShadow: "0 0 40px 2px rgba(139,92,246,0.45)",
                      }}
                    />
                  </div>
                  <div style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }}>
                    <NotebookCard notebook={notebook} onUpdate={fetchNotebooks} />
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {!loading && notebooks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-amber-500" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">No notebooks yet.</p>
            <p className="text-neutral-500 mt-1">Create your first notebook to get started!</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateNotebookDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={fetchNotebooks}
      />
    </div>
  )
}
