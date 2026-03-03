"use client"

import { motion } from "framer-motion"
import { LampContainer } from "@/components/ui/lamp"
import { NotebookSelector } from "@/components/ui/notebook-selector"

export function BookshelfSection() {
  return (
    <LampContainer className="min-h-[900px] pb-20">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center w-full px-4 relative z-50"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">Your </span>
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))' }}>Personal Bookshelf</span>
        </h2>
        <p className="text-lg mb-12 text-center max-w-xl" style={{ color: 'var(--theme-secondary)' }}>
          Organize your notebooks just like a real bookshelf. Click to explore different categories.
        </p>
        
        <div className="w-full max-w-[900px]">
          <NotebookSelector />
        </div>
      </motion.div>
    </LampContainer>
  )
}
