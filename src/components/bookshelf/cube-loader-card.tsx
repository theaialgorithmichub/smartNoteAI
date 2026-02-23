'use client'

import CubeLoader from "@/components/ui/cube-loader"

export function CubeLoaderCard() {
  return (
    <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      <CubeLoader />
    </div>
  )
}
