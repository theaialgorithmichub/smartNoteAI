"use client";

import { motion } from "framer-motion";
import { Sparkles, NotebookText, Wand2, Share2, ShieldCheck, Globe2 } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/home/footer";
import { FeaturesSection } from "@/components/home/features-section";
import { Card } from "@/components/ui/card";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-purple-700/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-purple-500/10 border border-purple-400/30 mb-6">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-100">
                Built for writers, thinkers & teams
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Features that feel like{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-sky-400">
                magic on paper
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl">
              SmartNote AI combines the nostalgia of a real notebook with AI that actually
              understands your work. Flip pages, organize chapters, and let Note E handle the busywork.
            </p>
          </motion.div>

          {/* Quick highlight strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <HighlightPill title="Page‑flip notebooks" subtitle="Feel like a real book" />
            <HighlightPill title="AI on every page" subtitle="Summaries, rewrites & research" />
            <HighlightPill title="Templates for everything" subtitle="Projects, trips, classes & more" />
          </motion.div>
        </div>
      </section>

      {/* Core feature rows */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        <FeatureRow
          icon={<NotebookText className="w-6 h-6 text-amber-300" />}
          eyebrow="Notebook-first experience"
          title="A shelf of notebooks, not a pile of docs"
          description="Create separate, beautifully themed notebooks for every project, course, or client. Flip through pages, add chapters, and keep long-term work organized exactly how your brain remembers it."
          bullets={[
            "Realistic 2-page spread with page numbers and TOC",
            "Cover images, themes, and paper styles (lined, grid, dotted, blank)",
            "Notebook templates for meetings, research, trips, journaling, and more",
          ]}
        />

        <FeatureRow
          icon={<Wand2 className="w-6 h-6 text-purple-300" />}
          eyebrow="Note E – your AI inside the notebook"
          title="Ask questions directly about your pages"
          description="Highlight text or open the AI sidebar to ask Note E anything about your notebook. Get summaries, clarifications, or new ideas without ever leaving the page."
          bullets={[
            "Per-notebook AI chat that understands your pages and chapters",
            "Smart suggestions for structure, titles, and next steps",
            "Research mode that can summarize web pages and YouTube content into your notes",
          ]}
          reversed
        />

        <FeatureRow
          icon={<Share2 className="w-6 h-6 text-sky-300" />}
          eyebrow="Built for teams & collaborators"
          title="Share notebooks without losing the book feel"
          description="Invite collaborators, track presence in real time, and keep comments tied to the exact page you are discussing."
          bullets={[
            "Realtime cursors so you see where others are working",
            "Comments panel for page-specific discussions",
            "Shareable links for read-only or collaborative access",
          ]}
        />

        <FeatureRow
          icon={<ShieldCheck className="w-6 h-6 text-emerald-300" />}
          eyebrow="Cloud-first, safe by default"
          title="Always saved, always in sync"
          description="Smart autosave and sync make sure you never lose a thought. Open the same notebook across devices and pick up exactly where you left off."
          bullets={[
            "Autosave on every edit with background persistence",
            "Version-safe AI actions that never overwrite without your control",
            "Secure authentication powered by Clerk",
          ]}
          reversed
        />
      </section>

      {/* Animated feature grid (reuses home FeaturesSection for consistency) */}
      <FeaturesSection />

      {/* Call to action */}
      <section className="border-t border-neutral-800 bg-gradient-to-r from-purple-900/40 via-neutral-900 to-sky-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-purple-300">NEXT STEPS</p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Start with one notebook.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-rose-300">
                Grow a whole shelf.
              </span>
            </h2>
            <p className="text-neutral-300 text-base sm:text-lg max-w-xl">
              Sign in, pick a template, and create your first SmartNote AI notebook in less than a minute.
              You can always customize layouts, themes, and AI behavior later.
            </p>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <Card className="flex-1 bg-white/5 border-neutral-700/60 backdrop-blur-xl p-5">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-sky-300" />
                For everyday notes
              </h3>
              <p className="text-sm text-neutral-300 mb-2">
                Use SmartNote AI as your daily thinking space: ideas, tasks, journals, and study notes.
              </p>
              <p className="text-xs text-neutral-500">
                Best with: Simple, Diary, Studybook, and Todo templates.
              </p>
            </Card>

            <Card className="flex-1 bg-white/5 border-neutral-700/60 backdrop-blur-xl p-5">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <NotebookText className="w-4 h-4 text-amber-300" />
                For serious projects
              </h3>
              <p className="text-sm text-neutral-300 mb-2">
                Plan launches, research reports, courses, and client work in structured project notebooks.
              </p>
              <p className="text-xs text-neutral-500">
                Best with: Document, Project, AI Research, Research Builder, and Trip templates.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

interface FeatureRowProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  reversed?: boolean;
}

function FeatureRow({ icon, eyebrow, title, description, bullets, reversed }: FeatureRowProps) {
  return (
    <div
      className={`grid gap-8 items-center md:grid-cols-2 ${
        reversed ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className={reversed ? "md:order-2" : ""}>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/5 border border-white/10 mb-4 text-xs uppercase tracking-[0.2em] text-neutral-300">
          {icon}
          <span>{eyebrow}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-semibold mb-3">{title}</h3>
        <p className="text-neutral-300 mb-4 text-sm sm:text-base">{description}</p>
        <ul className="space-y-2 text-sm text-neutral-300">
          {bullets.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reversed ? "md:order-1" : ""}>
        <Card className="bg-white/5 border-neutral-800/80 backdrop-blur-xl p-6 h-full flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-sky-500/10 to-amber-400/10 rounded-2xl border border-white/10 flex items-center justify-center">
            <div className="text-center space-y-2 px-4 py-6">
              <p className="text-sm text-neutral-200">
                Designed to feel like a physical notebook, but powered by modern AI and collaboration.
              </p>
              <p className="text-xs text-neutral-400">
                Every feature is tuned for long-form thinking, not just quick notes.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

