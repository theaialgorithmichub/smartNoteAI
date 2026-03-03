import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { Notebook, Page, Chapter } from "@/lib/models"

// DELETE /api/notebooks/[id]/permanent - Permanently delete notebook
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Verify ownership and that it's in trash
    const notebook = await Notebook.findOne({
      _id: params.id,
      userId,
      isTrashed: true,
    })

    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    // Delete all related data
    await Promise.all([
      Page.deleteMany({ notebookId: params.id }),
      Chapter.deleteMany({ notebookId: params.id }),
      Notebook.findByIdAndDelete(params.id),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to permanently delete notebook:", error)
    return NextResponse.json(
      { error: "Failed to delete notebook" },
      { status: 500 }
    )
  }
}
