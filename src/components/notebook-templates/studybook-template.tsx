"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Search, Youtube, Loader2, BookOpen, Play, Clock,
  Sparkles, ChevronRight, ExternalLink, FileText, Trash2, Code,
  Lightbulb, Target, CheckCircle2, Circle, Layers, Zap, RefreshCw,
  Plus, ChevronLeft, ChevronDown, ChevronUp, Pencil, X,
  BookMarked, FlaskConical, Timer, Star, Award, BarChart3,
  FolderOpen, Hash, AlignLeft, Copy, Check,
} from "lucide-react";

//  Types 

interface YouTubeVideo {
  id: string; title: string; channel: string;
  thumbnail: string; duration: string; url: string;
}

interface VideoNote {
  id: string; videoId: string; videoTitle: string; videoUrl: string;
  thumbnail: string; summary: string; keyPoints: string[];
  timestamps: { time: string; topic: string }[]; createdAt: string;
}

interface LessonExample {
  title: string;
  code?: string;
  explanation: string;
  language?: string;
}

interface LessonExercise {
  title: string;
  description: string;
  hint?: string;
  solution?: string;
}

interface Lesson {
  id: string;
  title: string;
  estimatedMinutes: number;
  explanation: string;          // multi-paragraph rich explanation
  keyPoints: string[];
  examples: LessonExample[];
  exercises: LessonExercise[];
  resources: string[];
  completed: boolean;
}

interface HandsOnProject {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  steps: string[];
  skills: string[];
  completed: boolean;
}

interface Chapter {
  id: string;
  title: string;
  overview: string;
  level: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  lessons: Lesson[];
  projects: HandsOnProject[];
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  topic: string;
  description: string;
  targetAudience: string;
  prerequisites: string[];
  totalHours: number;
  chapters: Chapter[];
  createdAt: string;
}

interface StudyProject {
  id: string;
  name: string;
  description: string;
  courses: Course[];
  videoNotes: VideoNote[];
  playgroundCode: string;
  createdAt: string;
}

interface StudyBookTemplateProps { title?: string; notebookId?: string; }

//  Constants 

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const LEVEL_COLORS = {
  beginner:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate: "bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400",
  advanced:     "bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400",
};

const DIFF_COLORS = {
  Beginner:     "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  Intermediate: "text-amber-600   bg-amber-50   dark:bg-amber-900/20",
  Advanced:     "text-red-600     bg-red-50     dark:bg-red-900/20",
};

const blankProject = (name = "My Study Project"): StudyProject => ({
  id: makeId(), name, description: "",
  courses: [], videoNotes: [], playgroundCode: `// Write your code here\nconsole.log("Hello, World!");`,
  createdAt: new Date().toISOString(),
});

//  Main Component 

