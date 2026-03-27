import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/middleware/adminAuth"
import { NotebookTemplateManagement } from "@/components/admin/notebook-template-management"

export default async function AdminNotebooksPage() {
  const { userId } = await auth()

  if (!userId) redirect("/sign-in")

  const isAdmin = await checkIsAdmin(userId)
  if (!isAdmin) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Notebooks
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage which templates are available for Create Notebook.
          </p>
        </div>

        <NotebookTemplateManagement />
      </div>
    </div>
  )
}

