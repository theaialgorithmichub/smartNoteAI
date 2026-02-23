"use client"

export function NotebookSkeleton() {
  return (
    <div className="aspect-square rounded-2xl overflow-hidden">
      <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    </div>
  )
}
