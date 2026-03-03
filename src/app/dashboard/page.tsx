import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { EnhancedBookshelf } from "@/components/bookshelf/enhanced-bookshelf"
import { DashboardSearch } from "@/components/bookshelf/dashboard-search"
import NotebookDock from "@/components/ui/minimal-dock"
import connectDB from "@/lib/db/mongodb"
import { Notebook } from "@/lib/models/notebook"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Fetch user's latest 5 notebooks for the dock
  await connectDB()
  const recentNotebooks = await Notebook.find({ userId, isTrashed: false })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('_id title template color')
    .lean()

  // Convert MongoDB documents to plain objects
  const notebooks = recentNotebooks.map((notebook: any) => ({
    _id: notebook._id.toString(),
    title: notebook.title,
    template: notebook.template,
    color: notebook.color,
  }))

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 sm:pb-32">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">My Bookshelf</h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Your digital notebooks, organized beautifully</p>
        </div>
        <DashboardSearch />
      </div>

      {/* Enhanced Bookshelf with Sharing Features */}
      <EnhancedBookshelf userId={userId} />

      {/* Notebook Dock - Fixed at bottom, hidden on mobile */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <NotebookDock notebooks={notebooks} />
      </div>
    </div>
  )
}
