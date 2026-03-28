import { NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { requireAdmin } from "@/lib/middleware/adminAuth"
import NotebookTemplateSetting from "@/lib/models/notebook-template-setting"
import { BUILTIN_NOTEBOOK_TEMPLATE_IDS } from "@/config/builtin-notebook-template-ids"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) {
    return NextResponse.json({ error }, { status: 403 })
  }

  try {
    await connectDB()

    const settings = await NotebookTemplateSetting.find({
      templateId: { $in: BUILTIN_NOTEBOOK_TEMPLATE_IDS as unknown as string[] },
    }).lean()

    const map = new Map<string, boolean>()
    for (const s of settings) {
      map.set(s.templateId, s.isEnabled)
    }

    const items = BUILTIN_NOTEBOOK_TEMPLATE_IDS.map((id) => ({
      templateId: id,
      isEnabled: map.get(id) ?? true,
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error("Failed to fetch notebook template settings:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

