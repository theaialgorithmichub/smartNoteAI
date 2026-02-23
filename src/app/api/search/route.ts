import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Notebook, Page } from "@/lib/models"

// GET /api/search - Global search across all notebooks
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Get user's notebooks
    const notebooks = await Notebook.find({ userId, isTrashed: false }).lean()
    const notebookIds = notebooks.map((n) => n._id)
    const notebookMap = new Map(notebooks.map((n) => [n._id.toString(), n.title]))

    // Search pages using text index (fuzzy matching)
    const pages = await Page.find(
      {
        notebookId: { $in: notebookIds },
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean()

    // Format results
    const results = pages.map((page) => {
      // Extract snippet around the search term
      const plainText = page.contentPlainText || ""
      const lowerQuery = query.toLowerCase()
      const lowerText = plainText.toLowerCase()
      const index = lowerText.indexOf(lowerQuery)
      
      let snippet = ""
      if (index !== -1) {
        const start = Math.max(0, index - 50)
        const end = Math.min(plainText.length, index + query.length + 50)
        snippet = plainText.slice(start, end)
      } else {
        snippet = plainText.slice(0, 100)
      }

      return {
        _id: page._id,
        notebookId: page.notebookId,
        notebookTitle: notebookMap.get(page.notebookId.toString()) || "Unknown",
        pageNumber: page.pageNumber,
        title: page.title,
        snippet,
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search failed:", error)
    
    // Fallback to regex search if text index fails
    try {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { searchParams } = new URL(req.url)
      const query = searchParams.get("q") || ""

      const notebooks = await Notebook.find({ userId, isTrashed: false }).lean()
      const notebookIds = notebooks.map((n) => n._id)
      const notebookMap = new Map(notebooks.map((n) => [n._id.toString(), n.title]))

      // Regex fallback search
      const pages = await Page.find({
        notebookId: { $in: notebookIds },
        $or: [
          { title: { $regex: query, $options: "i" } },
          { contentPlainText: { $regex: query, $options: "i" } },
        ],
      })
        .limit(20)
        .lean()

      const results = pages.map((page) => ({
        _id: page._id,
        notebookId: page.notebookId,
        notebookTitle: notebookMap.get(page.notebookId.toString()) || "Unknown",
        pageNumber: page.pageNumber,
        title: page.title,
        snippet: (page.contentPlainText || "").slice(0, 100),
      }))

      return NextResponse.json({ results })
    } catch (fallbackError) {
      console.error("Fallback search failed:", fallbackError)
      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      )
    }
  }
}
