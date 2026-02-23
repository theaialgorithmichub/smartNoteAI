import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notebook } from "@/lib/models"

// GET /api/notebooks/trash - Get trashed notebooks
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const notebooks = await Notebook.find({
      userId,
      isTrashed: true,
    })
      .sort({ trashedAt: -1 })
      .lean()

    // Calculate days remaining for each notebook
    const now = new Date()
    const notebooksWithDays = notebooks.map((notebook) => {
      const trashedAt = new Date(notebook.trashedAt || now)
      const deleteAt = new Date(trashedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      const daysRemaining = Math.max(
        0,
        Math.ceil((deleteAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      )
      return {
        ...notebook,
        daysRemaining,
      }
    })

    return NextResponse.json({ notebooks: notebooksWithDays })
  } catch (error) {
    console.error("Failed to fetch trashed notebooks:", error)
    return NextResponse.json(
      { error: "Failed to fetch trashed notebooks" },
      { status: 500 }
    )
  }
}
