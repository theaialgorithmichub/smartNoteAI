"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardHeaderActions } from "@/components/layout/dashboard-header-actions";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNotebookPage =
    typeof pathname === "string" && pathname.includes("/notebook");

  // On notebook route: render ONLY the notebook page (no layout header). Notebook has its own header.
  if (isNotebookPage) {
    return (
      <div className="h-screen w-full overflow-hidden">
        {children}
      </div>
    );
  }

  // Dashboard/main: use header with AI, Share, Chat as buttons (no links to templates/dashboard)
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <AppHeader homeHref="/" extraRight={<DashboardHeaderActions />} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
