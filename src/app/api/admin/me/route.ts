import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { checkIsAdmin } from "@/lib/middleware/adminAuth"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  const isAdmin = await checkIsAdmin(userId)
  return NextResponse.json({ isAdmin })
}

