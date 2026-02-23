import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { SearchResults } from "@/components/search/search-results"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const query = searchParams.q || ""

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
          Search Results
        </h1>
        {query && (
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Results for: <span className="font-semibold text-neutral-900 dark:text-white">"{query}"</span>
          </p>
        )}
      </div>

      {/* Search Results */}
      <Suspense fallback={<div className="text-neutral-500">Searching...</div>}>
        <SearchResults query={query} userId={userId} />
      </Suspense>
    </div>
  )
}
