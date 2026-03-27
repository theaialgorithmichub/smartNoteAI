import { NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import NotebookTemplateSetting from "@/lib/models/notebook-template-setting"
import { BUILTIN_NOTEBOOK_TEMPLATE_IDS } from "@/config/builtin-notebook-template-ids"

export async function GET() {
  try {
    await connectDB()

    const settings = await NotebookTemplateSetting.find({
      templateId: { $in: BUILTIN_NOTEBOOK_TEMPLATE_IDS as unknown as string[] },
    }).lean()

    const map = new Map<string, boolean>()
    for (const s of settings) {
      map.set(s.templateId, s.isEnabled)
    }

    const enabledTemplateIds = BUILTIN_NOTEBOOK_TEMPLATE_IDS.filter((id) => {
      return map.get(id) ?? true
    })

    return NextResponse.json({ enabledTemplateIds })
  } catch (err) {
    console.error("Failed to get enabled notebook templates:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

