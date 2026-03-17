"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookText,
  Wand2,
  Share2,
  ShieldCheck,
  Globe2,
  BrainCircuit,
  LayoutPanelLeft,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/home/footer";
import { Card } from "@/components/ui/card";
import { ShinyButton } from "@/components/ui/shiny-button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, delay },
});

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      {/* Banner / Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#4b5cff33,transparent_60%),radial-gradient(circle_at_bottom,#22d3ee22,transparent_55%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white/5 border border-white/10 mb-5">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-100">
                SmartNote AI – Feature Overview
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
              Everything your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-300">
                brain needs
              </span>{" "}
              to think in notebooks.
            </h1>
            <p className="text-lg sm:text-xl text-slate-200/90 max-w-2xl">
              SmartNote AI is a notebook-first workspace for deep work, combining the feel of a real
              book with AI that understands every page, chapter, and project.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ShinyButton>Get Started Free</ShinyButton>
              <button className="inline-flex items-center gap-2 text-sm text-slate-200/80 hover:text-white transition-colors">
                Watch how it works
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-300">
              <HeroStat label="Notebooks feel like books" value="Two‑page spreads, covers, TOC" />
              <HeroStat label="AI that stays in context" value="Notebook‑aware Note E assistant" />
              <HeroStat label="Designed for long‑form work" value="Projects, courses, research & more" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Block: Core pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <SectionHeader
          eyebrow="CORE PILLARS"
          title="Three layers that make SmartNote AI different"
          description="Notebook‑native UI, embedded AI, and a library of templates built for how you actually think."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<BookText className="w-6 h-6 text-amber-300" />}
            title="Notebook‑first canvas"
            body="Flip through pages, add chapters, and see your work in a familiar book layout instead of a flat doc list."
            chips={["Two‑page spread", "Covers & themes", "Page numbers & TOC"]}
          />
          <FeatureCard
            icon={<BrainCircuit className="w-6 h-6 text-violet-300" />}
            title="Note E, inside every page"
            body="Ask Note E to summarize, restructure, or extend your thinking using only the notebook you are in."
            chips={["Context‑aware chat", "Smart suggestions", "Research mode"]}
          />
          <FeatureCard
            icon={<Share2 className="w-6 h-6 text-sky-300" />}
            title="Collaboration that respects flow"
            body="Invite collaborators into a shared notebook without losing the calm, focused feel of writing alone."
            chips={["Live cursors", "Comments by page", "Shareable links"]}
          />
        </div>
      </section>

      {/* Block: Deep work workspace */}
      <section className="border-y border-white/5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-[1.1fr,1fr] items-center">
          <motion.div {...fadeUp(0.05)}>
            <SectionHeader
              eyebrow="DEEP WORK SPACE"
              title="A calm, layered workspace for serious thinking"
              description="SmartNote AI is built for people who sit with ideas for hours: researchers, students, founders, and teams who plan in detail."
              align="left"
            />
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Notebook shelves keep personal, work, and side projects visually separate.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Page navigation, chapters, and TOCs mirror the way you remember where ideas live.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Distraction‑free writing surface with room for visual layouts and structured notes.
              </li>
            </ul>
          </motion.div>

          <motion.div {...fadeUp(0.15)}>
            <Card className="relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl p-6">
              <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_top,#22c1c366,transparent_60%),radial-gradient(circle_at_bottom,#6366f166,transparent_60%)] opacity-70" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black/50 border border-white/10 text-xs text-slate-200">
                  <LayoutPanelLeft className="w-4 h-4 text-cyan-300" />
                  Notebook layout preview
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-1">
                    <p className="font-medium text-slate-50">Left page</p>
                    <p className="text-slate-300">
                      Outline, chapter titles, and structure live here so you always know the bigger picture.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-1">
                    <p className="font-medium text-slate-50">Right page</p>
                    <p className="text-slate-300">
                      Detailed notes, screenshots, and research get the right‑hand focus they deserve.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/40 border border-cyan-400/40 p-4 space-y-1 sm:col-span-2">
                    <p className="font-medium text-cyan-200 flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Note E side panel
                    </p>
                    <p className="text-slate-200">
                      Open Note E to ask “What am I missing?” and get structured suggestions based on the notebook, not the entire internet.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Block: Templates grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <SectionHeader
          eyebrow="TEMPLATES"
          title="Start faster with notebooks that already know the job"
          description="Pick a template that matches your use case and customize it as you grow."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <TemplateCard
            label="For solo thinkers"
            title="Diary & Studybook"
            items={["Daily journal notebook", "Studybook for courses & exams", "Habit & reflection pages"]}
          />
          <TemplateCard
            label="For projects"
            title="Project & Dashboard"
            items={["Launch planning notebooks", "Team dashboards", "Roadmaps and retros"]}
          />
          <TemplateCard
            label="For planning life"
            title="Trips & Planning"
            items={["Trip itineraries", "Budget & expense books", "Recipe, piano & side‑project logs"]}
          />
        </div>
      </section>

      {/* Block: Trust & reliability */}
      <section className="border-t border-white/5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-[1fr,1.1fr] items-center">
          <motion.div {...fadeUp(0.05)}>
            <SectionHeader
              eyebrow="RELIABILITY"
              title="Safe, synced, and ready whenever you are"
              description="SmartNote AI quietly keeps everything backed up, version‑aware, and secure while you focus on the page in front of you."
              align="left"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm text-slate-200">
              <MiniFeature
                icon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
                title="Data safety"
                body="Secure authentication, encrypted storage, and AI actions that never overwrite without your consent."
              />
              <MiniFeature
                icon={<Globe2 className="w-4 h-4 text-sky-300" />}
                title="Cloud everywhere"
                body="Open your notebooks from any device and pick up on the exact page you left."
              />
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.12)}>
            <Card className="bg-black/60 border-white/10 backdrop-blur-xl p-6 space-y-4">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                HOW TEAMS USE SMARTNOTE AI
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Product teams run project notebooks that track research, specs, decisions, and launch notes in one place.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Students keep separate shelves for courses, exams, and personal learning with Note E as an on‑call tutor.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Creators use notebooks as idea vaults, with AI helping repurpose drafts into scripts, posts, and outlines.
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final banner */}
      <section className="border-t border-white/5 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            READY WHEN YOUR NEXT IDEA HITS
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold">
            Turn your browser into a{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-300">
              living notebook shelf
            </span>
            .
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Open SmartNote AI, create a notebook for your next idea, and let Note E handle the structure, summaries,
            and repetitions while you stay in flow.
          </p>
          <div className="flex justify-center">
            <ShinyButton>Get Started Free</ShinyButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl font-semibold">{title}</h2>
      <p className="text-sm sm:text-base text-slate-300 max-w-2xl">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  chips,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  chips: string[];
}) {
  return (
    <Card className="h-full bg-white/5 border-white/10 backdrop-blur-xl p-5 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="inline-flex items-center justify-center rounded-2xl bg-black/50 border border-white/10 p-2">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-slate-300">{body}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-slate-200"
          >
            {chip}
          </span>
        ))}
      </div>
    </Card>
  );
}

function TemplateCard({
  label,
  title,
  items,
}: {
  label: string;
  title: string;
  items: string[];
}) {
  return (
    <Card className="bg-gradient-to-br from-slate-900/80 via-slate-950 to-black border-white/10 backdrop-blur-xl p-5 space-y-3">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-200">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MiniFeature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
        {icon}
        <span>{title}</span>
      </div>
      <p className="text-xs sm:text-sm text-slate-300">{body}</p>
    </div>
  );
}