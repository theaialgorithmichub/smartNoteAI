"use client"

import { motion } from "framer-motion"

export function NotebookOpeningAnimation() {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="relative" style={{ perspective: "2000px" }}>
        {/* Animated Opening Book */}
        <div className="relative w-64 h-80">
          {/* Left Page */}
          <motion.div
            className="absolute left-0 top-0 w-32 h-80 origin-right"
            style={{
              transformStyle: "preserve-3d",
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: [-30, -15, -30] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Left Cover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-orange-700 to-amber-800 rounded-l-xl shadow-2xl">
              {/* Cover Decoration */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <motion.div
                    className="h-1 bg-amber-300/50 rounded"
                    animate={{ width: ["60%", "80%", "60%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="h-1 bg-amber-300/30 rounded"
                    animate={{ width: ["40%", "60%", "40%"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
                
                {/* Glowing Emblem */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 to-orange-400 blur-sm" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-200 to-orange-300" />
                </motion.div>
              </div>

              {/* Spine Edge */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-amber-900 to-amber-800" />
            </div>

            {/* Left Inner Page */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-l-lg"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Page Lines */}
              <div className="p-6 space-y-2">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-px bg-amber-300/40"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Page */}
          <motion.div
            className="absolute right-0 top-0 w-32 h-80 origin-left"
            style={{
              transformStyle: "preserve-3d",
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: [30, 15, 30] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Right Cover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-orange-800 to-amber-900 rounded-r-xl shadow-2xl">
              {/* Cover Pattern */}
              <div className="absolute inset-0 p-6 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-amber-300/30 rounded-sm"
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Spine Edge */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-900 to-amber-800" />
            </div>

            {/* Right Inner Page */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 rounded-r-lg"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Page Lines */}
              <div className="p-6 space-y-2">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-px bg-amber-300/40"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1 + 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Center Spine */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 shadow-xl z-10">
            {/* Spine Details */}
            <div className="h-full flex flex-col justify-center items-center gap-2 py-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-1 h-2 bg-amber-300/40 rounded" />
              ))}
            </div>
          </div>

          {/* Floating Sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-400 rounded-full"
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                x: [-20, 20, -20],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Light Rays */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96">
              <div className="absolute inset-0 bg-gradient-radial from-amber-300/20 via-orange-300/10 to-transparent rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <p className="text-lg font-medium text-amber-700 dark:text-amber-400 mb-1">
            Opening notebook...
          </p>
          <div className="flex gap-1 justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-amber-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Page Turn Effect */}
        <motion.div
          className="absolute top-0 right-32 w-32 h-80 origin-left"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: [0, -180, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white to-amber-50 rounded-r-lg shadow-xl">
            <div className="p-4 space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-px bg-amber-200" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
