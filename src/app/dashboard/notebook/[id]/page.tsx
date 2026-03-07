import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { NotebookCollabWrapper } from "@/components/notebook/notebook-collab-wrapper"
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

  const clerkUserData = await currentUser()
  const userName =
    clerkUserData?.fullName ||
    clerkUserData?.firstName ||
    clerkUserData?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Anonymous"

  const { id: notebookId } = await params
  const { page } = await searchParams
  const initialPage = page ? parseInt(page) : 1

  // Verify user has access to this notebook
  await connectDB()
  const dbUser = await User.findOne({ clerkId: userId })
  if (!dbUser) {
    redirect("/sign-in")
  }

  const notebook = await Notebook.findById(notebookId)
  if (!notebook) {
    notFound()
  }

  // Check if user owns the notebook or it's shared with them
  const isOwner = notebook.userId === userId
  const isSharedWithUser = notebook.sharedWith?.some((id: any) => id.toString() === dbUser._id.toString())
  const isPublic = notebook.isPublic

  if (!isOwner && !isSharedWithUser && !isPublic) {
    redirect("/dashboard")
  }

  return (
    <div className="fixed inset-0 z-50 bg-amber-50 dark:bg-neutral-950">
      <NotebookCollabWrapper
        notebookId={notebookId}
        userId={userId}
        userName={userName}
        initialPage={initialPage}
      />
    </div>
  )
}
