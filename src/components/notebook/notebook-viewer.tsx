"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { flushSync } from "react-dom"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Plus,
  MessageSquare,
  Loader2,
  BookOpen,
  Palette,
  X,
  Check,
  Share2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageContent } from "./page-content"
import { ChapterTabs } from "./chapter-tabs"
import { TableOfContents } from "./table-of-contents"
import { ChatSidebar } from "./chat-sidebar"
import { PageScrubber } from "./page-scrubber"
import { MeetingNotesTemplate } from "@/components/notebook-templates/meeting-notes-template"
import { DocumentTemplate } from "@/components/notebook-templates/document-template"
import { DashboardTemplate } from "@/components/notebook-templates/dashboard-template"
import { CodeNotebookTemplate } from "@/components/notebook-templates/code-notebook-template"
import { PlannerTemplate } from "@/components/notebook-templates/planner-template"
import { AIResearchTemplate } from "@/components/notebook-templates/ai-research-template"
import { DiaryTemplate } from "@/components/notebook-templates/diary-template"
import { JournalTemplate } from "@/components/notebook-templates/journal-template"
import { CustomTemplate } from "@/components/notebook-templates/custom-template"
import { DoodleTemplate } from "@/components/notebook-templates/doodle-template"
import { ProjectTemplate } from "@/components/notebook-templates/project-template"
import { LoopTemplate } from "@/components/notebook-templates/loop-template"
import { StoryTemplate } from "@/components/notebook-templates/story-template"
import { StorytellingTemplate } from "@/components/notebook-templates/storytelling-template"
import { TypewriterTemplate } from "@/components/notebook-templates/typewriter-template"
import { N8nTemplate } from "@/components/notebook-templates/n8n-template"
import { ImagePromptTemplate } from "@/components/notebook-templates/image-prompt-template"
import { VideoPromptTemplate } from "@/components/notebook-templates/video-prompt-template"
import { LinkTemplate } from "@/components/notebook-templates/link-template"
import { StudyBookTemplate } from "@/components/notebook-templates/studybook-template"
import { FlashcardTemplate } from "@/components/notebook-templates/flashcard-template"
import { WhiteboardTemplate } from "@/components/notebook-templates/whiteboard-template"
import { RecipeTemplate } from "@/components/notebook-templates/recipe-template"
import { ExpenseTemplate } from "@/components/notebook-templates/expense-template"
import { TripTemplate } from "@/components/notebook-templates/trip-template"
import { TodoTemplate } from "@/components/notebook-templates/todo-template"
import { SoundBox } from "@/components/ui/sound-box"
import { BookNotesTemplate } from "@/components/notebook-templates/book-notes-template"
import { HabitTrackerTemplate } from "@/components/notebook-templates/habit-tracker-template"
import { WorkoutLogTemplate } from "@/components/notebook-templates/workout-log-template"
import { BudgetPlannerTemplate } from "@/components/notebook-templates/budget-planner-template"
import { ClassNotesTemplate } from "@/components/notebook-templates/class-notes-template"
import { ResearchBuilderTemplate } from "@/components/notebook-templates/research-builder-template"
import { GroceryListTemplate } from "@/components/notebook-templates/grocery-list-template"
import { ExpenseSharerTemplate } from "@/components/notebook-templates/expense-sharer-template"
import { ProjectPipelineTemplate } from "@/components/notebook-templates/project-pipeline-template"
import { PromptDiaryTemplate } from "@/components/notebook-templates/prompt-diary-template"
import { SaveTheDateTemplate } from "@/components/notebook-templates/save-the-date-template"
import { ImportantUrlsTemplate } from "@/components/notebook-templates/important-urls-template"
import { LanguageTranslatorTemplate } from "@/components/notebook-templates/language-translator-template"
import { DictionaryTemplate } from "@/components/notebook-templates/dictionary-template"
import { MealsPlannerTemplate } from "@/components/notebook-templates/meals-planner-template"
import { GamesScoreCardTemplate } from "@/components/notebook-templates/games-scorecard-template"
import { StickerBookTemplate } from "@/components/notebook-templates/sticker-book-template"
import { TutorialLearnTemplate } from "@/components/notebook-templates/tutorial-learn-template"
import { MindMapTemplate } from "@/components/notebook-templates/mind-map-template"
import { GoalTrackerTemplate } from "@/components/notebook-templates/goal-tracker-template"
import { AIPromptStudioTemplate } from "@/components/notebook-templates/ai-prompt-studio-template"
import { PianoNotesTemplate } from "@/components/notebook-templates/piano-notes-template"
import { VocabularyTemplate } from "@/components/notebook-templates/vocabulary-template"
import { LoadingCubes } from "@/components/ui/loading-cubes"
import { SimpleTemplate } from "@/components/notebook-templates/simple-template"
import { AppHeader } from "@/components/layout/app-header"
import { NotebookHeader } from "@/components/layout/notebook-header"
import { ShareManager } from "@/components/share/share-manager"
import { AIToolbar } from "@/components/ai/AIToolbar"
import { CollaborationProvider } from "@/components/collaboration/CollaborationProvider"
import { LiveCursors } from "@/components/collaboration/LiveCursors"
import { CollaboratorsPresence } from "@/components/collaboration/CollaboratorsPresence"
import { CommentsPanel } from "@/components/collaboration/CommentsPanel"
import { useMyPresence } from "@/liveblocks.config"

