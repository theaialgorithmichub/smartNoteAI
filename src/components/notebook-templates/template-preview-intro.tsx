"use client";

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { TEMPLATE_POINTS } from "@/config/template-points";
import { NOTEBOOK_TEMPLATES, NotebookTemplateType } from "@/types/notebook-templates";

const bestForByTemplate: Partial<Record<NotebookTemplateType, string>> = {
  simple: "quick notes, ideas, and everyday writing",
  "meeting-notes": "team meetings, 1:1s, and decision tracking",
  document: "structured docs, reports, and reviews",
  dashboard: "projects that need metrics, tasks, notes, and events in one place",
  "code-notebook": "developers collecting snippets, experiments, and outputs",
  planner: "meeting prep, timed agendas, and goal-driven sessions",
  "ai-research": "source-based research, summaries, and notebook-aware Q&A",
  diary: "private daily reflections, mood tracking, and memories",
  journal: "guided reflection, gratitude, and personal growth",
  custom: "building a flexible page from reusable content widgets",
  doodle: "visual notes, sketches, and creative brainstorming",
  project: "teams planning tickets, sprints, documents, and delivery",
  loop: "collaborative workspaces and shared notes",
  story: "authors building characters, scenes, and story arcs",
  storytelling: "cinematic scenes, shot lists, characters, and AI prompts",
  typewriter: "focused writing sessions with minimal distractions",
  n8n: "automation ideas and n8n workflow planning",
  "image-prompt": "AI image prompt libraries and visual iterations",
  "video-prompt": "video prompt ideas, references, and production notes",
  studybook: "course notes, lesson plans, practice, and review",
  flashcard: "memorization, exam prep, and spaced review",
  whiteboard: "diagrams, sticky notes, and visual planning",
  recipe: "recipes, shopping lists, and cooking notes",
  expense: "monthly expense tracking and summaries",
  trip: "itineraries, packing, travel budget, and bookings",
  todo: "prioritized tasks, projects, recurring work, and analytics",
  "book-notes": "reading progress, chapter notes, and favorite quotes",
  "habit-tracker": "daily routines, streaks, and habit reflection",
  "workout-log": "exercise plans, sets, reps, and progress",
  "budget-planner": "income, savings, and category-based budgets",
  "class-notes": "lectures, subjects, key points, and study recall",
  "research-builder": "research plans, chapters, evidence, and reports",
  "grocery-list": "shopping trips, item categories, and completion tracking",
  "expense-sharer": "splitting trip or event costs with friends",
  "project-pipeline": "visual project stages and delivery tracking",
  "prompt-diary": "saving, tagging, and reusing AI prompts",
  "save-the-date": "important dates, reminders, and countdowns",
  "important-urls": "video links, social URLs, and reference libraries",
  "language-translator": "translation workflows and language practice",
  dictionary: "definitions, examples, and vocabulary lookup",
  "meals-planner": "group food orders, menus, and meal planning",
  "games-scorecard": "matches, players, scores, and leaderboards",
  "sticker-book": "sticky-note ideation and visual grouping",
  "tutorial-learn": "step-by-step guides with images and exportable instructions",
  "mind-map": "hierarchical brainstorming and idea relationships",
  "goal-tracker": "SMART goals, milestones, and progress reviews",
  "ai-prompt-studio": "prompt engineering, versioning, and test results",
  "project-builder": "turning product ideas into plans and user stories",
  "second-brain-daily-log": "daily planning, brain dumps, and wins",
  "narrative-storyboard": "scene planning, frames, and production notes",
  "piano-virtuoso": "music practice, YouTube-to-score ideas, and MIDI workflows",
  "dev-flow-architect": "code analysis, logic maps, and architecture notes",
  "cinematic-storyboarder": "AI-assisted visual storyboard generation",
  "meeting-strategist": "transcripts, decisions, actions, and sentiment",
  "research-synthesizer": "document synthesis, FAQs, and cited facts",
  "workflow-automator": "plain-language automations and n8n JSON",
  "stock-pulse": "market news sentiment and ticker tracking",
  "language-bridge": "Malayalam-to-English screenplay workflows",
  "carrom-coach": "sports video analysis and improvement tips",
  "piano-notes": "repertoire, practice logs, and technique notes",
  vocabulary: "word lists, definitions, and language review",
};

const tierLabelByTier = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
  elite: "Elite",
};

interface TemplatePreviewIntroProps {
  templateId: NotebookTemplateType;
}

export function TemplatePreviewIntro({ templateId }: TemplatePreviewIntroProps) {
  const template = NOTEBOOK_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return null;

  const points = TEMPLATE_POINTS[templateId];
  const bestFor = bestForByTemplate[templateId] || template.description.toLowerCase();
  const setupSteps = [
    "Review the sample content below to understand the workflow.",
    "Use the template to create a notebook from your dashboard.",
    "Replace the sample sections with your own notes, tasks, sources, or media.",
  ];

  return (
    <section className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-orange-50 shadow-sm dark:border-amber-900/40 dark:from-neutral-950 dark:via-amber-950/20 dark:to-orange-950/20">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr,0.85fr] lg:p-8">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Template preview
              </span>
              {points && (
                <span className="rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/50 dark:bg-neutral-900/80 dark:text-amber-300">
                  {tierLabelByTier[points.tier]} - {points.points} pts
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-neutral-950 dark:text-white sm:text-3xl">
              {template.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              {template.description}
            </p>

            <div className="mt-5 rounded-2xl bg-white/70 p-4 dark:bg-neutral-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Best for
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                {bestFor}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl bg-white/80 p-4 dark:bg-neutral-900/80">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                What you get
              </p>
              <div className="space-y-2">
                {template.features.slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 p-4 dark:bg-neutral-900/80">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                How to use it
              </p>
              <div className="space-y-2">
                {setupSteps.map((step) => (
                  <div key={step} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
