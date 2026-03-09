"use client";

import { UnifiedHeader } from "@/components/layout/unified-header";

/** Landing / public header: not-logged-in layout with Image 2 icons, fixed at top */
export function Navbar() {
  return <UnifiedHeader forceLoggedOut fixed />;
}
