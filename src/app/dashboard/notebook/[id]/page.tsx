import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { NotebookViewer } from "@/components/notebook/notebook-viewer"
import connectDB from "@/lib/db/mongodb"
import { Notebook } from "@/lib/models/notebook"
import User from "@/lib/models/User"

interface NotebookPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function NotebookPage({ params, searchParams }: NotebookPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const { id: notebookId } = await params
  const { page } = await searchParams
  const initialPage = page ? parseInt(page) : 1

  // Verify user has access to this notebook
  await connectDB()
  const currentUser = await User.findOne({ clerkId: userId })
  if (!currentUser) {
    redirect("/sign-in")
  }

  const notebook = await Notebook.findById(notebookId)
  if (!notebook) {
    notFound()
  }

  // Check if user owns the notebook or it's shared with them
  const isOwner = notebook.userId === userId
  const isSharedWithUser = notebook.sharedWith?.some((id: any) => id.toString() === currentUser._id.toString())
  const isPublic = notebook.isPublic

  if (!isOwner && !isSharedWithUser && !isPublic) {
    redirect("/dashboard")
  }

  return (
    <div className="fixed inset-0 z-50 bg-amber-50 dark:bg-neutral-950">
      <NotebookViewer 
        notebookId={notebookId} 
        userId={userId}
        initialPage={initialPage}
      />
    </div>
  )
}
