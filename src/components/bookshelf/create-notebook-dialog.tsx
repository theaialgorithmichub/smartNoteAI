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
import { Loader2, Upload, X, ImageIcon, BookOpen, Users, FileText, LayoutDashboard, Code, Calendar, Brain, Check, CalendarDays, PenTool, Blocks, Pencil, FolderKanban, LayoutGrid, BookText, GraduationCap, Layers, PenLine, ChefHat, Wallet, Plane, CheckSquare, Film, Workflow, Video, Link, Type, Mic, Target, Dumbbell, DollarSign, ShoppingCart, MessageSquare, Bell, Languages, Search, UtensilsCrossed, Trophy, StickyNote, Sparkles, GitBranch, Zap, Crown } from "lucide-react"
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
  { id: "sound-box", name: "Sound Box", icon: Mic, color: "from-indigo-500 to-purple-500" },
  { id: "book-notes", name: "Book Reading Notes", icon: BookOpen, color: "from-amber-500 to-orange-500" },
  { id: "habit-tracker", name: "Habit Tracker", icon: Target, color: "from-emerald-500 to-teal-500" },
  { id: "workout-log", name: "Workout Log", icon: Dumbbell, color: "from-orange-500 to-red-500" },
  { id: "budget-planner", name: "Budget Planner", icon: DollarSign, color: "from-blue-500 to-cyan-500" },
  { id: "class-notes", name: "Class Notes", icon: GraduationCap, color: "from-purple-500 to-pink-500" },
  { id: "research-builder", name: "Research Builder", icon: Brain, color: "from-violet-500 to-purple-600" },
  { id: "grocery-list", name: "Grocery List", icon: ShoppingCart, color: "from-green-500 to-emerald-500" },
  { id: "expense-sharer", name: "Expense Sharer", icon: Users, color: "from-teal-500 to-cyan-500" },
  { id: "project-pipeline", name: "Project Pipeline", icon: Workflow, color: "from-cyan-500 to-blue-500" },
  { id: "prompt-diary", name: "Prompt Diary", icon: MessageSquare, color: "from-indigo-500 to-purple-500" },
  { id: "save-the-date", name: "Save the Date", icon: Bell, color: "from-rose-500 to-pink-500" },
  { id: "important-urls", name: "Important URLs", icon: Link, color: "from-red-500 to-pink-500" },
  { id: "language-translator", name: "Language Translator", icon: Languages, color: "from-sky-500 to-blue-500" },
  { id: "dictionary", name: "Dictionary", icon: Search, color: "from-slate-500 to-gray-500" },
  { id: "meals-planner", name: "Meals Planner", icon: UtensilsCrossed, color: "from-orange-500 to-amber-500" },
  { id: "games-scorecard", name: "Games Scorecard", icon: Trophy, color: "from-yellow-500 to-amber-500" },
  { id: "sticker-book", name: "Sticker Book", icon: StickyNote, color: "from-lime-500 to-green-500" },
  { id: "mind-map", name: "Mind Map", icon: GitBranch, color: "from-violet-500 to-purple-600" },
  { id: "goal-tracker", name: "Goal Tracker", icon: Target, color: "from-blue-500 to-indigo-600" },
  { id: "ai-prompt-studio", name: "AI Prompt Studio", icon: Zap, color: "from-yellow-500 to-orange-600" },
  { id: "tutorial-learn", name: "Tutorial Learn", icon: GraduationCap, color: "from-indigo-500 to-blue-600" },
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
  { name: "Light Blue", value: "#87CEEB" },
  { name: "Red", value: "#DC143C" },
  { name: "Green Yellow", value: "#ADFF2F" },
  { name: "Silver", value: "#C0C0C0" },
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
  const [limitReached, setLimitReached] = useState(false)
  const [limitInfo, setLimitInfo] = useState<{ planType: string; maxNotebooks: number } | null>(null)
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

      console.log('[CREATE NOTEBOOK] Response status:', res.status)
      const data = await res.json()
      console.log('[CREATE NOTEBOOK] Response data:', data)
      
      if (!res.ok) {
        console.error('[CREATE NOTEBOOK] Error:', data.error)
        if (data.limitReached) {
          setLimitReached(true)
          setLimitInfo({ planType: data.planType, maxNotebooks: data.maxNotebooks })
        } else {
          alert(`Failed to create notebook: ${data.error || 'Unknown error'}`)
        }
        return
      }
      
      if (data.notebook) {
        console.log('[CREATE NOTEBOOK] Notebook created successfully:', data.notebook._id)
        console.log('[CREATE NOTEBOOK] Navigating to:', `/dashboard/notebook/${data.notebook._id}`)
        onCreated()
        onOpenChange(false)
        resetForm()
        router.push(`/dashboard/notebook/${data.notebook._id}`)
      } else {
        console.error('[CREATE NOTEBOOK] No notebook in response')
        alert('Failed to create notebook: No notebook returned')
      }
    } catch (error) {
      console.error("[CREATE NOTEBOOK] Failed to create notebook:", error)
      alert(`Failed to create notebook: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    setLimitReached(false)
    setLimitInfo(null)
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
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.3)]">
        <DialogHeader className="border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-40 animate-pulse" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Create New Notebook</DialogTitle>
              <p className="text-sm text-cyan-300/60 font-mono mt-1">⚡ Design your perfect digital notebook ⚡</p>
            </div>
          </div>
        </DialogHeader>

        {/* Limit Reached Banner */}
        {limitReached && limitInfo && (
          <div className="mx-1 mt-2 p-5 rounded-xl bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-2 border-amber-500/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-300 mb-1">Notebook Limit Reached</h3>
                <p className="text-sm text-amber-200/80 mb-4">
                  Your <span className="font-semibold capitalize">{limitInfo.planType}</span> plan allows up to{" "}
                  <span className="font-semibold">{limitInfo.maxNotebooks} notebook{limitInfo.maxNotebooks === 1 ? "" : "s"}</span>.
                  Upgrade to create more.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => { onOpenChange(false); resetForm(); router.push("/pricing"); }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold px-5"
                  >
                    <Crown className="w-4 h-4 mr-2" /> Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLimitReached(false)}
                    className="border-amber-500/40 text-amber-300 hover:bg-amber-900/30"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`space-y-8 py-6 ${limitReached ? "opacity-30 pointer-events-none" : ""}`}>
          {/* Template Selection */}
          <div className="space-y-4">
            <label className="text-base font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Choose Template
            </label>
            <div className="grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {templates.map((template) => {
                const Icon = template.icon
                return (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${
                      selectedTemplate === template.id
                        ? "border-cyan-500 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        : "border-slate-700 hover:border-cyan-500/50 bg-slate-800/50 hover:bg-slate-800"
                    }`}
                  >
                    {selectedTemplate === template.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-slate-300 group-hover:text-cyan-300 text-center leading-tight font-medium transition-colors">{template.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label className="text-base font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
              <Type className="h-5 w-5 text-cyan-400" />
              Notebook Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Notebook"
              className="w-full px-5 py-4 text-lg bg-slate-800/60 border-2 border-slate-600/50 rounded-xl text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 font-medium"
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-base font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
              <LayoutGrid className="h-5 w-5 text-cyan-400" />
              Category
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    category === cat
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                      : "bg-slate-800/60 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-cyan-500/50 hover:text-cyan-300"
                  }`}
                >
                  {cat}
                </motion.button>
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
          <div className="space-y-3">
            <label className="text-base font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Cover Color {coverImageUrl && <span className="text-xs text-slate-400 normal-case">(used as fallback)</span>}
            </label>
            <div className="flex flex-wrap gap-3">
              {themeColors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setThemeColor(color.value)}
                  className={`w-10 h-10 rounded-xl transition-all ${
                    themeColor === color.value
                      ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-cyan-500 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                      : "hover:shadow-lg border-2 border-slate-700 hover:border-slate-600"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Paper Pattern */}
          <div className="space-y-3">
            <label className="text-base font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
              <Layers className="h-5 w-5 text-cyan-400" />
              Paper Style
            </label>
            <div className="flex flex-wrap gap-3">
              {paperPatterns.map((pattern) => (
                <motion.button
                  key={pattern.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaperPattern(pattern.value)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    paperPattern === pattern.value
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      : "bg-slate-800/60 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-purple-500/50 hover:text-purple-300"
                  }`}
                >
                  {pattern.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Page Color */}
          <div className="space-y-3">
            <label className="text-base font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Page Color
            </label>
            <div className="flex flex-wrap gap-3">
              {pageColors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPageColor(color.value)}
                  className={`w-10 h-10 rounded-xl transition-all border-2 ${
                    pageColor === color.value
                      ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-cyan-500 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                      : "hover:scale-105 border-slate-700 hover:border-slate-600"
                  } ${color.isDark ? 'border-slate-600' : 'border-slate-700'}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            {isDarkColor(pageColor) && (
              <p className="text-xs text-cyan-400 mt-2 font-mono">
                ✓ Dark page selected - text will automatically use light colors for readability
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <label className="text-base font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider justify-center">
              <ImageIcon className="h-5 w-5 text-cyan-400" />
              Preview
            </label>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <div
                className="relative w-32 h-32 rounded-xl shadow-2xl mx-auto overflow-hidden border-2 border-cyan-500/30"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-bold truncate drop-shadow-lg">
                    {title || "My Notebook"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-cyan-500/20 pt-6 gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 px-6 py-3 bg-slate-800/60 border-2 border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 rounded-xl font-bold text-base transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading || !title.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-black text-base transition-all duration-300 border-2 border-cyan-400/50"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {loading ? 'Creating...' : '⚡ Create Notebook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