export function StudyBookTemplate({ title = "Study Book", notebookId }: StudyBookTemplateProps) {
  //  Projects 
  const [projects, setProjects] = useState<StudyProject[]>([]);
  const [activeProjectId, _setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormName, setProjectFormName] = useState("");
  const [projectFormDesc, setProjectFormDesc] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  //  Tabs 
  const [activeTab, setActiveTab] = useState<"courses" | "search" | "notes" | "playground">("courses");

  //  Course state 
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [courseTopicInput, setCourseTopicInput] = useState("");
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [generatingStep, setGeneratingStep] = useState("");
  const [showSolutionId, setShowSolutionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  //  Search state 
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  //  Notes state 
  const [videoUrl, setVideoUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  //  Playground state 
  const [playgroundOutput, setPlaygroundOutput] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);

  //  DB refs 
  const pageIdRef    = useRef<string | null>(null);
  const saveRef      = useRef<NodeJS.Timeout | null>(null);
  const projectsRef  = useRef<StudyProject[]>([]);
  const activeIdRef  = useRef<string | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  const bumpSave = useCallback(() => setSaveVersion(v => v + 1), []);

  const setActiveProjectId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    _setActiveProjectId(id);
    setSelectedCourseId(null); setSelectedChapterId(null); setSelectedLessonId(null);
    setExpandedChapters(new Set());
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const selectedCourse = activeProject?.courses.find(c => c.id === selectedCourseId) ?? null;
  const selectedChapter = selectedCourse?.chapters.find(c => c.id === selectedChapterId) ?? null;
  const selectedLesson = selectedChapter?.lessons.find(l => l.id === selectedLessonId) ?? null;
  const selectedNote = activeProject?.videoNotes.find(n => n.id === selectedNoteId) ?? null;

  //  DB Load 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__studybook_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const data = JSON.parse(existing.content || "{}");
            const loaded: StudyProject[] = data.projects ?? [];
            projectsRef.current = loaded;
            setProjects(loaded);
            const aid = data.activeId ?? loaded[0]?.id ?? null;
            activeIdRef.current = aid;
            _setActiveProjectId(aid);
          } catch {}
        } else {
          const defaultProject = blankProject("My Study Project");
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__studybook_template__", content: JSON.stringify({ projects: [defaultProject], activeId: defaultProject.id }) }),
          });
          const created = await cr.json();
          pageIdRef.current = created.page?._id ?? null;
          projectsRef.current = [defaultProject];
          activeIdRef.current = defaultProject.id;
          setProjects([defaultProject]);
          _setActiveProjectId(defaultProject.id);
        }
      } catch (err) { console.error("Load failed:", err); }
      finally { setLoading(false); }
    })();
  }, [notebookId]);

  //  DB Save 
  useEffect(() => {
    if (saveVersion === 0 || !notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        let pid = pageIdRef.current;
        if (!pid) {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__studybook_template__", content: "{}" }),
          });
          const created = await cr.json();
          pid = created.page?._id ?? null;
          pageIdRef.current = pid;
        }
        if (!pid) return;
        await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "__studybook_template__", content: JSON.stringify({ projects: projectsRef.current, activeId: activeIdRef.current }) }),
        });
      } catch (err) { console.error("Save failed:", err); }
      finally { setSaving(false); }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveVersion, notebookId]);

  //  Project CRUD 
  const createProject = () => {
    if (!projectFormName.trim()) return;
    const p = blankProject(projectFormName.trim());
    p.description = projectFormDesc.trim();
    const next = [...projectsRef.current, p];
    projectsRef.current = next; activeIdRef.current = p.id;
    setProjects(next); bumpSave(); setActiveProjectId(p.id);
    setShowProjectForm(false); setProjectFormName(""); setProjectFormDesc("");
  };

  const saveEditProject = () => {
    if (!editingProjectId || !projectFormName.trim()) return;
    const next = projectsRef.current.map(p => p.id === editingProjectId ? { ...p, name: projectFormName.trim(), description: projectFormDesc.trim() } : p);
    projectsRef.current = next; setProjects(next); bumpSave();
    setEditingProjectId(null); setProjectFormName(""); setProjectFormDesc("");
  };

  const deleteProject = (id: string) => {
    const next = projectsRef.current.filter(p => p.id !== id);
    if (activeProjectId === id) {
      const newId = next[0]?.id ?? null;
      activeIdRef.current = newId; _setActiveProjectId(newId);
    }
    projectsRef.current = next; setProjects(next); bumpSave(); setConfirmDeleteId(null);
  };

  //  Update active project helper 
  const updateActiveProject = useCallback((patch: (p: StudyProject) => StudyProject) => {
    const next = projectsRef.current.map(p => p.id === activeIdRef.current ? patch(p) : p);
    projectsRef.current = next; setProjects(next); bumpSave();
  }, [bumpSave]);

  //  Course progress 
  const calcProgress = (course: Course) => {
    let total = 0; let done = 0;
    course.chapters.forEach(ch => {
      ch.lessons.forEach(l => { total++; if (l.completed) done++; });
      ch.projects.forEach(p => { total++; if (p.completed) done++; });
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const toggleLesson = (courseId: string, chapterId: string, lessonId: string) => {
    updateActiveProject(proj => ({
      ...proj,
      courses: proj.courses.map(c => c.id !== courseId ? c : {
        ...c,
        chapters: c.chapters.map(ch => ch.id !== chapterId ? ch : {
          ...ch,
          lessons: ch.lessons.map(l => l.id !== lessonId ? l : { ...l, completed: !l.completed }),
        }),
      }),
    }));
  };

  const toggleProject = (courseId: string, chapterId: string, projectId: string) => {
    updateActiveProject(proj => ({
      ...proj,
      courses: proj.courses.map(c => c.id !== courseId ? c : {
        ...c,
        chapters: c.chapters.map(ch => ch.id !== chapterId ? ch : {
          ...ch,
          projects: ch.projects.map(p => p.id !== projectId ? p : { ...p, completed: !p.completed }),
        }),
      }),
    }));
  };

  const deleteCourse = (courseId: string) => {
    updateActiveProject(proj => ({ ...proj, courses: proj.courses.filter(c => c.id !== courseId) }));
    setSelectedCourseId(null); setSelectedChapterId(null); setSelectedLessonId(null);
  };


  //  Course Generation 
  const generateCourse = async () => {
    if (!courseTopicInput.trim() || !activeProject) return;
    setIsGeneratingCourse(true); setCourseError(""); setGeneratingStep("Designing curriculum...");
    try {
      setGeneratingStep("Generating 8-10 chapter structure...");
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          message: `You are an expert curriculum designer. Create a COMPREHENSIVE, DETAILED course on "${courseTopicInput}" that covers 6-8 hours of learning content.

The course must have 8-10 chapters. Each chapter must have 3-5 lessons. Each lesson must be DETAILED and RICH  not one-liners.

Return ONLY valid JSON with this EXACT structure (no markdown, no explanation):
{
  "title": "Complete [Topic] Masterclass",
  "topic": "${courseTopicInput}",
  "description": "3-4 sentence comprehensive description of what students will learn and achieve",
  "targetAudience": "Who this course is for",
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "totalHours": 7,
  "chapters": [
    {
      "title": "Chapter 1: [Title]",
      "overview": "2-3 sentence overview of this chapter",
      "level": "beginner",
      "estimatedHours": 0.75,
      "lessons": [
        {
          "title": "Lesson 1.1: [Title]",
          "estimatedMinutes": 25,
          "explanation": "Write 4-6 detailed paragraphs explaining this topic thoroughly. Cover the concept deeply, why it matters, how it works internally, common misconceptions, and real-world context. This should read like a textbook chapter section.",
          "keyPoints": [
            "Key insight 1  explain it in a full sentence",
            "Key insight 2  explain it in a full sentence",
            "Key insight 3  explain it in a full sentence",
            "Key insight 4  explain it in a full sentence"
          ],
          "examples": [
            {
              "title": "Example: [descriptive name]",
              "explanation": "2-3 sentences explaining what this example demonstrates and why it is important",
              "code": "// Actual working code example\\nconst example = \\"value\\";\\nconsole.log(example);",
              "language": "javascript"
            },
            {
              "title": "Real-world Example: [name]",
              "explanation": "Explain a real-world scenario where this concept applies"
            }
          ],
          "exercises": [
            {
              "title": "Exercise: [name]",
              "description": "Detailed description of what the student should build or practice. Be specific about requirements.",
              "hint": "A helpful hint without giving away the solution",
              "solution": "// Solution code or detailed written solution\\nconsole.log(\\"solution\\");"
            }
          ],
          "resources": ["Official documentation link or book", "Recommended article or tutorial"]
        }
      ],
      "projects": [
        {
          "title": "Project: [name]",
          "description": "Detailed 3-4 sentence description of what the student will build, what technologies they will use, and what they will learn from building it",
          "difficulty": "Beginner",
          "steps": [
            "Step 1: Set up the project structure and install dependencies",
            "Step 2: Implement the core feature",
            "Step 3: Add error handling and edge cases",
            "Step 4: Test and refine the implementation"
          ],
          "skills": ["skill 1", "skill 2", "skill 3"]
        }
      ]
    }
  ]
}

REQUIREMENTS:
- Chapters 1-3: beginner level (estimatedHours: 0.5-1.0 each)
- Chapters 4-6: intermediate level (estimatedHours: 0.75-1.25 each)
- Chapters 7-10: advanced level (estimatedHours: 1.0-1.5 each)
- Total must be 6-8 hours of content
- Each lesson explanation must be 4-6 FULL paragraphs (not bullet points)
- Each lesson must have 2-3 code examples with actual working code
- Each lesson must have 1-2 exercises with hints and solutions
- Each chapter must have 1-2 hands-on projects with 4-6 detailed steps
- Make content specific to "${courseTopicInput}"  no generic placeholders`,
          context: [],
        }),
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setGeneratingStep("Parsing course content...");

      let courseData: any;
      try { courseData = JSON.parse(data.response); }
      catch {
        const match = data.response.match(/\{[\s\S]*\}/);
        if (match) courseData = JSON.parse(match[0]);
      }

      if (!courseData?.chapters?.length) throw new Error("Invalid course data");

      setGeneratingStep("Building course structure...");
      const newCourse: Course = {
        id: makeId(),
        title: courseData.title || `${courseTopicInput} Complete Course`,
        topic: courseData.topic || courseTopicInput,
        description: courseData.description || `Learn ${courseTopicInput} from basics to advanced`,
        targetAudience: courseData.targetAudience || "Anyone interested in learning",
        prerequisites: courseData.prerequisites || [],
        totalHours: courseData.totalHours || 7,
        createdAt: new Date().toISOString(),
        chapters: (courseData.chapters || []).map((ch: any, ci: number) => ({
          id: makeId(),
          title: ch.title || `Chapter ${ci + 1}`,
          overview: ch.overview || "",
          level: (["beginner","intermediate","advanced"].includes(ch.level) ? ch.level : ci < 3 ? "beginner" : ci < 6 ? "intermediate" : "advanced") as Chapter["level"],
          estimatedHours: ch.estimatedHours || 0.75,
          completed: false,
          lessons: (ch.lessons || []).map((l: any, li: number) => ({
            id: makeId(),
            title: l.title || `Lesson ${ci + 1}.${li + 1}`,
            estimatedMinutes: l.estimatedMinutes || 20,
            explanation: l.explanation || "",
            keyPoints: l.keyPoints || [],
            examples: (l.examples || []).map((e: any) => ({
              title: e.title || "Example",
              explanation: e.explanation || "",
              code: e.code || undefined,
              language: e.language || "javascript",
            })),
            exercises: (l.exercises || []).map((ex: any) => ({
              title: ex.title || "Exercise",
              description: ex.description || "",
              hint: ex.hint || undefined,
              solution: ex.solution || undefined,
            })),
            resources: l.resources || [],
            completed: false,
          })),
          projects: (ch.projects || []).map((p: any) => ({
            id: makeId(),
            title: p.title || "Project",
            description: p.description || "",
            difficulty: (["Beginner","Intermediate","Advanced"].includes(p.difficulty) ? p.difficulty : "Intermediate") as HandsOnProject["difficulty"],
            steps: p.steps || [],
            skills: p.skills || [],
            completed: false,
          })),
        })),
      };

      updateActiveProject(proj => ({ ...proj, courses: [newCourse, ...proj.courses] }));
      setSelectedCourseId(newCourse.id);
      setSelectedChapterId(newCourse.chapters[0]?.id ?? null);
      setSelectedLessonId(newCourse.chapters[0]?.lessons[0]?.id ?? null);
      setExpandedChapters(new Set([newCourse.chapters[0]?.id ?? ""]));
      setCourseTopicInput(""); setActiveTab("courses");
    } catch (err) {
      console.error("Course generation error:", err);
      setCourseError("Failed to generate course. Please try again.");
    } finally {
      setIsGeneratingCourse(false); setGeneratingStep("");
    }
  };

  //  YouTube Search 
  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true); setSearchError(""); setSearchResults([]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          message: `Suggest 6 real YouTube courses/tutorials for learning "${searchQuery}". Use real channel names like freeCodeCamp.org, Traversy Media, The Net Ninja, Fireship, Academind, Programming with Mosh. Return ONLY a valid JSON array: [{"title":"Full Course Title","channel":"Channel Name","duration":"1:30:00"}]`,
          context: [],
        }),
      });
      const data = await response.json();
      let suggestions: any[] = [];
      try { suggestions = JSON.parse(data.response); }
      catch { const m = data.response.match(/\[[\s\S]*?\]/); if (m) suggestions = JSON.parse(m[0]); }
      if (suggestions.length > 0) {
        setSearchResults(suggestions.map((s: any, i: number) => ({
          id: `yt-${Date.now()}-${i}`, title: s.title || `${searchQuery} Tutorial ${i + 1}`,
          channel: s.channel || "Educational Channel",
          thumbnail: `https://picsum.photos/seed/${encodeURIComponent(searchQuery)}${i}/320/180`,
          duration: s.duration || "30:00",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(s.title + " " + s.channel)}`,
        })));
      } else { setSearchResults(getDefaultResults(searchQuery)); }
    } catch { setSearchError("Search failed."); setSearchResults(getDefaultResults(searchQuery)); }
    finally { setIsSearching(false); }
  };

  const getDefaultResults = (q: string): YouTubeVideo[] => [
    { id: "1", title: `${q} - Complete Beginner Course`, channel: "freeCodeCamp.org", thumbnail: `https://picsum.photos/seed/${q}1/320/180`, duration: "4:30:00", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " complete course")}` },
    { id: "2", title: `${q} Crash Course`, channel: "Traversy Media", thumbnail: `https://picsum.photos/seed/${q}2/320/180`, duration: "1:45:00", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " crash course")}` },
    { id: "3", title: `${q} Full Tutorial`, channel: "Programming with Mosh", thumbnail: `https://picsum.photos/seed/${q}3/320/180`, duration: "2:15:00", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " tutorial")}` },
  ];

  //  Video Notes 
  const extractVideoSummary = async () => {
    if (!videoUrl.trim() || !activeProject) return;
    setIsExtracting(true); setExtractError("");
    try {
      const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : "unknown";
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          message: `Analyze this YouTube video URL and create detailed study notes: ${videoUrl}\n\nReturn ONLY valid JSON:\n{"title":"Video title","summary":"3-4 paragraph comprehensive summary","keyPoints":["point 1","point 2","point 3","point 4","point 5"],"timestamps":[{"time":"0:00","topic":"Introduction"},{"time":"5:00","topic":"Core Concept"}]}`,
          context: [],
        }),
      });
      const data = await response.json();
      let extracted: any;
      try { extracted = JSON.parse(data.response); }
      catch { const m = data.response.match(/\{[\s\S]*\}/); if (m) extracted = JSON.parse(m[0]); }
      if (extracted) {
        const newNote: VideoNote = {
          id: makeId(), videoId, videoTitle: extracted.title || "Video Notes", videoUrl,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          summary: extracted.summary || "", keyPoints: extracted.keyPoints || [],
          timestamps: extracted.timestamps || [], createdAt: new Date().toISOString(),
        };
        updateActiveProject(proj => ({ ...proj, videoNotes: [newNote, ...proj.videoNotes] }));
        setSelectedNoteId(newNote.id); setVideoUrl(""); setActiveTab("notes");
      }
    } catch { setExtractError("Failed to extract notes. Please try again."); }
    finally { setIsExtracting(false); }
  };

  //  Code Playground 
  const runCode = async () => {
    if (!activeProject?.playgroundCode.trim()) return;
    setIsRunningCode(true); setPlaygroundOutput("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          message: `Analyze this code:\n\`\`\`\n${activeProject.playgroundCode}\n\`\`\`\n\nProvide:\n1. What the code does\n2. Expected output\n3. Any bugs or improvements\n\nBe concise and educational.`,
          context: [],
        }),
      });
      const data = await response.json();
      setPlaygroundOutput(data.response || "Unable to analyze code.");
    } catch { setPlaygroundOutput("Error analyzing code. Please try again."); }
    finally { setIsRunningCode(false); }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };


  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex overflow-hidden">
      {saving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-xs px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500"/> Saving...
        </div>
      )}

      {/*  Project Sidebar  */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden z-20">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-3.5 h-3.5 text-white"/>
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{title}</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                  <ChevronLeft className="w-4 h-4"/>
                </button>
              </div>
              <button onClick={() => { setProjectFormName(""); setProjectFormDesc(""); setShowProjectForm(true); setEditingProjectId(null); }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4"/> New Project
              </button>
            </div>

            {(showProjectForm || editingProjectId) && (
              <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
                <input value={projectFormName} onChange={e => setProjectFormName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (editingProjectId ? saveEditProject() : createProject())}
                  placeholder="Project name" autoFocus
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm border border-neutral-200 dark:border-neutral-700"/>
                <input value={projectFormDesc} onChange={e => setProjectFormDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm border border-neutral-200 dark:border-neutral-700"/>
                <div className="flex gap-2">
                  <button onClick={editingProjectId ? saveEditProject : createProject} disabled={!projectFormName.trim()}
                    className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg text-xs font-medium">
                    {editingProjectId ? "Save" : "Create"}
                  </button>
                  <button onClick={() => { setShowProjectForm(false); setEditingProjectId(null); }}
                    className="px-3 py-1.5 text-neutral-400 text-xs">Cancel</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              {projects.length === 0 && <p className="text-xs text-neutral-400 italic px-2 py-4">No projects yet</p>}
              {projects.map(p => (
                <div key={p.id} className={`rounded-xl mb-1 transition-all ${p.id === activeProjectId ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                  <div className="flex items-center gap-2 p-2.5 group cursor-pointer" onClick={() => setActiveProjectId(p.id)}>
                    <FolderOpen className={`w-4 h-4 flex-shrink-0 ${p.id === activeProjectId ? "text-blue-500" : "text-neutral-400"}`}/>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${p.id === activeProjectId ? "text-blue-700 dark:text-blue-300" : "text-neutral-700 dark:text-neutral-300"}`}>{p.name}</p>
                      <p className="text-[10px] text-neutral-400">{p.courses.length} course{p.courses.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); setProjectFormName(p.name); setProjectFormDesc(p.description); setEditingProjectId(p.id); setShowProjectForm(false); }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"><Pencil className="w-3 h-3"/></button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(confirmDeleteId === p.id ? null : p.id); }}
                        className={`p-1 rounded transition-colors ${confirmDeleteId === p.id ? "bg-red-100 text-red-500" : "hover:bg-red-50 text-neutral-400 hover:text-red-500"}`}>
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  {confirmDeleteId === p.id && (
                    <div className="px-2.5 pb-2.5">
                      <p className="text-[11px] text-red-500 font-medium mb-1.5">Delete &quot;{p.name}&quot;?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => deleteProject(p.id)} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium">Delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded-lg text-xs">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  Main  */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="px-4 py-3 flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                <ChevronRight className="w-4 h-4"/>
              </button>
            )}
            {activeProject && (
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-neutral-900 dark:text-white truncate">{activeProject.name}</h1>
                <p className="text-xs text-neutral-500">{activeProject.courses.length} courses  {activeProject.videoNotes.length} notes</p>
              </div>
            )}
            {!activeProject && <h1 className="font-bold text-neutral-900 dark:text-white flex-1">{title}</h1>}
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              {([
                ["courses", "My Courses", BookOpen],
                ["search",  "Find Courses", Search],
                ["notes",   "Video Notes", FileText],
                ["playground", "Code Lab", Code],
              ] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === id ? "bg-white dark:bg-neutral-700 text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                  <Icon className="w-3.5 h-3.5"/><span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* No project */}
          {!activeProject && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-10 h-10 text-white"/>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Create a Study Project</h2>
              <p className="text-neutral-500 mb-8 max-w-sm">Organise your learning with AI-generated courses, video notes, and a code playground.</p>
              <button onClick={() => { setProjectFormName(""); setProjectFormDesc(""); setShowProjectForm(true); setSidebarOpen(true); }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 flex items-center gap-2">
                <Plus className="w-5 h-5"/> New Project
              </button>
            </div>
          )}


          {/* ── Courses Tab ── */}
          {activeProject && activeTab === "courses" && (
            <div className="flex h-full min-h-[600px]">
              <div className="w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-900">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h2 className="font-semibold text-neutral-900 dark:text-white text-sm mb-3">Courses ({activeProject.courses.length})</h2>
                  <div className="space-y-2">
                    <input value={courseTopicInput} onChange={e => setCourseTopicInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && generateCourse()}
                      placeholder="e.g. React Hooks, Python ML..." disabled={isGeneratingCourse}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm border border-neutral-200 dark:border-neutral-700 disabled:opacity-50"/>
                    <button onClick={generateCourse} disabled={isGeneratingCourse || !courseTopicInput.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all">
                      {isGeneratingCourse ? <><Loader2 className="w-4 h-4 animate-spin"/> Generating...</> : <><Sparkles className="w-4 h-4"/> Generate Course</>}
                    </button>
                    {isGeneratingCourse && generatingStep && (
                      <p className="text-[10px] text-purple-500 text-center animate-pulse">{generatingStep}</p>
                    )}
                    {courseError && <p className="text-xs text-red-500">{courseError}</p>}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                  {activeProject.courses.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 text-neutral-200"/>
                      <p className="text-xs text-neutral-400">No courses yet.<br/>Generate one above!</p>
                    </div>
                  )}
                  {activeProject.courses.map(course => {
                    const pct = calcProgress(course);
                    return (
                      <button key={course.id}
                        onClick={() => { setSelectedCourseId(course.id); setSelectedChapterId(course.chapters[0]?.id ?? null); setSelectedLessonId(null); setExpandedChapters(new Set([course.chapters[0]?.id ?? ""])); }}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${selectedCourseId === course.id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-200"}`}>
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-2">{course.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3 h-3 text-neutral-400"/>
                          <span className="text-[10px] text-neutral-400">{course.totalHours}h · {course.chapters.length} chapters</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-neutral-400 mb-1"><span>Progress</span><span>{pct}%</span></div>
                          <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedCourse ? (
                <div className="flex flex-1 min-w-0 overflow-hidden">
                  <div className="w-64 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 overflow-y-auto">
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Chapters</h3>
                        <button onClick={() => deleteCourse(selectedCourse.id)} className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{selectedCourse.title}</p>
                    </div>
                    <div className="p-2">
                      {selectedCourse.chapters.map((ch, ci) => {
                        const chDone = ch.lessons.filter(l => l.completed).length;
                        const isExpanded = expandedChapters.has(ch.id);
                        return (
                          <div key={ch.id} className="mb-1">
                            <button
                              onClick={() => {
                                setExpandedChapters(prev => { const s = new Set(prev); s.has(ch.id) ? s.delete(ch.id) : s.add(ch.id); return s; });
                                setSelectedChapterId(ch.id); setSelectedLessonId(null);
                              }}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${selectedChapterId === ch.id ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                              <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${LEVEL_COLORS[ch.level]}`}>{ci + 1}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{ch.title.replace(/^Chapter \d+:\s*/i, "")}</p>
                                <p className="text-[10px] text-neutral-400">{chDone}/{ch.lessons.length} lessons</p>
                              </div>
                              {isExpanded ? <ChevronUp className="w-3 h-3 text-neutral-400 flex-shrink-0"/> : <ChevronDown className="w-3 h-3 text-neutral-400 flex-shrink-0"/>}
                            </button>
                            {isExpanded && (
                              <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-neutral-200 dark:border-neutral-700 pl-2">
                                {ch.lessons.map(l => (
                                  <button key={l.id}
                                    onClick={() => { setSelectedChapterId(ch.id); setSelectedLessonId(l.id); }}
                                    className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-colors ${selectedLessonId === l.id ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}>
                                    {l.completed ? <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0"/> : <Circle className="w-3 h-3 text-neutral-300 flex-shrink-0"/>}
                                    <span className="text-[11px] truncate">{l.title.replace(/^Lesson \d+\.\d+:\s*/i, "")}</span>
                                    <span className="text-[10px] text-neutral-400 ml-auto flex-shrink-0">{l.estimatedMinutes}m</span>
                                  </button>
                                ))}
                                {ch.projects.map(p => (
                                  <button key={p.id}
                                    onClick={() => { setSelectedChapterId(ch.id); setSelectedLessonId("proj-" + p.id); }}
                                    className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-colors ${selectedLessonId === "proj-" + p.id ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}>
                                    {p.completed ? <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0"/> : <FlaskConical className="w-3 h-3 text-purple-400 flex-shrink-0"/>}
                                    <span className="text-[11px] truncate">{p.title.replace(/^Project:\s*/i, "")}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-neutral-950">
                    {selectedLesson && selectedChapter && (
                      <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${LEVEL_COLORS[selectedChapter.level]}`}>{selectedChapter.level}</span>
                              <span className="text-xs text-neutral-400 flex items-center gap-1"><Timer className="w-3 h-3"/>{selectedLesson.estimatedMinutes} min</span>
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedLesson.title}</h1>
                            <p className="text-sm text-neutral-500 mt-1">{selectedChapter.title}</p>
                          </div>
                          <button onClick={() => toggleLesson(selectedCourse.id, selectedChapter.id, selectedLesson.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${selectedLesson.completed ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-blue-100 hover:text-blue-700"}`}>
                            {selectedLesson.completed ? <><CheckCircle2 className="w-4 h-4"/> Completed</> : <><Circle className="w-4 h-4"/> Mark Complete</>}
                          </button>
                        </div>

                        {selectedLesson.explanation && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <AlignLeft className="w-4 h-4 text-blue-500"/>
                              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Explanation</h2>
                            </div>
                            <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4 text-sm">
                              {selectedLesson.explanation.split("\n\n").filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
                            </div>
                          </div>
                        )}

                        {selectedLesson.keyPoints.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-blue-500"/><h2 className="text-base font-semibold text-neutral-900 dark:text-white">Key Points</h2></div>
                            <ul className="space-y-2">
                              {selectedLesson.keyPoints.map((kp, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                  <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"/>{kp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedLesson.examples.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500"/><h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Examples</h2></div>
                            {selectedLesson.examples.map((ex, i) => (
                              <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20">
                                  <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{ex.title}</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{ex.explanation}</p>
                                  {ex.code && (
                                    <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                                        <span className="text-xs text-neutral-400 font-mono">{ex.language || "code"}</span>
                                        <button onClick={() => copyCode(ex.code!, `ex-${i}`)} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors">
                                          {copiedId === `ex-${i}` ? <><Check className="w-3 h-3 text-green-400"/> Copied</> : <><Copy className="w-3 h-3"/> Copy</>}
                                        </button>
                                      </div>
                                      <pre className="bg-neutral-950 text-green-400 font-mono text-xs p-4 overflow-x-auto leading-relaxed">{ex.code}</pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedLesson.exercises.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-purple-500"/><h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Exercises</h2></div>
                            {selectedLesson.exercises.map((ex, i) => (
                              <div key={i} className="rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10 p-5 space-y-3">
                                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{ex.title}</h3>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">{ex.description}</p>
                                {ex.hint && (
                                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-900/30">
                                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
                                    <p className="text-xs text-amber-700 dark:text-amber-300"><strong>Hint:</strong> {ex.hint}</p>
                                  </div>
                                )}
                                {ex.solution && (
                                  <div>
                                    <button onClick={() => setShowSolutionId(showSolutionId === `${selectedLesson.id}-${i}` ? null : `${selectedLesson.id}-${i}`)}
                                      className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                      {showSolutionId === `${selectedLesson.id}-${i}` ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                                      {showSolutionId === `${selectedLesson.id}-${i}` ? "Hide Solution" : "Show Solution"}
                                    </button>
                                    {showSolutionId === `${selectedLesson.id}-${i}` && (
                                      <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                                          <span className="text-xs text-neutral-400 font-mono">solution</span>
                                          <button onClick={() => copyCode(ex.solution!, `sol-${i}`)} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white">
                                            {copiedId === `sol-${i}` ? <><Check className="w-3 h-3 text-green-400"/> Copied</> : <><Copy className="w-3 h-3"/> Copy</>}
                                          </button>
                                        </div>
                                        <pre className="bg-neutral-950 text-green-400 font-mono text-xs p-4 overflow-x-auto leading-relaxed">{ex.solution}</pre>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedLesson.resources.length > 0 && (
                          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2 mb-3"><BookMarked className="w-4 h-4 text-indigo-500"/><h2 className="text-base font-semibold text-neutral-900 dark:text-white">Resources</h2></div>
                            <ul className="space-y-1.5">
                              {selectedLesson.resources.map((r, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                  <Hash className="w-3 h-3 text-neutral-400 flex-shrink-0"/>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <button onClick={() => toggleLesson(selectedCourse.id, selectedChapter.id, selectedLesson.id)}
                            className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${selectedLesson.completed ? "bg-green-500 hover:bg-green-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
                            {selectedLesson.completed ? "Completed" : "Mark as Complete"}
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedChapter && selectedLessonId?.startsWith("proj-") && (() => {
                      const projId = selectedLessonId.replace("proj-", "");
                      const proj = selectedChapter.projects.find(p => p.id === projId);
                      if (!proj) return null;
                      return (
                        <div className="max-w-3xl mx-auto space-y-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FlaskConical className="w-5 h-5 text-purple-500"/>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[proj.difficulty]}`}>{proj.difficulty}</span>
                              </div>
                              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{proj.title}</h1>
                              <p className="text-sm text-neutral-500 mt-1">{selectedChapter.title}</p>
                            </div>
                            <button onClick={() => toggleProject(selectedCourse.id, selectedChapter.id, proj.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${proj.completed ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}>
                              {proj.completed ? <><CheckCircle2 className="w-4 h-4"/> Completed</> : <><Circle className="w-4 h-4"/> Mark Complete</>}
                            </button>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/30">
                            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{proj.description}</p>
                          </div>
                          {proj.skills.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500"/> Skills You Will Practice</h3>
                              <div className="flex flex-wrap gap-2">
                                {proj.skills.map((s, i) => <span key={i} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">{s}</span>)}
                              </div>
                            </div>
                          )}
                          {proj.steps.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-blue-500"/> Project Steps</h3>
                              <div className="space-y-3">
                                {proj.steps.map((step, i) => (
                                  <div key={i} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {!selectedLessonId && selectedCourse && (
                      <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                          <h1 className="text-2xl font-bold mb-2">{selectedCourse.title}</h1>
                          <p className="text-blue-100 text-sm leading-relaxed">{selectedCourse.description}</p>
                          <div className="grid grid-cols-3 gap-4 mt-5">
                            <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{selectedCourse.totalHours}h</p><p className="text-xs text-blue-200">Total Content</p></div>
                            <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{selectedCourse.chapters.length}</p><p className="text-xs text-blue-200">Chapters</p></div>
                            <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{calcProgress(selectedCourse)}%</p><p className="text-xs text-blue-200">Complete</p></div>
                          </div>
                        </div>
                        {selectedCourse.prerequisites.length > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/30">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> Prerequisites</h3>
                            <ul className="space-y-1">{selectedCourse.prerequisites.map((p, i) => <li key={i} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2"><ChevronRight className="w-3 h-3 text-amber-500"/>{p}</li>)}</ul>
                          </div>
                        )}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500"/> Chapter Overview</h3>
                          {selectedCourse.chapters.map((ch, ci) => {
                            const done = ch.lessons.filter(l => l.completed).length;
                            return (
                              <button key={ch.id}
                                onClick={() => { setSelectedChapterId(ch.id); setSelectedLessonId(ch.lessons[0]?.id ?? null); setExpandedChapters(prev => new Set([...prev, ch.id])); }}
                                className="w-full flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-200 transition-colors text-left">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${LEVEL_COLORS[ch.level]}`}>{ci + 1}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-neutral-900 dark:text-white text-sm">{ch.title}</p>
                                  <p className="text-xs text-neutral-500 mt-0.5">{ch.lessons.length} lessons · {ch.estimatedHours}h · {done}/{ch.lessons.length} done</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0"/>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-400">
                  <div className="text-center"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20"/><p className="text-sm">Select or generate a course</p></div>
                </div>
              )}
            </div>
          )}


          {/*  Search Tab  */}
          {activeProject && activeTab === "search" && (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500"/> Find Learning Resources
                </h2>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"/>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && searchYouTube()}
                      placeholder="What do you want to learn? (e.g. React, Python, ML)"
                      className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                  </div>
                  <button onClick={searchYouTube} disabled={isSearching || !searchQuery.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>} Search
                  </button>
                </div>
                {searchError && <p className="text-amber-600 text-xs mt-2">{searchError}</p>}
              </div>

              {searchResults.length > 0 && (
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">Results for &quot;{searchQuery}&quot;</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map(video => (
                      <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer"
                        className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all group">
                        <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover"/>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-10 h-10 text-white"/>
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">{video.duration}</span>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-neutral-900 dark:text-white text-sm line-clamp-2 mb-1">{video.title}</h4>
                          <p className="text-xs text-neutral-500 flex items-center gap-1"><Youtube className="w-3 h-3"/> {video.channel}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500"/> Extract Notes from Video
                </h2>
                <p className="text-neutral-500 text-xs mb-4">Paste a YouTube URL to generate AI-powered study notes</p>
                <div className="flex gap-3">
                  <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                  <button onClick={extractVideoSummary} disabled={isExtracting || !videoUrl.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
                    {isExtracting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>} Extract
                  </button>
                </div>
                {extractError && <p className="text-red-500 text-xs mt-2">{extractError}</p>}
              </div>
            </div>
          )}

          {/*  Notes Tab  */}
          {activeProject && activeTab === "notes" && (
            <div className="flex h-full min-h-[600px]">
              <div className="w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-y-auto">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h2 className="font-semibold text-neutral-900 dark:text-white text-sm mb-3">Video Notes ({activeProject.videoNotes.length})</h2>
                  <div className="flex gap-2">
                    <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                      placeholder="YouTube URL..." className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-xs"/>
                    <button onClick={extractVideoSummary} disabled={isExtracting || !videoUrl.trim()}
                      className="p-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl transition-colors">
                      {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                  {extractError && <p className="text-red-500 text-[10px] mt-1">{extractError}</p>}
                </div>
                <div className="p-3 space-y-2">
                  {activeProject.videoNotes.length === 0 && (
                    <div className="text-center py-8"><FileText className="w-8 h-8 mx-auto mb-2 text-neutral-200"/><p className="text-xs text-neutral-400">No notes yet</p></div>
                  )}
                  {activeProject.videoNotes.map(note => (
                    <button key={note.id} onClick={() => setSelectedNoteId(note.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedNoteId === note.id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-200"}`}>
                      <div className="flex gap-2">
                        <img src={note.thumbnail} alt="" className="w-16 h-10 object-cover rounded flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white text-xs line-clamp-2">{note.videoTitle}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(note.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-neutral-950">
                {selectedNote ? (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-start gap-4">
                      <img src={selectedNote.thumbnail} alt="" className="w-40 h-24 object-cover rounded-xl flex-shrink-0"/>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{selectedNote.videoTitle}</h2>
                        <a href={selectedNote.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs flex items-center gap-1">Watch on YouTube <ExternalLink className="w-3 h-3"/></a>
                      </div>
                      <button onClick={() => { updateActiveProject(p => ({ ...p, videoNotes: p.videoNotes.filter(n => n.id !== selectedNote.id) })); setSelectedNoteId(null); }}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500"/> Summary</h3>
                      <div className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed space-y-3">
                        {selectedNote.summary.split("\n\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                      </div>
                    </div>
                    {selectedNote.keyPoints.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-green-500"/> Key Points</h3>
                        <ul className="space-y-2">{selectedNote.keyPoints.map((kp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                            <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"/>{kp}
                          </li>
                        ))}</ul>
                      </div>
                    )}
                    {selectedNote.timestamps.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500"/> Timestamps</h3>
                        <div className="space-y-2">{selectedNote.timestamps.map((ts, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="text-blue-500 font-mono text-xs w-12 flex-shrink-0">{ts.time}</span>
                            <span className="text-neutral-600 dark:text-neutral-400">{ts.topic}</span>
                          </div>
                        ))}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-400">
                    <div className="text-center"><FileText className="w-12 h-12 mx-auto mb-4 opacity-30"/><p className="text-sm">Select a note to view</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/*  Playground Tab  */}
          {activeProject && activeTab === "playground" && (
            <div className="p-6 grid grid-cols-2 gap-6 h-full min-h-[600px]">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                  <h2 className="font-semibold text-neutral-900 dark:text-white text-sm flex items-center gap-2"><Code className="w-4 h-4 text-blue-500"/> Code Editor</h2>
                  <button onClick={runCode} disabled={isRunningCode}
                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50">
                    {isRunningCode ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Play className="w-3.5 h-3.5"/>} Analyze
                  </button>
                </div>
                <textarea value={activeProject.playgroundCode}
                  onChange={e => updateActiveProject(p => ({ ...p, playgroundCode: e.target.value }))}
                  className="flex-1 bg-neutral-950 text-green-400 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                  spellCheck={false}/>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                  <h2 className="font-semibold text-neutral-900 dark:text-white text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500"/> AI Analysis</h2>
                </div>
                <div className="flex-1 bg-neutral-50 dark:bg-neutral-800 p-4 overflow-auto">
                  {isRunningCode ? (
                    <div className="flex items-center gap-2 text-neutral-400 text-sm"><Loader2 className="w-4 h-4 animate-spin"/> Analyzing...</div>
                  ) : playgroundOutput ? (
                    <pre className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{playgroundOutput}</pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-400">
                      <div className="text-center"><Code className="w-10 h-10 mx-auto mb-3 opacity-30"/><p className="text-sm">Write code and click Analyze</p></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


