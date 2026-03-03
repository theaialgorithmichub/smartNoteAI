import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { Notebook, Page, Chapter } from "@/lib/models"

// GET /api/notebooks/[id] - Get single notebook
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

    const notebook = await Notebook.findOne({
      _id: params.id,
      userId,
    }).lean()

    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    return NextResponse.json({ notebook })
  } catch (error) {
    console.error("Failed to fetch notebook:", error)
    return NextResponse.json(
      { error: "Failed to fetch notebook" },
      { status: 500 }
    )
  }
}

// PATCH /api/notebooks/[id] - Update notebook
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { title, category, appearance, tags } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (appearance !== undefined) updateData.appearance = appearance
    if (tags !== undefined) updateData.tags = tags

    const notebook = await Notebook.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: updateData },
      { new: true }
    ).lean()

    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    return NextResponse.json({ notebook })
  } catch (error) {
    console.error("Failed to update notebook:", error)
    return NextResponse.json(
      { error: "Failed to update notebook" },
      { status: 500 }
    )
  }
}

// DELETE /api/notebooks/[id] - Move to trash (soft delete)
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

    const notebook = await Notebook.findOneAndUpdate(
      { _id: params.id, userId },
      { 
        $set: { 
          isTrashed: true, 
          trashedAt: new Date() 
        } 
      },
      { new: true }
    ).lean()

    if (!notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete notebook:", error)
    return NextResponse.json(
      { error: "Failed to delete notebook" },
      { status: 500 }
    )
  }
}
