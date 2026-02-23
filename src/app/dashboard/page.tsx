import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Bookshelf } from "@/components/bookshelf/bookshelf"
import { DashboardSearch } from "@/components/bookshelf/dashboard-search"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-8">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">My Bookshelf</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Your digital notebooks, organized beautifully</p>
        </div>
        <DashboardSearch />
      </div>

      {/* Bookshelf */}
      <Bookshelf userId={userId} />
    </div>
  )
}
