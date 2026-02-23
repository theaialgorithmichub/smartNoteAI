"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X, ImageIcon, BookOpen, Users, FileText, LayoutDashboard, Code, Calendar, Brain, Check, CalendarDays, PenTool, Blocks, Pencil, FolderKanban, LayoutGrid, BookText, GraduationCap, Layers, PenLine, ChefHat, Wallet, Plane, CheckSquare, Film, Workflow, Video, Link, Type } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

interface CreateNotebookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

const templates = [
  { id: "simple", name: "Simple Notebook", icon: BookOpen, color: "from-amber-500 to-orange-500" },
  { id: "meeting-notes", name: "Meeting Notes", icon: Users, color: "from-emerald-500 to-teal-500" },
  { id: "document", name: "Document", icon: FileText, color: "from-blue-500 to-cyan-500" },
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, color: "from-purple-500 to-pink-500" },
  { id: "code-notebook", name: "Code Notebook", icon: Code, color: "from-slate-600 to-slate-800" },
  { id: "planner", name: "Planner", icon: Calendar, color: "from-orange-500 to-red-500" },
  { id: "ai-research", name: "AI Research", icon: Brain, color: "from-rose-500 to-pink-500" },
  { id: "diary", name: "Diary", icon: CalendarDays, color: "from-pink-500 to-rose-500" },
  { id: "journal", name: "Journal", icon: PenTool, color: "from-stone-500 to-stone-700" },
  { id: "custom", name: "Custom Page", icon: Blocks, color: "from-indigo-500 to-violet-500" },
  { id: "doodle", name: "Doodle Pad", icon: Pencil, color: "from-cyan-500 to-blue-500" },
  { id: "project", name: "Project Hub", icon: FolderKanban, color: "from-indigo-500 to-purple-600" },
  { id: "loop", name: "Loop Workspace", icon: LayoutGrid, color: "from-purple-500 to-pink-500" },
  { id: "story", name: "Story Workshop", icon: BookText, color: "from-amber-500 to-orange-600" },
  { id: "storytelling", name: "Storytelling Studio", icon: Film, color: "from-purple-500 via-pink-500 to-orange-500" },
  { id: "typewriter", name: "TypeWriter", icon: Type, color: "from-blue-500 via-purple-500 to-pink-600" },
  { id: "n8n", name: "n8n Workflows", icon: Workflow, color: "from-blue-500 via-indigo-500 to-purple-600" },
  { id: "image-prompt", name: "Image Prompts", icon: ImageIcon, color: "from-pink-500 via-purple-500 to-indigo-600" },
  { id: "video-prompt", name: "Video Prompts", icon: Video, color: "from-blue-500 via-cyan-500 to-teal-600" },
  { id: "link", name: "Link Manager", icon: Link, color: "from-indigo-500 via-purple-500 to-pink-600" },
  { id: "studybook", name: "Study Book", icon: GraduationCap, color: "from-blue-500 to-indigo-600" },
  { id: "flashcard", name: "Flashcards", icon: Layers, color: "from-violet-500 to-purple-600" },
  { id: "whiteboard", name: "Whiteboard", icon: PenLine, color: "from-sky-500 to-blue-600" },
  { id: "recipe", name: "Recipe Book", icon: ChefHat, color: "from-orange-500 to-red-600" },
  { id: "expense", name: "Expense Manager", icon: Wallet, color: "from-emerald-500 to-teal-600" },
  { id: "trip", name: "Trip Planner", icon: Plane, color: "from-sky-500 to-blue-600" },
  { id: "todo", name: "Advanced To-Do", icon: CheckSquare, color: "from-indigo-500 to-purple-600" },
]

const themeColors = [
  { name: "Leather Brown", value: "#8B4513" },
  { name: "Navy Blue", value: "#1e3a5f" },
  { name: "Forest Green", value: "#2d5a3d" },
  { name: "Burgundy", value: "#722f37" },
  { name: "Charcoal", value: "#36454f" },
  { name: "Pastel Pink", value: "#f8b4c4" },
  { name: "Pastel Blue", value: "#a8d8ea" },
  { name: "Pastel Green", value: "#b8e0d2" },
]

const categories = ["Personal", "Work", "School", "Research"]

const paperPatterns = [
  { name: "Lined", value: "lined" },
  { name: "Grid", value: "grid" },
  { name: "Dotted", value: "dotted" },
  { name: "Blank", value: "blank" },
]

