"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, Clock, BookOpen, AlertCircle, Share2, Users, X, ImageIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { EditCoverDialog } from "./edit-cover-dialog"
import { GlareCard } from "@/components/ui/glare-card"
import { ShareNotebookModal } from "@/components/sharing/ShareNotebookModal"
import { useShareNotebook, useFriends } from "@/hooks/useSharing"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NotebookCardProps {
  notebook: {
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
    isPublic?: boolean
    sharedWith?: any[]
  }
  onUpdate: () => void
}

export function NotebookCard({ notebook, onUpdate }: NotebookCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEditCoverDialog, setShowEditCoverDialog] = useState(false)
  
  const { shareNotebook } = useShareNotebook()
  const { friends } = useFriends()

  const handleRevoke = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Remove all sharing for this notebook?')) return
    
    try {
      await fetch(`/api/notebooks/${notebook._id}/unshare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: [] })
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to revoke sharing:', error)
    }
  }

  const sharedCount = notebook.sharedWith?.length || 0
  const isShared = notebook.isPublic || sharedCount > 0

  const handleOpen = () => {
    router.push(`/dashboard/notebook/${notebook._id}`)
  }

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await fetch(`/api/notebooks/${notebook._id}`, {
        method: "DELETE",
      })
      onUpdate()
    } catch (error) {
      console.error("Failed to delete notebook:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const categoryColors: Record<string, string> = {
    Personal: "from-amber-500 to-orange-600",
    Work: "from-blue-500 to-indigo-600",
    School: "from-green-500 to-emerald-600",
    Research: "from-purple-500 to-violet-600",
  }

  return (
    <div className="relative group">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Share button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowShareModal(true);
          }}
          className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-blue-500 transition-all"
          title="Share notebook"
        >
          <Share2 className="h-4 w-4 text-white" />
        </button>

        {/* Edit cover button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEditCoverDialog(true);
          }}
          className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-amber-500 transition-all"
          title="Edit notebook cover"
        >
          <ImageIcon className="h-4 w-4 text-white" />
        </button>

        {/* Delete button with AlertDialog confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <button
              disabled={isDeleting}
              className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-red-500 transition-all disabled:opacity-50"
              title="Delete notebook"
            >
              {isDeleting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-white" />
              )}
            </button>
          </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-red-50 dark:bg-red-900/20"
              aria-hidden="true"
            >
              <AlertCircle className="text-red-500" size={16} strokeWidth={2} />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Notebook?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{notebook.title}&quot;? This action cannot be undone and all your notes will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Share Notebook Modal */}
      <ShareNotebookModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        notebookId={notebook._id}
        notebookTitle={notebook.title}
        currentSharing={{
          isPublic: false,
          sharedWith: []
        }}
        friends={friends}
        onShare={async (shareData) => {
          await shareNotebook(notebook._id, shareData);
          setShowShareModal(false);
          onUpdate();
        }}
      />

      <EditCoverDialog
        open={showEditCoverDialog}
        onOpenChange={setShowEditCoverDialog}
        notebook={{
          _id: notebook._id,
          title: notebook.title,
          appearance: notebook.appearance,
        }}
        onSaved={onUpdate}
      />

      <div onClick={handleOpen} className="cursor-pointer">
        <GlareCard className="relative">
          {/* Background with cover image or theme color */}
          {notebook.appearance.coverImageUrl ? (
            <Image
              src={notebook.appearance.coverImageUrl}
              alt={notebook.title}
              fill
              className="object-cover"
            />
          ) : (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${notebook.appearance.themeColor} 0%, ${notebook.appearance.themeColor}cc 100%)`,
              }}
            />
          )}
          
          {/* Book spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/30" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
          
          {/* Content */}
          <div className="relative h-full p-4 flex flex-col justify-between">
            {/* Top section */}
            <div className="flex items-start">
              {/* Category badge */}
              <span className={`px-2 py-1 rounded-md text-[10px] font-medium bg-gradient-to-r ${categoryColors[notebook.category] || "from-gray-500 to-gray-600"} text-white shadow-lg`}>
                {notebook.category}
              </span>
            </div>

            {/* Bottom section */}
            <div className="space-y-2">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              
              {/* Title */}
              <h3 className="text-white font-bold text-sm line-clamp-2 drop-shadow-lg">
                {notebook.title}
              </h3>
              
              {/* Meta info */}
              <div className="flex items-center justify-between text-white/70 text-xs">
                <span>{notebook.pageCount} pages</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(notebook.updatedAt)}</span>
                </div>
              </div>
              
              {/* Sharing info */}
              {isShared && (
                <div 
                  className="mt-2 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1 text-white/90 text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded">
                    {notebook.isPublic ? (
                      <>
                        <Share2 className="h-3 w-3" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Users className="h-3 w-3" />
                        <span>Shared with {sharedCount} friend{sharedCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleRevoke}
                    className="p-1 bg-red-500/80 hover:bg-red-500 rounded text-white transition-colors z-10"
                    title="Revoke all sharing"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </GlareCard>
      </div>
    </div>
  )
}
