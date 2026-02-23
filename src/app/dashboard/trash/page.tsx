import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TrashList } from "@/components/trash/trash-list"

export default async function TrashPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900">Trash</h1>
        <p className="text-amber-600 mt-1">
          Deleted notebooks are kept for 30 days before permanent deletion
        </p>
      </div>

      <TrashList userId={userId} />
    </div>
  )
}
