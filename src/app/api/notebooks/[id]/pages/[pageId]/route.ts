import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notebook, Page } from "@/lib/models"

// GET /api/notebooks/[id]/pages/[pageId] - Get single page
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; pageId: string } }
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

    const page = await Page.findOne({
      _id: params.pageId,
      notebookId: params.id,
    }).lean()

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error("Failed to fetch page:", error)
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    )
  }
}

// PATCH /api/notebooks/[id]/pages/[pageId] - Update page
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; pageId: string } }
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
    const { title, content, chapterId, tags, attachments } = body

    const updateData: any = { updatedAt: new Date() }
    if (title !== undefined) updateData.title = title
    if (content !== undefined) {
      updateData.content = content
      // Only strip HTML if content looks like HTML (not JSON)
      if (typeof content === 'string' && !content.trim().startsWith('[') && !content.trim().startsWith('{')) {
        updateData.contentPlainText = stripHtml(content)
      } else {
        updateData.contentPlainText = content
      }
    }
    if (chapterId !== undefined) updateData.chapterId = chapterId
    if (tags !== undefined) updateData.tags = tags
    if (attachments !== undefined) updateData.attachments = attachments

    const page = await Page.findOneAndUpdate(
      { _id: params.pageId, notebookId: params.id },
      { $set: updateData },
      { new: true }
    ).lean()

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Update notebook's updatedAt
    await Notebook.findByIdAndUpdate(params.id, { updatedAt: new Date() })

    return NextResponse.json({ page })
  } catch (error) {
    console.error("Failed to update page:", error)
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    )
  }
}

// DELETE /api/notebooks/[id]/pages/[pageId] - Delete page
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; pageId: string } }
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

    const page = await Page.findOneAndDelete({
      _id: params.pageId,
      notebookId: params.id,
    })

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Renumber remaining pages
    await Page.updateMany(
      { notebookId: params.id, pageNumber: { $gt: page.pageNumber } },
      { $inc: { pageNumber: -1 } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete page:", error)
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    )
  }
}

// Helper to strip HTML for plain text search
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}
