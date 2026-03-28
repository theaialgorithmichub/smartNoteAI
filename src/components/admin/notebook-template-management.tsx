"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BUILTIN_NOTEBOOK_TEMPLATES } from "@/components/bookshelf/builtin-notebook-templates"

type TemplateSettingItem = {
  templateId: string
  isEnabled: boolean
}

export function NotebookTemplateManagement() {
  const [items, setItems] = useState<TemplateSettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/notebook-templates")
        if (!res.ok) throw new Error("Failed to load template settings")
        const data = await res.json()
        setItems(Array.isArray(data?.items) ? data.items : [])
      } catch (err) {
        console.error("Failed to load notebook template settings:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusMap = new Map(items.map((i) => [i.templateId, i.isEnabled]))

  const toggle = async (templateId: string, current: boolean) => {
    try {
      setTogglingId(templateId)
      const res = await fetch(`/api/admin/notebook-templates/${templateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !current }),
      })
      if (!res.ok) throw new Error("Failed to toggle template")
      const data = await res.json()
      setItems((prev) =>
        prev.map((t) =>
          t.templateId === templateId
            ? { templateId, isEnabled: data.isEnabled }
            : t
        )
      )
    } catch (err) {
      console.error("Toggle failed:", err)
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notebook Templates</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Enable or disable templates for the Create Notebook dialog.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {BUILTIN_NOTEBOOK_TEMPLATES.map((t) => {
          const enabled = statusMap.get(t.id) ?? true
          const Icon = t.icon
          return (
            <Card
              key={t.id}
              className="relative overflow-hidden bg-white/5 border border-neutral-800/60 backdrop-blur-xl p-5"
            >
              <div
                className="h-24 w-full rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: `linear-gradient(135deg, rgba(139,92,246,0.35), transparent 70%)`,
                }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${t.color} shadow-lg shadow-purple-500/20`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      enabled
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                    }`}
                  >
                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => toggle(t.id, enabled)}
                    disabled={togglingId === t.id}
                    className="flex-1 bg-black/40 hover:bg-black/60 border border-neutral-700 text-neutral-200"
                  >
                    {togglingId === t.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : enabled ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

