"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, RotateCcw, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface TrashedNotebook {
  _id: string
  title: string
  category: string
  appearance: {
    themeColor: string
  }
  trashedAt: string
  daysRemaining: number
}

interface TrashListProps {
  userId: string
}

export function TrashList({ userId }: TrashListProps) {
  const [notebooks, setNotebooks] = useState<TrashedNotebook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrashedNotebooks()
  }, [])

  const fetchTrashedNotebooks = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notebooks/trash")
      const data = await res.json()
      setNotebooks(data.notebooks || [])
    } catch (error) {
      console.error("Failed to fetch trashed notebooks:", error)
    } finally {
      setLoading(false)
    }
  }

  const restoreNotebook = async (id: string) => {
    try {
      await fetch(`/api/notebooks/${id}/restore`, {
        method: "POST",
      })
      fetchTrashedNotebooks()
    } catch (error) {
      console.error("Failed to restore notebook:", error)
    }
  }

  const permanentlyDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return

    try {
      await fetch(`/api/notebooks/${id}/permanent`, {
        method: "DELETE",
      })
      fetchTrashedNotebooks()
    } catch (error) {
      console.error("Failed to delete notebook:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-amber-100 rounded-lg skeleton-shimmer"
          />
        ))}
      </div>
    )
  }

  if (notebooks.length === 0) {
    return (
      <div className="text-center py-16">
        <Trash2 className="h-16 w-16 text-amber-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-amber-800 mb-2">
          Trash is empty
        </h2>
        <p className="text-amber-600">
          Deleted notebooks will appear here for 30 days
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {notebooks.map((notebook) => (
          <motion.div
            key={notebook._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-white rounded-lg border border-amber-200 p-4 flex items-center gap-4"
          >
            {/* Cover Preview */}
            <div
              className="w-12 h-16 rounded flex-shrink-0"
              style={{ backgroundColor: notebook.appearance.themeColor }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 truncate">
                {notebook.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-amber-600 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Deleted {formatDate(notebook.trashedAt)}
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    notebook.daysRemaining <= 7 ? "text-red-500" : ""
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {notebook.daysRemaining} days remaining
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => restoreNotebook(notebook._id)}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => permanentlyDelete(notebook._id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
