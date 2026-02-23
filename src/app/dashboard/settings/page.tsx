import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserProfile } from "@clerk/nextjs"

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900">Settings</h1>
        <p className="text-amber-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0",
            },
          }}
        />
      </div>
    </div>
  )
}
