import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { Notebook, Page } from "@/lib/models"

// GET /api/notebooks/[id]/pages - Get all pages for notebook
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Verify notebook ownership
    const notebook = await Notebook.findOne({ _id: params.id, userId })
    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    const pages = await Page.find({ notebookId: params.id })
      .sort({ pageNumber: 1 })
      .lean()

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Failed to fetch pages:", error)
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    )
  }
}

// POST /api/notebooks/[id]/pages - Create new page
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

    // Verify notebook ownership
    const notebook = await Notebook.findOne({ _id: params.id, userId })
    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    const body = await req.json()
    const { pageNumber, title, content, chapterId } = body

    // Get next page number if not provided
    let newPageNumber = pageNumber
    if (!newPageNumber) {
      const lastPage = await Page.findOne({ notebookId: params.id })
        .sort({ pageNumber: -1 })
        .lean()
      newPageNumber = (lastPage?.pageNumber || 0) + 1
    }

    const page = await Page.create({
      notebookId: params.id,
      chapterId,
      pageNumber: newPageNumber,
      title: title || "",
      content: content || "",
      contentPlainText: stripHtml(content || ""),
      tags: [],
      attachments: [],
    })

    // Update notebook's updatedAt
    await Notebook.findByIdAndUpdate(params.id, { updatedAt: new Date() })

    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    console.error("Failed to create page:", error)
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    )
  }
}

// Helper to strip HTML for plain text search
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}