interface Page {
  _id: string
  pageNumber: number
  title: string
  content: string
  chapterId?: string
  isTOC?: boolean
}

interface Chapter {
  _id: string
  title: string
  orderIndex: number
  color: string
}

type NotebookTemplateType = 
  | 'simple'
  | 'meeting-notes'
  | 'document'
  | 'dashboard'
  | 'code-notebook'
  | 'planner'
  | 'ai-research'
  | 'diary'
  | 'journal'
  | 'custom'
  | 'doodle'
  | 'project'
  | 'loop'
  | 'story'
  | 'storytelling'
  | 'typewriter'
  | 'n8n'
  | 'image-prompt'
  | 'video-prompt'
  | 'link'
  | 'studybook'
  | 'flashcard'
  | 'whiteboard'
  | 'recipe'
  | 'expense'
  | 'trip'
  | 'todo'
  | 'sound-box'
  | 'book-notes'
  | 'habit-tracker'
  | 'workout-log'
  | 'budget-planner'
  | 'class-notes'
  | 'research-builder'
  | 'grocery-list'
  | 'expense-sharer'
  | 'project-pipeline'
  | 'prompt-diary'
  | 'save-the-date'
  | 'important-urls'
  | 'language-translator'
  | 'dictionary'
  | 'meals-planner'
  | 'games-scorecard'
  | 'sticker-book'
  | 'tutorial-learn'
  | 'mind-map'
  | 'goal-tracker'
  | 'ai-prompt-studio'
  | 'piano-notes'
  | 'vocabulary'

interface Notebook {
  _id: string
  title: string
  template: NotebookTemplateType
  appearance: {
    coverImageUrl?: string
    themeColor: string
    pageColor: string
    paperPattern: string
    fontStyle: string
  }
}

interface NotebookViewerProps {
  notebookId: string
  userId: string
  initialPage: number
}

const darkPageColors = [
  '#1f2937', '#1e3a5f', '#14532d', '#3b0764', '#0a0a0a',
  '#ea580c', '#dc2626', '#7f1d1d',
  '#7c4a1e', '#5c3317', '#3b1f0e', '#2c1810',
  '#166534', '#1e3a8a', '#0f172a',
  '#7c3aed', '#312e81',
  '#475569', '#111827',
]
const defaultLightColors = ['#fffbeb', '#ffffff', '']

const isDarkPageColor = (color: string): boolean => {
  return darkPageColors.includes(color?.toLowerCase())
}

const isDefaultColor = (color: string): boolean => {
  return !color || defaultLightColors.includes(color?.toLowerCase())
}

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

