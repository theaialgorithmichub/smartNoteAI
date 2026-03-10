"use client";
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Search, PenTool, Layers, Zap } from "lucide-react";
import { FeaturesColumn } from "@/components/ui/features-column";

const features = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Realistic Page Flipping",
    description: "Experience the satisfaction of turning pages with our realistic page-curl animation. Just like a real notebook.",
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI Research Companion",
    description: "Let AI browse the web, summarize videos, and answer questions based on your notebook's content.",
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "Smart Search",
    description: "Find anything instantly with fuzzy search. Even with typos, we'll find what you're looking for.",
  },
  {
    icon: <PenTool className="h-8 w-8" />,
    title: "Rich Text Editor",
    description: "Format your notes with a powerful editor. Add images, code blocks, and more to your pages.",
  },
  {
    icon: <Layers className="h-8 w-8" />,
    title: "Organize with Chapters",
    description: "Keep your thoughts organized with chapters and sections. Navigate your notebook with ease.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Cloud Sync",
    description: "Your notebooks are automatically saved and synced across all your devices in real-time.",
  },
];

const firstColumn = features.slice(0, 2);
const secondColumn = features.slice(2, 4);
const thirdColumn = features.slice(4, 6);

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-neutral-100 dark:from-black dark:to-neutral-900 relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-10"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg text-sm" style={{ borderColor: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary)20', color: 'var(--theme-accent)' }}>
              Features
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mt-5 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">Why </span>
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))' }}>smartDigitalNotes</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">?</span>
          </h2>
          <p className="text-center mt-5 text-neutral-600 dark:text-neutral-400 text-lg">
            Experience the perfect blend of traditional note-taking and cutting-edge AI technology
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[600px] overflow-hidden">
          <FeaturesColumn features={firstColumn} duration={15} />
          <FeaturesColumn features={secondColumn} className="hidden md:block" duration={19} />
          <FeaturesColumn features={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