const pageColors = [
  { name: "Cream", value: "#fffbeb", isDark: false },
  { name: "White", value: "#ffffff", isDark: false },
  { name: "Light Yellow", value: "#fef9c3", isDark: false },
  { name: "Light Green", value: "#dcfce7", isDark: false },
  { name: "Light Blue", value: "#dbeafe", isDark: false },
  { name: "Light Pink", value: "#fce7f3", isDark: false },
  { name: "Light Purple", value: "#f3e8ff", isDark: false },
  { name: "Light Gray", value: "#f3f4f6", isDark: false },
  { name: "Dark Gray", value: "#1f2937", isDark: true },
  { name: "Dark Blue", value: "#1e3a5f", isDark: true },
  { name: "Dark Green", value: "#14532d", isDark: true },
  { name: "Dark Purple", value: "#3b0764", isDark: true },
  { name: "Black", value: "#0a0a0a", isDark: true },
]

const isDarkColor = (color: string): boolean => {
  const pageColor = pageColors.find(c => c.value === color)
  return pageColor?.isDark ?? false
}

export function CreateNotebookDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateNotebookDialogProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Personal")
  const [themeColor, setThemeColor] = useState("#8B4513")
  const [pageColor, setPageColor] = useState("#fffbeb")
  const [paperPattern, setPaperPattern] = useState("lined")
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("simple")

  const handleCreate = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          template: selectedTemplate,
          appearance: {
            coverImageUrl: coverImageUrl || undefined,
            themeColor,
            pageColor,
            paperPattern,
            fontStyle: "sans",
          },
        }),
      })

      const data = await res.json()
      
      if (data.notebook) {
        onCreated()
        onOpenChange(false)
        resetForm()
        router.push(`/dashboard/notebook/${data.notebook._id}`)
      }
    } catch (error) {
      console.error("Failed to create notebook:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setCategory("Personal")
    setThemeColor("#8B4513")
    setPageColor("#fffbeb")
    setPaperPattern("lined")
    setCoverImageUrl(null)
    setSelectedTemplate("simple")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        setCoverImageUrl(data.url)
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
    } finally {
      setUploadingImage(false)
    }
  }

  const removeCoverImage = () => {
    setCoverImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Notebook</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">
              Choose Template
            </label>
            <div className="grid grid-cols-4 gap-2">
              {templates.map((template) => {
                const Icon = template.icon
                return (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedTemplate === template.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50"
                    }`}
                  >
                    {selectedTemplate === template.id && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-neutral-300 text-center leading-tight">{template.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">
              Notebook Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Notebook"
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    category === cat
                      ? "bg-amber-700 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">
              Cover Image (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {coverImageUrl ? (
              <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-amber-500">
                <Image
                  src={coverImageUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={removeCoverImage}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-amber-600"
              >
                {uploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm">Click to upload cover image</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Cover Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">
              Cover Color {coverImageUrl && <span className="text-xs text-neutral-400">(used as fallback)</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {themeColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setThemeColor(color.value)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    themeColor === color.value
                      ? "ring-2 ring-offset-2 ring-amber-500 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Paper Pattern */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">
              Paper Style
            </label>
            <div className="flex flex-wrap gap-2">
              {paperPatterns.map((pattern) => (
                <button
                  key={pattern.value}
                  onClick={() => setPaperPattern(pattern.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    paperPattern === pattern.value
                      ? "bg-amber-700 text-white"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {pattern.name}
                </button>
              ))}
            </div>
          </div>

          {/* Page Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">
              Page Color
            </label>
            <div className="flex flex-wrap gap-2">
              {pageColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setPageColor(color.value)}
                  className={`w-8 h-8 rounded-lg transition-transform border ${
                    pageColor === color.value
                      ? "ring-2 ring-offset-2 ring-offset-neutral-900 ring-amber-500 scale-110"
                      : "hover:scale-105 border-neutral-600"
                  } ${color.isDark ? 'border-neutral-500' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            {isDarkColor(pageColor) && (
              <p className="text-xs text-amber-400 mt-1">
                ✓ Dark page selected - text will automatically use light colors for readability
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">Preview</label>
            <div
              className="w-28 h-28 rounded-lg shadow-lg mx-auto relative overflow-hidden"
              style={{ backgroundColor: themeColor }}
            >
              {coverImageUrl && (
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-2">
                <p className="text-white text-xs font-medium truncate">
                  {title || "My Notebook"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !title.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Notebook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