const pageColors = [
  // Auto
  { name: "Auto", value: "", isDark: false },
  // Whites & Creams
  { name: "White", value: "#ffffff", isDark: false },
  { name: "Cream", value: "#fffbeb", isDark: false },
  { name: "Ivory", value: "#fffff0", isDark: false },
  { name: "Linen", value: "#faf0e6", isDark: false },
  { name: "Antique White", value: "#faebd7", isDark: false },
  // Yellows
  { name: "Light Yellow", value: "#fef9c3", isDark: false },
  { name: "Pale Yellow", value: "#fefce8", isDark: false },
  { name: "Warm Yellow", value: "#fde68a", isDark: false },
  { name: "Amber", value: "#fcd34d", isDark: false },
  // Oranges
  { name: "Peach", value: "#fed7aa", isDark: false },
  { name: "Light Orange", value: "#ffedd5", isDark: false },
  { name: "Apricot", value: "#fca572", isDark: false },
  { name: "Orange", value: "#f97316", isDark: false },
  { name: "Deep Orange", value: "#ea580c", isDark: true },
  // Reds & Pinks
  { name: "Light Pink", value: "#fce7f3", isDark: false },
  { name: "Rose", value: "#fecdd3", isDark: false },
  { name: "Blush", value: "#fbcfe8", isDark: false },
  { name: "Salmon", value: "#fca5a5", isDark: false },
  { name: "Red", value: "#ef4444", isDark: false },
  { name: "Crimson", value: "#dc2626", isDark: true },
  { name: "Dark Red", value: "#7f1d1d", isDark: true },
  // Browns & Chocolates
  { name: "Wheat", value: "#f5deb3", isDark: false },
  { name: "Tan", value: "#d2b48c", isDark: false },
  { name: "Sandy Brown", value: "#c4a882", isDark: false },
  { name: "Light Brown", value: "#a0785a", isDark: false },
  { name: "Brown", value: "#7c4a1e", isDark: true },
  { name: "Chocolate", value: "#5c3317", isDark: true },
  { name: "Dark Chocolate", value: "#3b1f0e", isDark: true },
  { name: "Espresso", value: "#2c1810", isDark: true },
  // Greens
  { name: "Light Green", value: "#dcfce7", isDark: false },
  { name: "Mint", value: "#d1fae5", isDark: false },
  { name: "Sage", value: "#bbf7d0", isDark: false },
  { name: "Pale Green", value: "#86efac", isDark: false },
  { name: "Forest", value: "#166534", isDark: true },
  { name: "Dark Green", value: "#14532d", isDark: true },
  // Blues
  { name: "Light Blue", value: "#dbeafe", isDark: false },
  { name: "Sky Blue", value: "#bae6fd", isDark: false },
  { name: "Powder Blue", value: "#e0f2fe", isDark: false },
  { name: "Steel Blue", value: "#93c5fd", isDark: false },
  { name: "Dark Blue", value: "#1e3a5f", isDark: true },
  { name: "Navy", value: "#1e3a8a", isDark: true },
  { name: "Midnight", value: "#0f172a", isDark: true },
  // Purples
  { name: "Light Purple", value: "#f3e8ff", isDark: false },
  { name: "Lavender", value: "#ede9fe", isDark: false },
  { name: "Lilac", value: "#ddd6fe", isDark: false },
  { name: "Violet", value: "#7c3aed", isDark: true },
  { name: "Dark Purple", value: "#3b0764", isDark: true },
  { name: "Indigo", value: "#312e81", isDark: true },
  // Grays & Darks
  { name: "Light Gray", value: "#f3f4f6", isDark: false },
  { name: "Silver", value: "#e5e7eb", isDark: false },
  { name: "Gray", value: "#9ca3af", isDark: false },
  { name: "Slate", value: "#475569", isDark: true },
  { name: "Dark Gray", value: "#1f2937", isDark: true },
  { name: "Charcoal", value: "#111827", isDark: true },
  { name: "Black", value: "#0a0a0a", isDark: true },
]

const paperPatterns = [
  { name: "Lined", value: "lined" },
  { name: "Grid", value: "grid" },
  { name: "Dotted", value: "dotted" },
  { name: "Blank", value: "blank" },
]

