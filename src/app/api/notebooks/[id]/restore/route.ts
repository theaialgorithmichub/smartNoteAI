import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { Notebook } from "@/lib/models"

// POST /api/notebooks/[id]/restore - Restore notebook from trash
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const notebook = await Notebook.findOneAndUpdate(
      { _id: params.id, userId, isTrashed: true },
      {
        $set: { isTrashed: false },
        $unset: { trashedAt: 1 },
      },
      { new: true }
    ).lean()

    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    return NextResponse.json({ notebook })
  } catch (error) {
    console.error("Failed to restore notebook:", error)
    return NextResponse.json(
      { error: "Failed to restore notebook" },
      { status: 500 }
    )
  }
}
