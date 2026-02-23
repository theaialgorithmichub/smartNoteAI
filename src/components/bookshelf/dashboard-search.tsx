"use client"

import { useRouter } from "next/navigation"
import { SearchBar } from "@/components/ui/search-bar"

export function DashboardSearch() {
  const router = useRouter()

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <SearchBar 
      placeholder="Search notebooks..." 
      onSearch={handleSearch}
    />
  )
}
