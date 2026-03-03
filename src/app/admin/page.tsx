import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/middleware/adminAuth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const { userId } = await auth();

  console.log('[ADMIN PAGE] Clerk userId:', userId);

  if (!userId) {
    console.log('[ADMIN PAGE] No userId, redirecting to sign-in');
    redirect("/sign-in");
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(userId);

  console.log('[ADMIN PAGE] isAdmin check result:', isAdmin);

  if (!isAdmin) {
    console.log('[ADMIN PAGE] User is not admin, redirecting to dashboard');
    redirect("/dashboard");
  }

  console.log('[ADMIN PAGE] User is admin, rendering dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage users, templates, and system settings
          </p>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}
