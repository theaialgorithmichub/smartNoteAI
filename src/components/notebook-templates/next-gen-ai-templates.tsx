"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Brain,
  CalendarDays,
  Camera,
  Download,
  FileAudio,
  FileJson,
  FileText,
  Languages,
  Loader2,
  Music,
  Sparkles,
  TrendingUp,
  Upload,
  Video,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { TemplateFooter } from "./template-footer";

type NextGenTemplateId =
  | "project-builder"
  | "second-brain-daily-log"
  | "narrative-storyboard"
  | "piano-virtuoso"
  | "dev-flow-architect"
  | "cinematic-storyboarder"
  | "meeting-strategist"
  | "research-synthesizer"
  | "workflow-automator"
  | "stock-pulse"
  | "language-bridge"
  | "carrom-coach";

interface NextGenTemplateProps {
  title: string;
  notebookId?: string;
  templateId: NextGenTemplateId;
}

interface DailyLogEntry {
  brainDump: string;
  bigThree: string;
  interstitials: string;
  dailyWin: string;
}

interface StoryboardPanel {
  panel: number;
  angle: string;
  prompt: string;
  imageUrl?: string;
}

interface ResearchSource {
  title: string;
  url: string;
}

interface ResearchResponse {
  response: string;
  sources?: ResearchSource[];
}

const DEFAULT_FIELDS: Record<NextGenTemplateId, Record<string, string>> = {
  "project-builder": {
    vision: "",
    parkingLot: "",
    techStack: "",
    requirements: "",
    userStories: "",
  },
  "second-brain-daily-log": {
    selectedDate: new Date().toISOString().slice(0, 10),
    brainDump: "",
    bigThree: "",
    interstitials: "",
    dailyWin: "",
  },
  "narrative-storyboard": {
    sceneNo: "Scene 04",
    location: "INT. Studio Apartment",
    timeOfDay: "Night",
    characters: "Roy, Elias",
    shotType: "Wide",
    cameraAngle: "Eye Level",
    cameraMovement: "Static",
    action: "",
    dialogue: "",
    transitions: "Cut to",
    audio: "",
    lighting: "",
    props: "",
    lensChoice: "35mm",
    estimatedDuration: "8s",
    fg: "",
    mg: "",
    bg: "",
    subjectMotion: "",
    shotNumber: "A",
    generatedNotes: "",
  },
  "piano-virtuoso": {
    youtubeUrl: "",
    sheetMusic: "",
    midiDraft: "",
    practiceTip: "",
  },
  "dev-flow-architect": {
    codeSnippet: "",
    mermaidFlow: "",
    plainEnglish: "",
  },
  "cinematic-storyboarder": {
    sceneDescription: "",
  },
  "meeting-strategist": {
    transcriptInput: "",
    diarizedTranscript: "",
    summaryTable: "",
    sentiment: "",
  },
  "research-synthesizer": {
    sourceText: "",
    faq: "",
    onePageSummary: "",
    citedFacts: "",
  },
  "workflow-automator": {
    automationIdea: "",
    workflowJson: "",
  },
  "stock-pulse": {
    tickers: "",
    pulseSummary: "",
  },
  "language-bridge": {
    malayalamInput: "",
    malayalamTranscript: "",
    screenplayEnglish: "",
  },
  "carrom-coach": {
    videoContext: "",
    strikeAngle: "",
    predictedPath: "",
    aiTips: "",
  },
};

function downloadTextFile(fileName: string, content: string, contentType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function safeParseJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function callAIPromptStudio(systemPrompt: string, prompt: string, userInput: string): Promise<string> {
  const res = await fetch("/api/ai-prompt-studio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemPrompt,
      prompt,
      userInput,
      model: "gpt-4-turbo",
      temperature: 0.3,
      maxTokens: 1800,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "AI request failed");
  }
  return data.output || "";
}

