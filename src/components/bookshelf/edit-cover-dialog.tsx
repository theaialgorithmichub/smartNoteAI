"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, X } from "lucide-react"

const themeColors = [
  { name: "Leather Brown", value: "#8B4513" },
  { name: "Navy Blue", value: "#1e3a5f" },
  { name: "Forest Green", value: "#2d5a3d" },
  { name: "Burgundy", value: "#722f37" },
  { name: "Charcoal", value: "#36454f" },
  { name: "Pastel Pink", value: "#f8b4c4" },
  { name: "Pastel Blue", value: "#a8d8ea" },
  { name: "Pastel Green", value: "#b8e0d2" },
  { name: "Deep Sea", value: "#01579B" },
  { name: "Purple Haze", value: "#7C3AED" },
  { name: "Sunset Orange", value: "#EA580C" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose Gold", value: "#BE185D" },
  { name: "Teal", value: "#0F766E" },
  { name: "Indigo", value: "#4338CA" },
  { name: "Amber", value: "#D97706" },
  { name: "Cyan", value: "#0891B2" },
  { name: "Violet", value: "#6D28D9" },
  { name: "Coral", value: "#F43F5E" },
]

interface EditCoverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notebook: {
    _id: string
    title: string
    appearance: {
      coverImageUrl?: string
      themeColor: string
      paperPattern: string
      fontStyle: string
      pageColor?: string
    }
  }
  onSaved: () => void
}

export function EditCoverDialog({
  open,
  onOpenChange,
  notebook,
  onSaved,
}: EditCoverDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(notebook.appearance.coverImageUrl ?? null)
  const [themeColor, setThemeColor] = useState(notebook.appearance.themeColor || "#8B4513")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setCoverImageUrl(notebook.appearance.coverImageUrl ?? null)
      setThemeColor(notebook.appearance.themeColor || "#8B4513")
    }
  }, [open, notebook.appearance.coverImageUrl, notebook.appearance.themeColor])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "cover")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        setCoverImageUrl(data.url)
      }
    } catch (error) {
      console.error("Failed to upload cover image:", error)
    } finally {
      setUploadingImage(false)
      e.target.value = ""
    }
  }

  const removeCoverImage = () => {
    setCoverImageUrl(null)
    fileInputRef.current?.value && (fileInputRef.current.value = "")
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/notebooks/${notebook._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: {
            ...notebook.appearance,
            coverImageUrl: coverImageUrl || undefined,
            themeColor,
          },
        }),
      })

      if (res.ok) {
        onSaved()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to update cover:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit notebook cover</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Cover image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cover image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {coverImageUrl ? (
              <div className="relative w-full aspect-[4/3] max-h-48 rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full h-24 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-amber-500 transition-colors flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-amber-600 disabled:opacity-50"
              >
                {uploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm">Upload cover image</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Theme color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Cover color {coverImageUrl && <span className="text-neutral-400 font-normal">(fallback)</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {themeColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setThemeColor(c.value)}
                  className={`w-8 h-8 rounded-lg transition-all border-2 ${
                    themeColor === c.value
                      ? "ring-2 ring-offset-2 ring-amber-500 border-amber-500 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
