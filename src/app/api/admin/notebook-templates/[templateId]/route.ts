import { NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import { requireAdmin } from "@/lib/middleware/adminAuth"
import NotebookTemplateSetting from "@/lib/models/notebook-template-setting"
import { BUILTIN_NOTEBOOK_TEMPLATE_IDS } from "@/config/builtin-notebook-template-ids"

export async function POST(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  const { error } = await requireAdmin()
  if (error) {
    return NextResponse.json({ error }, { status: 403 })
  }

  const { templateId } = params
  if (!BUILTIN_NOTEBOOK_TEMPLATE_IDS.includes(templateId as any)) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const { isEnabled } = body as { isEnabled?: boolean }
  if (typeof isEnabled !== "boolean") {
    return NextResponse.json({ error: "Missing isEnabled" }, { status: 400 })
  }

  try {
    await connectDB()
    const raw = await NotebookTemplateSetting.findOneAndUpdate(
      { templateId },
      {
        $set: {
          isEnabled,
          enabledAt: isEnabled ? new Date() : null,
          disabledAt: !isEnabled ? new Date() : null,
        },
      },
      { upsert: true, new: true }
    ).lean()

    // Mongoose lean() typings can include an array branch; normalize to a single doc.
    const doc = (Array.isArray(raw) ? raw[0] : raw) as { isEnabled?: boolean } | null | undefined

    return NextResponse.json({
      templateId,
      isEnabled: doc?.isEnabled ?? isEnabled,
    })
  } catch (err) {
    console.error("Failed to update notebook template setting:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

