import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { Notebook, Page, Chapter } from "@/lib/models"

// DELETE /api/notebooks/clear-all - Delete all notebooks for current user
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Find all notebooks for this user
    const notebooks = await Notebook.find({ userId }).select('_id')
    const notebookIds = notebooks.map(nb => nb._id)

    if (notebookIds.length === 0) {
      return NextResponse.json({ 
        message: "No notebooks to delete",
        deletedCount: 0 
      })
    }

    // Delete all pages associated with these notebooks
    await Page.deleteMany({ notebookId: { $in: notebookIds } })

    // Delete all chapters associated with these notebooks
    await Chapter.deleteMany({ notebookId: { $in: notebookIds } })

    // Delete all notebooks
    const result = await Notebook.deleteMany({ userId })

    return NextResponse.json({ 
      message: "All notebooks deleted successfully",
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error("[CLEAR ALL NOTEBOOKS] Error:", error)
    return NextResponse.json(
      { error: "Failed to delete notebooks" },
      { status: 500 }
    )
  }
}
