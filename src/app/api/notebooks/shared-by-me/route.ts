import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { Notebook } from "@/lib/models"
import User from "@/lib/models/User"

// GET /api/notebooks/shared-by-me - Get notebooks shared by current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Find current user
    const currentUser = await User.findOne({ clerkId: userId })
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find notebooks owned by current user that have been shared
    const notebooks = await Notebook.find({
      userId,
      sharedWith: { $exists: true, $ne: [] },
      isTrashed: false
    })
    .sort({ updatedAt: -1 })
    .lean()

    // Get all unique user IDs from sharedWith arrays
    const sharedUserIds = new Set<string>()
    notebooks.forEach(notebook => {
      notebook.sharedWith?.forEach((id: any) => {
        sharedUserIds.add(id.toString())
      })
    })

    // Fetch user details for all shared users
    const sharedUsers = await User.find({
      _id: { $in: Array.from(sharedUserIds) }
    }).select('_id clerkId email username').lean()

    // Create a map of user ID to user details
    const userMap = new Map()
    sharedUsers.forEach((user: any) => {
      userMap.set(user._id.toString(), {
        id: user._id.toString(),
        email: user.email,
        name: user.email.split('@')[0] // Use email prefix as name
      })
    })

    // Transform notebooks to include shared user details
    const notebooksWithSharedUsers = notebooks.map(notebook => ({
      _id: notebook._id.toString(),
      title: notebook.title,
      template: notebook.template,
      appearance: notebook.appearance,
      updatedAt: notebook.updatedAt,
      sharedWith: notebook.sharedWith?.map((userId: any) => 
        userMap.get(userId.toString())
      ).filter(Boolean) || []
    }))

    return NextResponse.json({ notebooks: notebooksWithSharedUsers })
  } catch (error) {
    console.error("[SHARED BY ME] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch shared notebooks" },
      { status: 500 }
    )
  }
}
