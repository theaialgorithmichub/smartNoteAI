"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface FloatingCard {
  title: string
  description: string
  fullDescription?: string
  image: string
  avatar: string
  author: string
  category: string
  tags?: string[]
}

interface FloatingCardGalleryProps {
  cards: FloatingCard[]
  backgroundColor?: string
  accentColor?: string
  maxCards?: number
}

export function FloatingCardGallery({
  cards,
  backgroundColor = "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
  accentColor = "rgba(139, 92, 246, 0.5)",
  maxCards = 6,
}: FloatingCardGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / 25
      const y = (e.clientY - rect.top - rect.height / 2) / 25
      setMousePosition({ x, y })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      setActiveIndex(activeIndex === index ? null : index)
    }
  }

  const displayCards = cards.slice(0, maxCards)

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full overflow-hidden ${backgroundColor} flex items-center justify-center p-8`}
      style={{ perspective: "1500px" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: `${Math.random() * 6 + 1}px`,
              height: `${Math.random() * 6 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-10 w-full max-w-7xl"
        style={{
          transform: `rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {displayCards.map((card, index) => (
          <motion.div
            key={card.title + index}
            className="relative group cursor-pointer"
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            aria-expanded={activeIndex === index}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              z: activeIndex === index ? 100 : 0,
              scale: activeIndex === index ? 1.05 : 1,
            }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              z: 30,
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100"
              animate={{
                opacity: activeIndex === index ? 0.6 : 0,
                boxShadow: `0 0 40px 2px ${accentColor}`,
              }}
              transition={{ duration: 0.4 }}
              style={{
                background: `linear-gradient(135deg, ${accentColor}, transparent 80%)`,
              }}
            />

            <motion.div
              className="relative rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 h-full flex flex-col overflow-hidden"
              style={{
                transformStyle: "preserve-3d",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50 blur-xl"
                style={{ transform: `translateZ(${Math.random() * 10 + 10}px)` }}
              />

              <div
                className="w-full h-40 mb-4 overflow-hidden rounded-lg"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ transform: "translateZ(20px)" }}
                />
              </div>

              <motion.div style={{ transform: "translateZ(30px)" }} transition={{ duration: 0.4 }}>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{card.description}</p>
              </motion.div>

              <div
                className="mt-auto flex items-center justify-between"
                style={{ transform: "translateZ(40px)" }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500">
                    <img src={card.avatar} alt={card.author} className="w-full h-full object-cover" />
                  </div>
                  <span className="ml-2 text-xs text-slate-400">{card.author}</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-slate-700 text-slate-300">
                  {card.category}
                </span>
              </div>
            </motion.div>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  className="absolute inset-0 bg-slate-900/95 backdrop-blur-md rounded-xl p-6 z-50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: "translateZ(60px)" }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveIndex(null)
                    }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <h2 className="text-2xl font-bold text-white mb-4">{card.title}</h2>
                  <p className="text-slate-300 mb-6">{card.fullDescription || card.description}</p>

                  {card.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-purple-900/50 text-purple-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto">
                    <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-700 hover:to-fuchsia-700 transform transition hover:-translate-y-1">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

