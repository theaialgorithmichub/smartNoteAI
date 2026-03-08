import { UnifiedHeader } from "@/components/layout/unified-header"

interface AppHeaderProps {
  homeHref?: string
  /** Optional extra actions (e.g. AI, Share, Chat) shown before nav links when inside a notebook */
  extraRight?: React.ReactNode
}

export function AppHeader({ homeHref = "/dashboard", extraRight }: AppHeaderProps) {
  return (
    <UnifiedHeader
      homeHref={homeHref}
      extraRight={extraRight}
      forceLoggedIn
    />
  )
}