export function NotebookViewer({ notebookId, userId, initialPage }: NotebookViewerProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false)
  const [showCover, setShowCover] = useState(false)
  const [pages, setPages] = useState<Page[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [loading, setLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [, updateMyPresence] = useMyPresence()
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState(0)
  // Separate flush refs for left and right pages so both are saved before navigation
  const flushLeftRef = useRef<(() => Promise<void>) | null>(null)
  const flushRightRef = useRef<(() => Promise<void>) | null>(null)
  const flushAll = async () => {
    await Promise.all([
      flushLeftRef.current?.(),
      flushRightRef.current?.(),
    ])
  }

  // Track live edits in a ref (no re-render) and sync to pages state only when navigating
  const liveEditsRef = useRef<Record<string, { content: string; title: string }>>({})

  const handleContentChange = useCallback((pageId: string, content: string, title: string) => {
    // Always store latest in ref (used for flush on navigation)
    liveEditsRef.current[pageId] = { content, title }
    // Update title in pages state immediately so TOC reflects it without navigation
    setPages(prev => {
      const existing = prev.find(p => p._id === pageId)
      if (!existing || existing.title === title) return prev
      return prev.map(p => p._id === pageId ? { ...p, title } : p)
    })
  }, [])

  // Merge live edits into pages state atomically with the spread change
  const applyLiveEditsToPages = useCallback(() => {
    const edits = liveEditsRef.current
    if (Object.keys(edits).length === 0) return
    // flushSync ensures setPages and setCurrentSpread are batched into one render
    // so the remounted page always receives the updated initialContent
    flushSync(() => {
      setPages(prev => prev.map(p =>
        edits[p._id] ? { ...p, content: edits[p._id].content, title: edits[p._id].title } : p
      ))
    })
  }, [])

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch notebook data
  useEffect(() => {
    fetchNotebookData()
  }, [notebookId])

  const fetchNotebookData = async () => {
    try {
      setLoading(true)
      const [notebookRes, pagesRes, chaptersRes] = await Promise.all([
        fetch(`/api/notebooks/${notebookId}`),
        fetch(`/api/notebooks/${notebookId}/pages`),
        fetch(`/api/notebooks/${notebookId}/chapters`),
      ])

      const notebookData = await notebookRes.json()
      const pagesData = await pagesRes.json()
      const chaptersData = await chaptersRes.json()

      setNotebook(notebookData.notebook)
      setPages(pagesData.pages || [])
      setChapters(chaptersData.chapters || [])
    } catch (error) {
      console.error("Failed to fetch notebook:", error)
    } finally {
      setLoading(false)
    }
  }

  // Save notebook appearance (theme, page color, paper pattern)
  const saveAppearance = async (newAppearance: Partial<Notebook["appearance"]>) => {
    if (!notebook) return
    const updated = { ...notebook.appearance, ...newAppearance }
    setNotebook(prev => prev ? { ...prev, appearance: updated } : prev)
    try {
      await fetch(`/api/notebooks/${notebookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appearance: updated }),
      })
    } catch (error) {
      console.error("Failed to save appearance:", error)
    }
  }

  // For 2-page spread: currentSpread is the index of the left page (0-indexed)
  // Spread 0: pages 0,1 (TOC + page 1)
  // Spread 1: pages 2,3
  // etc.
  const [currentSpread, setCurrentSpread] = useState(Math.floor((initialPage - 1) / 2))
  
  // All pages including TOC at index 0
  const allPages = [{ _id: 'toc', pageNumber: 0, title: 'Table of Contents', content: '', isTOC: true }, ...pages]
  const totalSpreads = Math.ceil(allPages.length / 2)

  const goToPage = async (pageNum: number) => {
    // pageNum=0 → TOC (allPages[0]), pageNum=N → allPages[N]
    // spread = Math.floor(allPagesIndex / 2)
    const spreadIndex = Math.floor(pageNum / 2)
    if (spreadIndex >= 0 && spreadIndex < totalSpreads && !isAnimating) {
      await flushAll()
      applyLiveEditsToPages()
      setDirection(spreadIndex > currentSpread ? 1 : -1)
      setIsAnimating(true)
      setCurrentSpread(spreadIndex)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const nextSpread = async () => {
    if (currentSpread < totalSpreads - 1 && !isAnimating) {
      await flushAll()
      applyLiveEditsToPages()
      setDirection(1)
      setIsAnimating(true)
      setCurrentSpread(prev => prev + 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const prevSpread = async () => {
    if (currentSpread > 0 && !isAnimating) {
      await flushAll()
      applyLiveEditsToPages()
      setDirection(-1)
      setIsAnimating(true)
      setCurrentSpread(prev => prev - 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }
  
  // Get left and right page for current spread
  const leftPageIndex = currentSpread * 2
  const rightPageIndex = currentSpread * 2 + 1
  const leftPage = allPages[leftPageIndex]
  const rightPage = allPages[rightPageIndex]

  const addNewPage = async () => {
    try {
      const res = await fetch(`/api/notebooks/${notebookId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageNumber: pages.length + 1,
          title: "",
          content: "",
        }),
      })
      const data = await res.json()
      if (data.page) {
        setPages([...pages, data.page])
        setTimeout(() => goToPage(pages.length + 1), 100)
      }
    } catch (error) {
      console.error("Failed to add page:", error)
    }
  }

  // Render a single page content
  const renderPageContent = (pageData: any) => {
    if (!pageData) return null
    
    if (pageData.isTOC) {
      return (
        <TableOfContents
          chapters={chapters}
          pages={pages}
          onNavigate={goToPage}
          onClose={() => setShowCover(true)}
        />
      )
    }
    
    // Determine if this is the left or right page by checking which side it's on
    const isLeft = allPages[leftPageIndex]?._id === pageData._id
    return (
      <PageContent
        page={pageData}
        notebookId={notebookId}
        paperPattern={notebook?.appearance.paperPattern || "lined"}
        onUpdate={fetchNotebookData}
        isEditing={true}
        flushRef={isLeft ? flushLeftRef : flushRightRef}
        onContentChange={handleContentChange}
      />
    )
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-amber-50 dark:bg-neutral-950">
        <header className="flex items-center justify-between px-6 py-3 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-b border-amber-100 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300 hidden sm:block">SmartNotes</span>
            </button>
            <span className="text-amber-300 dark:text-neutral-600">|</span>
            <h1 className="text-xl font-semibold text-amber-900 dark:text-amber-200">Loading...</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <LoadingCubes />
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-amber-700">Notebook not found</p>
      </div>
    )
  }

  // Render template-specific views (including simple — same layout with AppHeader)
  if (notebook.template) {
    const renderTemplateView = () => {
      switch (notebook.template) {
        case 'simple':
          return (
            <SimpleTemplate
              title={notebook.title}
              notebookId={notebookId}
              pages={pages}
              onUpdate={fetchNotebookData}
              onAddPage={addNewPage}
              appearance={notebook.appearance}
            />
          )
        case 'meeting-notes':
          return <MeetingNotesTemplate title={notebook.title} notebookId={notebookId} />
        case 'document':
          return <DocumentTemplate title={notebook.title} notebookId={notebookId} />
        case 'dashboard':
          return <DashboardTemplate title={notebook.title} notebookId={notebookId} />
        case 'code-notebook':
          return <CodeNotebookTemplate title={notebook.title} notebookId={notebookId} />
        case 'planner':
          return <PlannerTemplate title={notebook.title} notebookId={notebookId} />
        case 'ai-research':
          return <AIResearchTemplate title={notebook.title} notebookId={notebookId} />
        case 'diary':
          return <DiaryTemplate title={notebook.title} notebookId={notebookId} />
        case 'journal':
          return <JournalTemplate title={notebook.title} notebookId={notebookId} />
        case 'custom':
          return <CustomTemplate title={notebook.title} notebookId={notebookId} />
        case 'doodle':
          return <DoodleTemplate title={notebook.title} notebookId={notebookId} />
        case 'project':
          return <ProjectTemplate title={notebook.title} notebookId={notebookId} />
        case 'loop':
          return <LoopTemplate title={notebook.title} notebookId={notebookId} />
        case 'story':
          return <StoryTemplate title={notebook.title} notebookId={notebookId} />
        case 'storytelling':
          return <StorytellingTemplate title={notebook.title} notebookId={notebookId} />
        case 'typewriter':
          return <TypewriterTemplate title={notebook.title} notebookId={notebookId} />
        case 'n8n':
          return <N8nTemplate title={notebook.title} notebookId={notebookId} />
        case 'image-prompt':
          return <ImagePromptTemplate title={notebook.title} notebookId={notebookId} />
        case 'video-prompt':
          return <VideoPromptTemplate title={notebook.title} notebookId={notebookId} />
        case 'link':
          return <LinkTemplate title={notebook.title} notebookId={notebookId} />
        case 'studybook':
          return <StudyBookTemplate title={notebook.title} notebookId={notebookId} />
        case 'flashcard':
          return <FlashcardTemplate title={notebook.title} notebookId={notebookId} />
        case 'whiteboard':
          return <WhiteboardTemplate title={notebook.title} notebookId={notebookId} />
        case 'recipe':
          return <RecipeTemplate title={notebook.title} notebookId={notebookId} />
        case 'expense':
          return <ExpenseTemplate title={notebook.title} notebookId={notebookId} />
        case 'trip':
          return <TripTemplate title={notebook.title} notebookId={notebookId} />
        case 'todo':
          return <TodoTemplate title={notebook.title} notebookId={notebookId} />
        case 'sound-box':
          return <SoundBox />
        case 'book-notes':
          return <BookNotesTemplate title={notebook.title} notebookId={notebookId} />
        case 'habit-tracker':
          return <HabitTrackerTemplate title={notebook.title} notebookId={notebookId} />
        case 'workout-log':
          return <WorkoutLogTemplate title={notebook.title} notebookId={notebookId} />
        case 'budget-planner':
          return <BudgetPlannerTemplate title={notebook.title} notebookId={notebookId} />
        case 'class-notes':
          return <ClassNotesTemplate title={notebook.title} notebookId={notebookId} />
        case 'research-builder':
          return <ResearchBuilderTemplate title={notebook.title} notebookId={notebookId} />
        case 'grocery-list':
          return <GroceryListTemplate title={notebook.title} notebookId={notebookId} />
        case 'expense-sharer':
          return <ExpenseSharerTemplate title={notebook.title} notebookId={notebookId} />
        case 'project-pipeline':
          return <ProjectPipelineTemplate title={notebook.title} notebookId={notebookId} />
        case 'prompt-diary':
          return <PromptDiaryTemplate title={notebook.title} notebookId={notebookId} />
        case 'save-the-date':
          return <SaveTheDateTemplate title={notebook.title} notebookId={notebookId} />
        case 'important-urls':
          return <ImportantUrlsTemplate title={notebook.title} notebookId={notebookId} />
        case 'language-translator':
          return <LanguageTranslatorTemplate title={notebook.title} notebookId={notebookId} />
        case 'dictionary':
          return <DictionaryTemplate title={notebook.title} notebookId={notebookId} />
        case 'meals-planner':
          return <MealsPlannerTemplate title={notebook.title} notebookId={notebookId} />
        case 'games-scorecard':
          return <GamesScoreCardTemplate title={notebook.title} notebookId={notebookId} />
        case 'sticker-book':
          return <StickerBookTemplate title={notebook.title} notebookId={notebookId} />
        case 'tutorial-learn':
          return <TutorialLearnTemplate title={notebook.title} notebookId={notebookId} />
        case 'mind-map':
          return <MindMapTemplate title={notebook.title} notebookId={notebookId} />
        case 'goal-tracker':
          return <GoalTrackerTemplate title={notebook.title} notebookId={notebookId} />
        case 'ai-prompt-studio':
          return <AIPromptStudioTemplate title={notebook.title} notebookId={notebookId} />
        case 'piano-notes':
          return <PianoNotesTemplate title={notebook.title} notebookId={notebookId} />
        case 'vocabulary':
          return <VocabularyTemplate title={notebook.title} notebookId={notebookId} />
        default:
          return null
      }
    }

    return (
      <div className="h-full flex flex-col relative overflow-hidden">
        <NotebookHeader
          onAIClick={() => { setSelectedText(""); setIsAIOpen(o => !o); }}
          onShareClick={() => setIsShareOpen(true)}
          onChatClick={() => setIsChatOpen(!isChatOpen)}
          isAIActive={isAIOpen}
          isChatActive={isChatOpen}
        />
        <ShareManager
          notebookId={notebookId}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />

        {/* Template Content — fills remaining height, no scroll (templates manage their own scrolling) */}
        <div className="flex-1 overflow-hidden min-h-0">
          {renderTemplateView()}
        </div>

        {/* AI Assistant panel — above header so it's always visible */}
        <AnimatePresence>
          {isAIOpen && (
            <AIToolbar
              selectedText={selectedText}
              notebookId={notebookId}
              notebookTitle={notebook?.title}
              onApply={() => setIsAIOpen(false)}
              onClose={() => setIsAIOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Chat Sidebar — absolute overlay */}
        <AnimatePresence>
          {isChatOpen && (
            <div className="absolute top-0 right-0 bottom-0 w-[380px] z-[100] flex">
              <ChatSidebar
                open={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                notebookId={notebookId}
                pages={pages}
                onNavigateToPage={goToPage}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Mobile: Vertical scroll mode
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push("/dashboard")} className="p-2">
              <ArrowLeft className="h-5 w-5 text-amber-700" />
            </button>
            <h1 className="font-semibold text-amber-900 truncate">{notebook.title}</h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setSelectedText(""); setIsAIOpen(o => !o) }}
                className={`p-2 rounded-lg transition-colors ${isAIOpen ? "bg-purple-100 text-purple-600" : "text-amber-700 hover:bg-amber-50"}`}
                title="AI Assistant"
              >
                <Sparkles className="h-5 w-5" />
              </button>
              <button onClick={() => setIsChatOpen(true)} className="p-2">
                <MessageSquare className="h-5 w-5 text-amber-700" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 notebook-mobile">
          {pages.map((page) => (
            <div
              key={page._id}
              className={`notebook-page rounded-lg p-6 paper-${notebook.appearance.paperPattern}`}
            >
              <PageContent
                page={page}
                notebookId={notebookId}
                paperPattern={notebook.appearance.paperPattern}
                onUpdate={fetchNotebookData}
                isEditing={true}
              />
            </div>
          ))}
          <button
            onClick={addNewPage}
            className="w-full py-8 border-2 border-dashed border-amber-300 rounded-lg text-amber-600 hover:bg-amber-50"
          >
            <Plus className="h-6 w-6 mx-auto mb-2" />
            Add New Page
          </button>
        </div>

        <ChatSidebar
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          notebookId={notebookId}
          pages={pages}
          onNavigateToPage={goToPage}
        />
      </div>
    )
  }

  // Cover page — early return before desktop view so AnimatePresence never blocks it
  if (showCover) {
    return (
      <div className="h-full flex flex-col bg-amber-50 dark:bg-neutral-950">
        <header className="flex items-center justify-between px-6 py-3 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-b border-amber-100 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300 hidden sm:block">SmartNotes</span>
            </button>
            <span className="text-amber-300 dark:text-neutral-600">|</span>
            <h1 className="text-xl font-semibold text-amber-900 dark:text-amber-200">{notebook.title}</h1>
          </div>
          <Button
            onClick={() => setShowCover(false)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Open Notebook
          </Button>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0">
          <motion.div
            initial={{ opacity: 0, rotateY: -15 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="relative flex shadow-2xl rounded-lg overflow-hidden cursor-pointer group"
            style={{
              height: 'calc(100vh - 140px)',
              width: 'calc((100vw - 200px) / 2)',
              maxWidth: '700px',
              backgroundColor: notebook.appearance.themeColor || "#8B4513",
            }}
            onClick={() => setShowCover(false)}
          >
            {/* Spine */}
            <div
              className="absolute left-0 top-0 bottom-0 w-6 z-10"
              style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            />
            {/* Cover image */}
            {notebook.appearance.coverImageUrl && (
              <img
                src={notebook.appearance.coverImageUrl}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
              <BookOpen className="h-16 w-16 text-white/80 mb-4 group-hover:text-white transition-colors drop-shadow-lg" />
              <p className="text-white font-bold text-2xl text-center leading-tight drop-shadow-lg">{notebook.title}</p>
            </div>
            {/* Bottom hint */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white/90 text-sm bg-black/30 px-4 py-1.5 rounded-full backdrop-blur-sm">
                Click to open
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Desktop: 2-sided book view
  return (
    <div
      className="h-full flex bg-amber-50 dark:bg-neutral-950 relative overflow-hidden"
      onMouseMove={(e) => updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } })}
      onMouseLeave={() => updateMyPresence({ cursor: null })}
    >
      <LiveCursors />
      {/* Chapter Tabs (Left Side) */}
      <ChapterTabs
        chapters={chapters}
        pages={pages}
        currentPage={leftPageIndex + 1}
        onSelectChapter={(pageNum) => goToPage(pageNum)}
      />

      {/* Main Book Area — same NotebookHeader as template view so AI/Share/Chat always work */}
      <div className="flex-1 flex flex-col h-full">
        <NotebookHeader
          title={notebook.title}
          onAIClick={() => {
            const sel = typeof window !== "undefined" ? window.getSelection()?.toString().trim() || "" : ""
            setSelectedText(sel)
            setIsAIOpen(o => !o)
          }}
          onShareClick={() => setIsShareOpen(true)}
          onChatClick={() => setIsChatOpen(!isChatOpen)}
          isAIActive={isAIOpen}
          isChatActive={isChatOpen}
          extraActions={
            <>
              <CollaboratorsPresence />
              <Button type="button" variant="ghost" size="icon" onClick={addNewPage} title="Add page">
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsCommentsOpen(o => !o)}
                className={isCommentsOpen ? "bg-amber-100 dark:bg-amber-900/30" : ""}
                title="Comments"
              >
                <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsThemePanelOpen(!isThemePanelOpen)}
                className={isThemePanelOpen ? "bg-amber-100 dark:bg-amber-900/30" : ""}
                title="Notebook theme"
              >
                <Palette className="h-5 w-5" />
              </Button>
            </>
          }
        />
        <ShareManager
          notebookId={notebookId}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />

        {/* Theme Panel */}
        <AnimatePresence>
          {isThemePanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute top-14 right-4 z-50 w-96 bg-white dark:bg-neutral-900 border border-amber-200 dark:border-neutral-700 rounded-xl shadow-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Notebook Theme</h3>
                <button onClick={() => setIsThemePanelOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Cover Color */}
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">Cover Color</p>
                <div className="flex flex-wrap gap-2">
                  {themeColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => saveAppearance({ themeColor: c.value })}
                      className="w-7 h-7 rounded-lg transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {notebook.appearance.themeColor === c.value && (
                        <Check className="h-3 w-3 text-white absolute inset-0 m-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Pattern */}
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">Paper Style</p>
                <div className="flex gap-2 flex-wrap">
                  {paperPatterns.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => saveAppearance({ paperPattern: p.value as any })}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                        notebook.appearance.paperPattern === p.value
                          ? "bg-amber-600 text-white"
                          : "bg-amber-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Color */}
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">Page Color</p>
                <div className="flex flex-wrap gap-2">
                  {pageColors.map((c) => (
                    <button
                      key={c.value || "auto"}
                      onClick={() => saveAppearance({ pageColor: c.value })}
                      className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 relative border ${
                        (notebook.appearance.pageColor ?? "") === c.value
                          ? "ring-2 ring-amber-500 ring-offset-1 scale-110"
                          : "border-neutral-300 dark:border-neutral-600"
                      }`}
                      style={{ backgroundColor: c.value || (theme === "dark" ? "#1c1c1e" : "#fffbeb") }}
                      title={c.name}
                    >
                      {!c.value && (
                        <span className="text-[8px] font-bold text-amber-600 dark:text-amber-300 absolute inset-0 flex items-center justify-center leading-none">A</span>
                      )}
                      {(notebook.appearance.pageColor ?? "") === c.value && c.value && (
                        <Check className={`h-3 w-3 absolute inset-0 m-auto drop-shadow ${c.isDark ? "text-white" : "text-amber-700"}`} />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">"A" = follows global dark/light mode</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Container - 2-sided open book */}
        <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0 bg-amber-50 dark:bg-neutral-950">
          {/* Left Navigation Arrow */}
          <button
            onClick={prevSpread}
            disabled={currentSpread <= 0}
            className="p-3 bg-white/80 dark:bg-neutral-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed z-10 flex-shrink-0 mr-4"
          >
            <ChevronLeft className="h-6 w-6 text-amber-700 dark:text-amber-400" />
          </button>

          {/* Open Book - 2 pages side by side */}
          <div 
            className="relative flex shadow-2xl rounded-lg overflow-hidden"
            style={{ 
              height: 'calc(100vh - 140px)',
              width: 'calc(100vw - 200px)',
              maxWidth: '1400px',
            }}
          >
            {/* Left Page */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`left-${currentSpread}`}
                initial={{ opacity: 0, rotateY: direction > 0 ? -15 : 15 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative notebook-page paper-${notebook.appearance.paperPattern} overflow-auto flex-1 ${
                  isDarkPageColor(notebook.appearance.pageColor) ? 'dark-page' : ''
                } ${
                  isDefaultColor(notebook.appearance.pageColor) ? 'bg-amber-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100' : ''
                }`}
                style={{ 
                  height: '100%',
                  borderRight: isDarkPageColor(notebook.appearance.pageColor) ? '1px solid #374151' : '1px solid #d4a574',
                  ...(isDefaultColor(notebook.appearance.pageColor) ? {} : {
                    backgroundColor: notebook.appearance.pageColor,
                    color: isDarkPageColor(notebook.appearance.pageColor) ? '#f3f4f6' : 'inherit',
                  })
                }}
              >
                {/* Left page shadow (book binding) */}
                <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${isDarkPageColor(notebook.appearance.pageColor) ? 'bg-gradient-to-l from-gray-700/50 to-transparent' : 'bg-gradient-to-l from-amber-200/50 to-transparent'}`} />
                
                {leftPage ? (
                  renderPageContent(leftPage)
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-amber-200" />
                  </div>
                )}
                
                {/* Left page number */}
                <div className="absolute bottom-3 left-4 text-xs text-amber-400">
                  {leftPage?.isTOC ? 'Contents' : leftPage ? `Page ${leftPage.pageNumber}` : ''}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Book Spine / Center binding */}
            <div className={`w-3 flex-shrink-0 ${isDarkPageColor(notebook.appearance.pageColor) ? 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600' : 'bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300'}`} />

            {/* Right Page */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`right-${currentSpread}`}
                initial={{ opacity: 0, rotateY: direction > 0 ? 15 : -15 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative notebook-page paper-${notebook.appearance.paperPattern} overflow-auto flex-1 ${
                  isDarkPageColor(notebook.appearance.pageColor) ? 'dark-page' : ''
                } ${
                  isDefaultColor(notebook.appearance.pageColor) ? 'bg-amber-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100' : ''
                }`}
                style={{ 
                  height: '100%',
                  borderLeft: isDarkPageColor(notebook.appearance.pageColor) ? '1px solid #374151' : '1px solid #d4a574',
                  ...(isDefaultColor(notebook.appearance.pageColor) ? {} : {
                    backgroundColor: notebook.appearance.pageColor,
                    color: isDarkPageColor(notebook.appearance.pageColor) ? '#f3f4f6' : 'inherit',
                  })
                }}
              >
                {/* Right page shadow (book binding) */}
                <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${isDarkPageColor(notebook.appearance.pageColor) ? 'bg-gradient-to-r from-gray-700/50 to-transparent' : 'bg-gradient-to-r from-amber-200/50 to-transparent'}`} />
                
                {rightPage ? (
                  renderPageContent(rightPage)
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <button
                      onClick={addNewPage}
                      className="text-center text-amber-500 hover:text-amber-700"
                    >
                      <Plus className="h-10 w-10 mx-auto mb-2" />
                      <p className="text-sm">Add Page</p>
                    </button>
                  </div>
                )}
                
                {/* Right page number */}
                <div className="absolute bottom-3 right-4 text-xs text-amber-400">
                  {rightPage ? `Page ${rightPage.pageNumber}` : ''}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Navigation Arrow */}
          <button
            onClick={() => {
              if (currentSpread >= totalSpreads - 1) {
                addNewPage()
              } else {
                nextSpread()
              }
            }}
            className="p-3 bg-white/80 dark:bg-neutral-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-neutral-700 z-10 flex-shrink-0 ml-4"
          >
            <ChevronRight className="h-6 w-6 text-amber-700 dark:text-amber-400" />
          </button>
        </div>

        {/* Page Scrubber */}
        <div className="flex-shrink-0">
          <PageScrubber
            currentPage={leftPageIndex + 1}
            totalPages={allPages.length}
            onPageChange={goToPage}
          />
        </div>
      </div>

      {/* AI Toolbar overlay */}
      <AnimatePresence>
        {isAIOpen && (
          <AIToolbar
            selectedText={selectedText}
            notebookId={notebookId}
            notebookTitle={notebook?.title}
            onApply={(text) => {
              setIsAIOpen(false)
            }}
            onClose={() => setIsAIOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Comments Panel — absolute overlay */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 right-0 bottom-0 w-80 z-30"
          >
            <CommentsPanel
              isOpen={isCommentsOpen}
              onClose={() => setIsCommentsOpen(false)}
              currentPage={currentPage}
              notebookId={notebookId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Sidebar — absolute overlay so it doesn't squeeze the book */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-[380px] z-30 flex">
            <ChatSidebar
              open={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              notebookId={notebookId}
              pages={pages}
              onNavigateToPage={goToPage}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
