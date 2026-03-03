import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { Notebook, Page } from "@/lib/models"

// GET /api/notebooks - List all notebooks for user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const filter = searchParams.get("filter") || "all"
    const search = searchParams.get("search")

    const query: any = { userId, isTrashed: false }
    
    // Add category filter
    if (filter !== "all") {
      query.category = filter
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    const notebooks = await Notebook.find(query)
      .sort({ updatedAt: -1 })
      .lean()

    // Get page counts for each notebook
    const notebooksWithCounts = await Promise.all(
      notebooks.map(async (notebook) => {
        const pageCount = await Page.countDocuments({ notebookId: notebook._id })
        return {
          ...notebook,
          pageCount,
        }
      })
    )

    return NextResponse.json({ notebooks: notebooksWithCounts })
  } catch (error) {
    console.error("Failed to fetch notebooks:", error)
    return NextResponse.json(
      { error: "Failed to fetch notebooks" },
      { status: 500 }
    )
  }
}

// POST /api/notebooks - Create new notebook
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { title, category, appearance, template } = body

    const notebook = await Notebook.create({
      userId,
      title: title || "Untitled Notebook",
      category: category || "Personal",
      template: template || "simple",
      appearance: {
        themeColor: appearance?.themeColor || "#8B4513",
        pageColor: appearance?.pageColor || "#fffbeb",
        paperPattern: appearance?.paperPattern || "lined",
        fontStyle: appearance?.fontStyle || "sans",
        coverImageUrl: appearance?.coverImageUrl,
      },
      tags: [],
      isTrashed: false,
    })

    // Create first page automatically
    await Page.create({
      notebookId: notebook._id,
      pageNumber: 1,
      title: "",
      content: "",
      contentPlainText: "",
      tags: [],
      attachments: [],
    })

    return NextResponse.json({ notebook }, { status: 201 })
  } catch (error) {
    console.error("Failed to create notebook:", error)
    return NextResponse.json(
      { error: "Failed to create notebook" },
      { status: 500 }
    )
  }
}