export function NextGenAITemplate({ title, notebookId, templateId }: NextGenTemplateProps) {
  const storageKey = useMemo(
    () => (notebookId ? `next-gen-template:${templateId}:${notebookId}` : null),
    [notebookId, templateId]
  );

  const [fields, setFields] = useState<Record<string, string>>(() => ({ ...DEFAULT_FIELDS[templateId] }));
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLogEntry>>({});
  const [storyboardPanels, setStoryboardPanels] = useState<StoryboardPanel[]>([]);
  const [researchSources, setResearchSources] = useState<ResearchSource[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        fields?: Record<string, string>;
        dailyLogs?: Record<string, DailyLogEntry>;
        storyboardPanels?: StoryboardPanel[];
        researchSources?: ResearchSource[];
        uploadedFileName?: string;
      };
      if (parsed.fields) {
        setFields((prev) => ({ ...prev, ...parsed.fields }));
      }
      setDailyLogs(parsed.dailyLogs || {});
      setStoryboardPanels(parsed.storyboardPanels || []);
      setResearchSources(parsed.researchSources || []);
      setUploadedFileName(parsed.uploadedFileName || "");
    } catch {
      // Ignore malformed local data.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const payload = JSON.stringify({
      fields,
      dailyLogs,
      storyboardPanels,
      researchSources,
      uploadedFileName,
    });
    localStorage.setItem(storageKey, payload);
  }, [dailyLogs, fields, researchSources, storyboardPanels, storageKey, uploadedFileName]);

  const setField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const runAI = async (key: string, systemPrompt: string, prompt: string, userInput: string) => {
    setLoadingKey(key);
    setStatusMessage("");
    try {
      const output = await callAIPromptStudio(systemPrompt, prompt, userInput);
      return output.trim();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "AI call failed");
      return "";
    } finally {
      setLoadingKey(null);
    }
  };

  const renderHeader = (subtitle: string) => (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-indigo-200 mt-1">{subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
          <Sparkles className="h-3.5 w-3.5" />
          AI Powered Template
        </div>
      </div>
    </div>
  );

  const loading = (key: string) => loadingKey === key;

  const generateProjectStack = async () => {
    const output = await runAI(
      "stack",
      "You are a principal solution architect.",
      "Suggest a modern tech stack with framework, database, tooling, deployment and why each choice fits this product vision.",
      `Product vision: ${fields.vision}`
    );
    if (output) setField("techStack", output);
  };

  const generateProjectRequirements = async () => {
    const output = await runAI(
      "requirements",
      "You write concise product requirement documents.",
      "Create an MVP requirement document with scope, modules, milestones, acceptance criteria, and non-functional requirements.",
      `Vision: ${fields.vision}\nTech stack draft: ${fields.techStack}`
    );
    if (output) setField("requirements", output);
  };

  const generateUserStories = async () => {
    const output = await runAI(
      "stories",
      "You are a product manager creating user stories.",
      "Generate user stories with acceptance criteria in markdown bullet format.",
      `Vision: ${fields.vision}`
    );
    if (output) setField("userStories", output);
  };

  const downloadProjectPdf = async () => {
    if (!fields.requirements.trim()) {
      setStatusMessage("Generate requirements first before downloading PDF.");
      return;
    }
    const { PDFExporter } = await import("@/lib/pdf-export");
    const exporter = new PDFExporter({
      title: `${title} - Requirements`,
      author: "SmartNote AI",
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
    });
    exporter.addHeading("Project Vision", 2);
    exporter.addText(fields.vision || "Not provided");
    exporter.addHeading("AI Suggested Tech Stack", 2);
    exporter.addText(fields.techStack || "Not generated");
    exporter.addHeading("Requirements Document", 2);
    exporter.addText(fields.requirements);
    exporter.addHeading("User Stories", 2);
    exporter.addText(fields.userStories || "Not generated");
    exporter.addHeading("Parking Lot", 2);
    exporter.addText(fields.parkingLot || "No parking lot items");
    exporter.save(`${title.replace(/\s+/g, "_")}_requirements.pdf`);
  };

  const saveDailyLog = () => {
    const date = fields.selectedDate || new Date().toISOString().slice(0, 10);
    const next: DailyLogEntry = {
      brainDump: fields.brainDump || "",
      bigThree: fields.bigThree || "",
      interstitials: fields.interstitials || "",
      dailyWin: fields.dailyWin || "",
    };
    setDailyLogs((prev) => ({ ...prev, [date]: next }));
    setStatusMessage(`Saved daily log for ${date}.`);
  };

  const loadDailyLog = (date: string) => {
    setField("selectedDate", date);
    const entry = dailyLogs[date];
    setField("brainDump", entry?.brainDump || "");
    setField("bigThree", entry?.bigThree || "");
    setField("interstitials", entry?.interstitials || "");
    setField("dailyWin", entry?.dailyWin || "");
  };

  const generateBigThree = async () => {
    const output = await runAI(
      "big-three",
      "You are a productivity coach.",
      "From this brain dump, pick the top 3 must-do tasks today. Return exactly 3 short bullet points.",
      fields.brainDump
    );
    if (output) setField("bigThree", output);
  };

  const generateStoryboardNotes = async () => {
    const output = await runAI(
      "storyboard-notes",
      "You are an assistant director creating shot breakdowns.",
      "Generate production-ready notes with continuity, camera setup, and sound cues.",
      JSON.stringify({
        sceneNo: fields.sceneNo,
        shotNumber: fields.shotNumber,
        location: fields.location,
        timeOfDay: fields.timeOfDay,
        characters: fields.characters,
        shotType: fields.shotType,
        cameraAngle: fields.cameraAngle,
        cameraMovement: fields.cameraMovement,
        action: fields.action,
        dialogue: fields.dialogue,
        transitions: fields.transitions,
        audio: fields.audio,
        lighting: fields.lighting,
        props: fields.props,
        lensChoice: fields.lensChoice,
        estimatedDuration: fields.estimatedDuration,
        fg: fields.fg,
        mg: fields.mg,
        bg: fields.bg,
        subjectMotion: fields.subjectMotion,
      })
    );
    if (output) setField("generatedNotes", output);
  };

  const transcribeYoutubeToScore = async () => {
    const output = await runAI(
      "piano-score",
      "You are a music transcription assistant.",
      "Create a draft sheet notation and MIDI event sketch from the provided YouTube URL. Mention if assumptions were made.",
      `YouTube URL: ${fields.youtubeUrl}`
    );
    if (!output) return;
    setField("sheetMusic", output);
    const midiDraft = `# Draft MIDI Events\n${output
      .split("\n")
      .slice(0, 24)
      .map((line, i) => `${i + 1}, NOTE, ${line.replace(/[^\w\s#-]/g, "")}`)
      .join("\n")}`;
    setField("midiDraft", midiDraft);
    const tip = await runAI(
      "piano-tip",
      "You are a piano coach.",
      "Give one concise AI practice mode tip aligned to this draft transcription.",
      output
    );
    if (tip) setField("practiceTip", tip);
  };

  const analyzeCodeToLogic = async () => {
    const output = await runAI(
      "code-logic",
      "You are a senior software architect.",
      "Return JSON with keys mermaid and explanation. Mermaid must be valid flowchart LR syntax.",
      fields.codeSnippet
    );
    const parsed = safeParseJSON<{ mermaid?: string; explanation?: string }>(output);
    if (parsed?.mermaid || parsed?.explanation) {
      setField("mermaidFlow", parsed.mermaid || "");
      setField("plainEnglish", parsed.explanation || "");
      return;
    }
    const mermaidFromText = `flowchart LR\nA[Input Code] --> B[Parse Components]\nB --> C[Analyze Data Flow]\nC --> D[Render Output]`;
    setField("mermaidFlow", mermaidFromText);
    setField("plainEnglish", output || "AI could not parse JSON, showing raw explanation.");
  };

  const generateCinematicPanels = async () => {
    setLoadingKey("cinematic-panels");
    setStatusMessage("");
    try {
      const output = await callAIPromptStudio(
        "You are a storyboard director and prompt engineer.",
        "Return strict JSON array with 9 items. Each item must contain: panel(number 1-9), angle, prompt.",
        fields.sceneDescription
      );
      const parsed = safeParseJSON<StoryboardPanel[]>(output);
      const basePanels = parsed && parsed.length ? parsed.slice(0, 9) : [];
      const normalized = (basePanels.length ? basePanels : Array.from({ length: 9 }, (_, i) => ({
        panel: i + 1,
        angle: "Eye Level",
        prompt: `Panel ${i + 1} for: ${fields.sceneDescription}`,
      }))) as StoryboardPanel[];

      const withImages: StoryboardPanel[] = await Promise.all(
        normalized.map(async (panel) => {
          try {
            const imageRes = await fetch("/api/ai/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: `Cinematic storyboard frame, ${panel.prompt}, camera angle: ${panel.angle}, style: film pre-visualization, 16:9`,
              }),
            });
            const imageData = await imageRes.json();
            if (imageRes.ok && imageData?.url) {
              return { ...panel, imageUrl: imageData.url as string };
            }
            return panel;
          } catch {
            return panel;
          }
        })
      );
      setStoryboardPanels(withImages);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to generate storyboard");
    } finally {
      setLoadingKey(null);
    }
  };

  const generateMeetingStrategy = async () => {
    const diarized = await runAI(
      "meeting-diarized",
      "You are a meeting analyst.",
      "Create diarized transcript format with speakers and timestamps.",
      fields.transcriptInput
    );
    if (diarized) setField("diarizedTranscript", diarized);

    const summary = await runAI(
      "meeting-summary",
      "You are a chief of staff.",
      "Produce a markdown table with columns: Action Item, Owner, Deadline, Decision, Sentiment.",
      diarized || fields.transcriptInput
    );
    if (summary) setField("summaryTable", summary);

    const sentiment = await runAI(
      "meeting-sentiment",
      "You are a behavioral sentiment analyst.",
      "Provide concise participant sentiment analysis with overall mood and confidence score.",
      diarized || fields.transcriptInput
    );
    if (sentiment) setField("sentiment", sentiment);
  };

  const synthesizeResearch = async () => {
    const faq = await runAI(
      "research-faq",
      "You are a technical research assistant.",
      "Generate FAQ from the source with short, practical Q&A pairs.",
      fields.sourceText
    );
    if (faq) setField("faq", faq);

    const summary = await runAI(
      "research-summary",
      "You write concise one-page technical briefs.",
      "Create a one-page summary with sections and key takeaways.",
      fields.sourceText
    );
    if (summary) setField("onePageSummary", summary);

    const facts = await runAI(
      "research-facts",
      "You extract cited facts accurately.",
      "List cited facts in bullets with quote snippets and source references if available.",
      fields.sourceText
    );
    if (facts) setField("citedFacts", facts);
  };

  const generateWorkflowJson = async () => {
    const output = await runAI(
      "workflow-json",
      "You create n8n-compatible JSON workflow drafts.",
      "Return valid JSON only, with nodes and connections for the described automation.",
      fields.automationIdea
    );
    if (output) setField("workflowJson", output);
  };

  const generateStockPulse = async () => {
    setLoadingKey("stock-pulse");
    setStatusMessage("");
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze Indian stocks: ${fields.tickers}. Focus on last 24 hours news and classify sentiment into Bullish vs Bearish.`,
        }),
      });
      const data = (await res.json()) as ResearchResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch stock pulse");
      }
      setField("pulseSummary", data.response || "");
      setResearchSources(data.sources || []);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Stock pulse generation failed");
    } finally {
      setLoadingKey(null);
    }
  };

  const generateLanguageBridge = async () => {
    const transcript = await runAI(
      "lang-transcript",
      "You are a multilingual Malayalam speech-to-text assistant.",
      "Clean and normalize this Malayalam spoken idea into a readable transcript.",
      fields.malayalamInput
    );
    if (transcript) setField("malayalamTranscript", transcript);

    const screenplay = await runAI(
      "lang-screenplay",
      "You are an English screenplay writer.",
      "Convert this Malayalam idea into a formatted English screenplay scene with slugline, action, and dialogue.",
      transcript || fields.malayalamInput
    );
    if (screenplay) setField("screenplayEnglish", screenplay);
  };

  const analyzeCarromStrike = async () => {
    const analysis = await runAI(
      "carrom-analysis",
      "You are a carrom coach with geometry and physics knowledge.",
      "Estimate strike angle, predicted striker path, and 5 specific AI tips to improve accuracy.",
      fields.videoContext
    );
    if (!analysis) return;
    setField("aiTips", analysis);
    const angle = await runAI("carrom-angle", "You are precise.", "Return only a strike angle in degrees.", analysis);
    if (angle) setField("strikeAngle", angle);
    const path = await runAI("carrom-path", "You are concise.", "Describe predicted striker path in one sentence.", analysis);
    if (path) setField("predictedPath", path);
  };

  const renderProjectBuilder = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <label className="text-sm font-semibold">Project Title & Vision</label>
        <input
          value={fields.vision}
          onChange={(e) => setField("vision", e.target.value)}
          placeholder='A one-sentence vision like "Udemy Clone Website"'
          className="mt-2 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">1) Tech Stack / Tools</h3>
            <button
              onClick={generateProjectStack}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              {loading("stack") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
              Suggest with AI
            </button>
          </div>
          <textarea
            value={fields.techStack}
            onChange={(e) => setField("techStack", e.target.value)}
            rows={9}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
        </Card>

        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">2) User Stories / Requirements</h3>
            <div className="flex gap-2">
              <button
                onClick={generateUserStories}
                className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white"
              >
                {loading("stories") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Stories
              </button>
              <button
                onClick={generateProjectRequirements}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
              >
                {loading("requirements") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                Requirements
              </button>
            </div>
          </div>
          <textarea
            value={fields.requirements}
            onChange={(e) => setField("requirements", e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
          <textarea
            value={fields.userStories}
            onChange={(e) => setField("userStories", e.target.value)}
            rows={4}
            placeholder="AI user stories will appear here..."
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
        </Card>
      </div>

      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">The Parking Lot (non-MVP ideas)</h3>
          <button
            onClick={downloadProjectPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download Requirement PDF
          </button>
        </div>
        <textarea
          value={fields.parkingLot}
          onChange={(e) => setField("parkingLot", e.target.value)}
          rows={5}
          placeholder="Cool ideas that can wait after MVP..."
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
      </Card>
    </div>
  );

  const renderSecondBrain = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">Daily Log Date</label>
          <input
            type="date"
            value={fields.selectedDate}
            onChange={(e) => loadDailyLog(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
          <button
            onClick={saveDailyLog}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Save for Date
          </button>
        </div>
      </Card>

      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Brain Dump (5 minutes, no filters)</h3>
        <textarea
          rows={5}
          value={fields.brainDump}
          onChange={(e) => setField("brainDump", e.target.value)}
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">The Big Three</h3>
            <button
              onClick={generateBigThree}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
            >
              {loading("big-three") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              AI Suggest
            </button>
          </div>
          <textarea
            rows={6}
            value={fields.bigThree}
            onChange={(e) => setField("bigThree", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
        </Card>

        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Interstitials</h3>
          <textarea
            rows={6}
            value={fields.interstitials}
            onChange={(e) => setField("interstitials", e.target.value)}
            placeholder='e.g., "10:30 AM: Finished login UI..."'
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
        </Card>
      </div>

      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Daily Win</h3>
        <textarea
          rows={3}
          value={fields.dailyWin}
          onChange={(e) => setField("dailyWin", e.target.value)}
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
      </Card>
    </div>
  );

  const renderNarrativeStoryboard = () => (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80 space-y-3">
          <h3 className="font-semibold">1) Scene Header</h3>
          <input value={fields.sceneNo} onChange={(e) => setField("sceneNo", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Scene #" />
          <input value={fields.shotNumber} onChange={(e) => setField("shotNumber", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Shot number" />
          <input value={fields.location} onChange={(e) => setField("location", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="INT./EXT. Location" />
          <input value={fields.timeOfDay} onChange={(e) => setField("timeOfDay", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Day/Night/Dusk" />
          <input value={fields.characters} onChange={(e) => setField("characters", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Characters present" />
        </Card>

        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80 space-y-3">
          <h3 className="font-semibold">2) Visual Frame</h3>
          <div className="aspect-video rounded-xl border-2 border-dashed border-indigo-400/40 bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-900/20 dark:to-fuchsia-900/20 grid place-items-center text-xs text-neutral-500">
            16:9 Sketch Area
          </div>
          <input value={fields.shotType} onChange={(e) => setField("shotType", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Shot Type" />
          <input value={fields.cameraAngle} onChange={(e) => setField("cameraAngle", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Camera Angle" />
          <input value={fields.cameraMovement} onChange={(e) => setField("cameraMovement", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Camera Movement" />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80 space-y-3">
          <h3 className="font-semibold">3) Action & Dialogue</h3>
          <textarea rows={3} value={fields.action} onChange={(e) => setField("action", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Action in this frame" />
          <textarea rows={3} value={fields.dialogue} onChange={(e) => setField("dialogue", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Dialogue lines" />
          <input value={fields.transitions} onChange={(e) => setField("transitions", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Transition" />
        </Card>

        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80 space-y-3">
          <h3 className="font-semibold">4) Technical & Audio Notes</h3>
          <textarea rows={2} value={fields.audio} onChange={(e) => setField("audio", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Audio / SFX" />
          <textarea rows={2} value={fields.lighting} onChange={(e) => setField("lighting", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Lighting notes" />
          <input value={fields.props} onChange={(e) => setField("props", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Props needed" />
          <input value={fields.lensChoice} onChange={(e) => setField("lensChoice", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Lens choice" />
          <input value={fields.estimatedDuration} onChange={(e) => setField("estimatedDuration", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Estimated duration" />
          <div className="grid grid-cols-3 gap-2">
            <input value={fields.fg} onChange={(e) => setField("fg", e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="FG" />
            <input value={fields.mg} onChange={(e) => setField("mg", e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="MG" />
            <input value={fields.bg} onChange={(e) => setField("bg", e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="BG" />
          </div>
          <input value={fields.subjectMotion} onChange={(e) => setField("subjectMotion", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" placeholder="Subject motion arrows/notes" />
        </Card>
      </div>

      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">AI Production Roadmap</h3>
          <button onClick={generateStoryboardNotes} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
            {loading("storyboard-notes") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate Notes
          </button>
        </div>
        <textarea rows={10} value={fields.generatedNotes} onChange={(e) => setField("generatedNotes", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-800" />
      </Card>
    </div>
  );

  const renderPianoVirtuoso = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <label className="text-sm font-semibold">YouTube URL</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={fields.youtubeUrl}
            onChange={(e) => setField("youtubeUrl", e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 min-w-[220px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
          <button onClick={transcribeYoutubeToScore} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
            {loading("piano-score") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Music className="h-3.5 w-3.5" />}
            Audio-to-MIDI
          </button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Scrollable Sheet Music View</h3>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs whitespace-pre-wrap">
            {fields.sheetMusic || "AI transcription will appear here..."}
          </div>
        </Card>
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">MIDI Draft</h3>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs whitespace-pre-wrap">
            {fields.midiDraft || "MIDI representation will appear here..."}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => downloadTextFile(`${title.replace(/\s+/g, "_")}.mid.txt`, fields.midiDraft || "No MIDI generated")}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Download MIDI
            </button>
            <button
              onClick={() => setStatusMessage("AI Practice Mode: follow highlighted note groups while the track plays.")}
              className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Practice Mode
            </button>
          </div>
          {fields.practiceTip && (
            <p className="mt-3 rounded-lg border border-fuchsia-300/40 bg-fuchsia-500/10 p-3 text-xs text-fuchsia-200">
              {fields.practiceTip}
            </p>
          )}
        </Card>
      </div>
    </div>
  );

  const renderDevFlowArchitect = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Paste React / SAP Commerce (Hybris) code</h3>
        <textarea
          rows={10}
          value={fields.codeSnippet}
          onChange={(e) => setField("codeSnippet", e.target.value)}
          placeholder="Paste your code snippet..."
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-mono"
        />
        <button onClick={analyzeCodeToLogic} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
          {loading("code-logic") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
          Analyze & Visualize
        </button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Mermaid.js Flow Diagram</h3>
          <pre className="max-h-80 overflow-y-auto rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
            {fields.mermaidFlow || "Mermaid flow output will appear here..."}
          </pre>
        </Card>
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Plain English Logic</h3>
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
            {fields.plainEnglish || "Human-readable explanation will appear here..."}
          </pre>
        </Card>
      </div>
    </div>
  );

  const renderCinematicStoryboarder = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Scene Description</h3>
        <textarea
          rows={4}
          value={fields.sceneDescription}
          onChange={(e) => setField("sceneDescription", e.target.value)}
          placeholder="Describe your scene in detail..."
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
        <button onClick={generateCinematicPanels} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
          {loading("cinematic-panels") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          Generate 9 AI Storyboard Panels
        </button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {storyboardPanels.length === 0 ? (
          <Card className="col-span-full p-8 text-center bg-white/90 dark:bg-neutral-900/80 text-sm text-neutral-500">
            No panels yet. Generate to create a 9-panel cinematic storyboard.
          </Card>
        ) : (
          storyboardPanels.map((panel) => (
            <Card key={panel.panel} className="overflow-hidden bg-white/90 dark:bg-neutral-900/80">
              <div className="aspect-video bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-cyan-500/20 grid place-items-center">
                {panel.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={panel.imageUrl} alt={`Panel ${panel.panel}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">AI frame pending</span>
                )}
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="font-semibold">Panel {panel.panel}</p>
                <p className="text-indigo-600 dark:text-indigo-300">{panel.angle}</p>
                <p className="text-neutral-600 dark:text-neutral-300">{panel.prompt}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderMeetingStrategist = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Record / Paste Meeting Transcript</h3>
        <textarea
          rows={6}
          value={fields.transcriptInput}
          onChange={(e) => setField("transcriptInput", e.target.value)}
          placeholder='Paste transcript or notes like "Speaker A: ... Speaker B: ..."'
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
        <button onClick={generateMeetingStrategy} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
          {loading("meeting-diarized") || loading("meeting-summary") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileAudio className="h-3.5 w-3.5" />}
          Diarize + Action Summary
        </button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Diarized Transcript</h3>
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
            {fields.diarizedTranscript || "Diarized transcript appears here..."}
          </pre>
        </Card>
        <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Action Items / Decisions / Sentiment</h3>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
            {fields.summaryTable || "Summary table appears here..."}
          </pre>
          <div className="mt-3 rounded-lg border border-indigo-300/30 bg-indigo-500/10 p-3 text-xs">
            <strong>Sentiment Analysis</strong>
            <p className="mt-1 whitespace-pre-wrap">{fields.sentiment || "Sentiment details will appear here..."}</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderResearchSynthesizer = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Upload PDF / Web Text to Analyze</h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-semibold">
            <Upload className="h-3.5 w-3.5" />
            Upload Source
            <input
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadedFileName(file.name);
                const text = await file.text().catch(() => "");
                if (text) {
                  setField("sourceText", text.slice(0, 20000));
                } else {
                  setStatusMessage("Uploaded file is binary/non-text. Add key excerpts manually for best AI output.");
                }
              }}
            />
          </label>
          {uploadedFileName && <span className="text-xs text-neutral-500">{uploadedFileName}</span>}
        </div>
        <textarea
          rows={6}
          value={fields.sourceText}
          onChange={(e) => setField("sourceText", e.target.value)}
          placeholder="Paste technical manual excerpt or web report text..."
          className="mt-3 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
        <button onClick={synthesizeResearch} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
          {loading("research-faq") || loading("research-summary") || loading("research-facts") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Generate FAQ + Summary + Cited Facts
        </button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">FAQ</h3>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">{fields.faq || "FAQ will appear here..."}</pre>
        </Card>
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">1-Page Summary</h3>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">{fields.onePageSummary || "Summary will appear here..."}</pre>
        </Card>
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Cited Facts</h3>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">{fields.citedFacts || "Cited facts will appear here..."}</pre>
        </Card>
      </div>
    </div>
  );

  const renderWorkflowAutomator = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Describe your repetitive manual workflow</h3>
        <textarea
          rows={5}
          value={fields.automationIdea}
          onChange={(e) => setField("automationIdea", e.target.value)}
          placeholder='Example: "Save my carrom tournament scores to Google Sheet and email winner"'
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
        <div className="mt-3 flex gap-2">
          <button onClick={generateWorkflowJson} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
            {loading("workflow-json") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
            Generate n8n JSON
          </button>
          <button
            onClick={() => downloadTextFile(`${title.replace(/\s+/g, "_")}.json`, fields.workflowJson || "{}", "application/json;charset=utf-8")}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <FileJson className="h-3.5 w-3.5" />
            Download .json
          </button>
        </div>
      </Card>
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
          {fields.workflowJson || "n8n importable JSON output appears here..."}
        </pre>
      </Card>
    </div>
  );

  const renderStockPulse = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Indian Stock Tickers</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={fields.tickers}
            onChange={(e) => setField("tickers", e.target.value)}
            placeholder="RELIANCE, TCS, INFY, HDFCBANK"
            className="flex-1 min-w-[220px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          />
          <button onClick={generateStockPulse} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
            {loading("stock-pulse") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
            Fetch 24h Pulse
          </button>
        </div>
      </Card>
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Bullish vs. Bearish Dashboard</h3>
        <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
          {fields.pulseSummary || "Sentiment dashboard and snippets will appear here..."}
        </pre>
        {researchSources.length > 0 && (
          <div className="mt-3 space-y-1 text-xs">
            <p className="font-semibold">Cited News Sources</p>
            {researchSources.map((s, idx) => (
              <a key={`${s.url}-${idx}`} href={s.url} target="_blank" rel="noreferrer" className="block text-indigo-600 hover:underline">
                {s.title}
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderLanguageBridge = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Malayalam Film Idea (speech/text)</h3>
        <textarea
          rows={5}
          value={fields.malayalamInput}
          onChange={(e) => setField("malayalamInput", e.target.value)}
          placeholder="Malayalam idea..."
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
        <button onClick={generateLanguageBridge} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
          {loading("lang-transcript") || loading("lang-screenplay") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
          Transcribe + Translate to Screenplay
        </button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Malayalam Transcript</h3>
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
            {fields.malayalamTranscript || "Original transcript appears here..."}
          </pre>
        </Card>
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Formatted English Screenplay</h3>
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs">
            {fields.screenplayEnglish || "Translated screenplay appears here..."}
          </pre>
        </Card>
      </div>
    </div>
  );

  const renderCarromCoach = () => (
    <div className="space-y-4">
      <Card className="p-5 bg-white/90 dark:bg-neutral-900/80">
        <h3 className="font-semibold mb-2">Upload Strike Video + Context</h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-semibold">
            <Video className="h-3.5 w-3.5" />
            Upload Video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadedFileName(file.name);
              }}
            />
          </label>
          {uploadedFileName && <span className="text-xs text-neutral-500">{uploadedFileName}</span>}
        </div>
        <textarea
          rows={4}
          value={fields.videoContext}
          onChange={(e) => setField("videoContext", e.target.value)}
          placeholder="Optional: describe your strike setup, board position, and target pocket."
          className="mt-3 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
        />
        <button onClick={analyzeCarromStrike} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
          {loading("carrom-analysis") || loading("carrom-angle") || loading("carrom-path") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Analyze Strike Technique
        </button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Predicted Strike Angle</h3>
          <p className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs whitespace-pre-wrap">
            {fields.strikeAngle || "Angle output pending..."}
          </p>
        </Card>
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">Predicted Path Overlay Notes</h3>
          <p className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs whitespace-pre-wrap">
            {fields.predictedPath || "Path output pending..."}
          </p>
        </Card>
        <Card className="p-4 bg-white/90 dark:bg-neutral-900/80">
          <h3 className="font-semibold mb-2">AI Tips</h3>
          <p className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs whitespace-pre-wrap">
            {fields.aiTips || "Improvement tips pending..."}
          </p>
        </Card>
      </div>
    </div>
  );

  const renderByTemplate = () => {
    switch (templateId) {
      case "project-builder":
        return renderProjectBuilder();
      case "second-brain-daily-log":
        return renderSecondBrain();
      case "narrative-storyboard":
        return renderNarrativeStoryboard();
      case "piano-virtuoso":
        return renderPianoVirtuoso();
      case "dev-flow-architect":
        return renderDevFlowArchitect();
      case "cinematic-storyboarder":
        return renderCinematicStoryboarder();
      case "meeting-strategist":
        return renderMeetingStrategist();
      case "research-synthesizer":
        return renderResearchSynthesizer();
      case "workflow-automator":
        return renderWorkflowAutomator();
      case "stock-pulse":
        return renderStockPulse();
      case "language-bridge":
        return renderLanguageBridge();
      case "carrom-coach":
        return renderCarromCoach();
      default:
        return null;
    }
  };

  const subtitleMap: Record<NextGenTemplateId, string> = {
    "project-builder": "From idea to MVP with AI-generated stack, requirements, and stories.",
    "second-brain-daily-log": "A rapid productivity log with date-based entries and AI planning.",
    "narrative-storyboard": "Director-grade scene planning with camera, audio, and production metadata.",
    "piano-virtuoso": "YouTube-to-score workflow with AI transcription and MIDI draft export.",
    "dev-flow-architect": "Code-to-logic mapping with Mermaid flow and plain English explanation.",
    "cinematic-storyboarder": "Script-to-visual 9-panel AI storyboard with camera angle suggestions.",
    "meeting-strategist": "Voice/transcript-to-action with diarization, decisions, and sentiment insights.",
    "research-synthesizer": "Document/web-to-insight with FAQ, concise summary, and cited facts.",
    "workflow-automator": "Natural language idea to n8n-importable workflow JSON.",
    "stock-pulse": "Market news to sentiment pulse dashboard (bullish vs bearish).",
    "language-bridge": "Malayalam speech/text to dual-pane transcript and screenplay output.",
    "carrom-coach": "Video-to-technique feedback with strike angle and improvement tips.",
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-black">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-6 sm:p-8 space-y-4">
          {renderHeader(subtitleMap[templateId])}
          {statusMessage && (
            <div className="rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {statusMessage}
            </div>
          )}
          {renderByTemplate()}
        </div>
      </div>
      <TemplateFooter />
    </div>
  );
}

export function ProjectBuilderTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="project-builder" />;
}

export function SecondBrainDailyLogTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="second-brain-daily-log" />;
}

export function NarrativeStoryboardTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="narrative-storyboard" />;
}

export function PianoVirtuosoTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="piano-virtuoso" />;
}

export function DevFlowArchitectTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="dev-flow-architect" />;
}

export function CinematicStoryboarderTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="cinematic-storyboarder" />;
}

export function MeetingStrategistTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="meeting-strategist" />;
}

export function ResearchSynthesizerTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="research-synthesizer" />;
}

export function WorkflowAutomatorTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="workflow-automator" />;
}

export function StockPulseTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="stock-pulse" />;
}

export function LanguageBridgeTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="language-bridge" />;
}

export function CarromCoachTemplate(props: Omit<NextGenTemplateProps, "templateId">) {
  return <NextGenAITemplate {...props} templateId="carrom-coach" />;
}
