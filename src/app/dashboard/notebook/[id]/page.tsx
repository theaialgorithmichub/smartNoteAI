import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { NotebookViewer } from "@/components/notebook/notebook-viewer"

interface NotebookPageProps {
  params: { id: string }
  searchParams: { page?: string }
}

export default async function NotebookPage({ params, searchParams }: NotebookPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const initialPage = searchParams.page ? parseInt(searchParams.page) : 1

  return (
    <div className="fixed inset-0 z-50 bg-amber-50 dark:bg-neutral-950">
      <NotebookViewer 
        notebookId={params.id} 
        userId={userId}
        initialPage={initialPage}
      />
    </div>
  )
}
