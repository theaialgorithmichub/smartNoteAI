import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notebook, Chapter } from "@/lib/models"

// GET /api/notebooks/[id]/chapters - Get all chapters for notebook
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Verify notebook ownership
    const notebook = await Notebook.findOne({ _id: params.id, userId })
    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    const chapters = await Chapter.find({ notebookId: params.id })
      .sort({ orderIndex: 1 })
      .lean()

    return NextResponse.json({ chapters })
  } catch (error) {
    console.error("Failed to fetch chapters:", error)
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    )
  }
}

// POST /api/notebooks/[id]/chapters - Create new chapter
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Verify notebook ownership
    const notebook = await Notebook.findOne({ _id: params.id, userId })
    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, color } = body

    // Get next order index
    const lastChapter = await Chapter.findOne({ notebookId: params.id })
      .sort({ orderIndex: -1 })
      .lean()
    const orderIndex = (lastChapter?.orderIndex || 0) + 1

    const chapter = await Chapter.create({
      notebookId: params.id,
      title: title || "New Chapter",
      orderIndex,
      color: color || "#3B82F6",
    })

    return NextResponse.json({ chapter }, { status: 201 })
  } catch (error) {
    console.error("Failed to create chapter:", error)
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    )
  }
}
