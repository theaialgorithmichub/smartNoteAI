"use client"

import { motion } from "framer-motion"

export function RobotReadingAnimation() {
  return (
    <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-900 dark:via-slate-900 dark:to-neutral-900 flex items-center justify-center relative">
      {/* Circuit Board Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {[...Array(8)].map((_, i) => (
            <motion.line
              key={`h-${i}`}
              x1="0"
              y1={i * 12.5}
              x2="100"
              y2={i * 12.5}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-blue-500"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <motion.line
              key={`v-${i}`}
              x1={i * 12.5}
              y1="0"
              x2={i * 12.5}
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-blue-500"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10">
        {/* Robot */}
        <div className="relative w-32 h-40">
          {/* Robot Head */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20"
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Head Body */}
            <div className="relative w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-xl border-2 border-slate-400 dark:border-slate-600 shadow-lg">
              {/* Antenna */}
              <motion.div
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4 bg-slate-500 dark:bg-slate-600"
                animate={{
                  scaleY: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
              <motion.div
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500"
                animate={{
                  scale: [1, 1.5, 1],
                  boxShadow: [
                    "0 0 5px rgba(59, 130, 246, 0.5)",
                    "0 0 15px rgba(59, 130, 246, 0.8)",
                    "0 0 5px rgba(59, 130, 246, 0.5)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />

              {/* Eyes */}
              <div className="absolute top-6 left-0 right-0 flex justify-center gap-3">
                <motion.div
                  className="w-3 h-3 rounded-full bg-cyan-400"
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-0.5 left-0.5" />
                </motion.div>
                <motion.div
                  className="w-3 h-3 rounded-full bg-cyan-400"
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-0.5 left-0.5" />
                </motion.div>
              </div>

              {/* Display Screen */}
              <motion.div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>

          {/* Robot Body */}
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-24 h-16 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-lg border-2 border-slate-400 dark:border-slate-600 shadow-lg"
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Power Button */}
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-green-500"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />

            {/* Circuit Lines */}
            <div className="absolute inset-2 flex flex-col gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-0.5 bg-blue-400/50 rounded"
                  animate={{
                    width: ["40%", "80%", "40%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Robot Arms */}
          {/* Left Arm */}
          <motion.div
            className="absolute top-24 left-0 w-2 h-12 bg-gradient-to-b from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-full border border-slate-400 dark:border-slate-600"
            animate={{
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "top center" }}
          />
          {/* Right Arm */}
          <motion.div
            className="absolute top-24 right-0 w-2 h-12 bg-gradient-to-b from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-full border border-slate-400 dark:border-slate-600"
            animate={{
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "top center" }}
          />

          {/* Book */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-14"
            style={{ perspective: "500px" }}
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Book Left Page */}
            <motion.div
              className="absolute left-0 top-0 w-10 h-14 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-200 dark:to-orange-200 rounded-l-md border border-amber-300 shadow-md origin-right"
              animate={{
                rotateY: [-5, -15, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Page Lines */}
              <div className="p-2 space-y-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-px bg-amber-400/40" />
                ))}
              </div>
            </motion.div>

            {/* Book Right Page */}
            <motion.div
              className="absolute right-0 top-0 w-10 h-14 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-200 dark:to-amber-200 rounded-r-md border border-amber-300 shadow-md origin-left"
              animate={{
                rotateY: [5, 15, 5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Page Lines */}
              <div className="p-2 space-y-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-px bg-amber-400/40" />
                ))}
              </div>
            </motion.div>

            {/* Book Spine */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-14 bg-gradient-to-b from-amber-600 to-orange-700 z-10" />
          </motion.div>
        </div>

        {/* Data Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Binary Code Effect */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 space-y-1">
          {["1", "0", "1", "0", "1"].map((num, i) => (
            <motion.div
              key={i}
              className="text-xs font-mono text-blue-500/50 dark:text-blue-400/50"
              animate={{
                opacity: [0, 1, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Loading Text */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Processing...
        </p>
      </motion.div>
    </div>
  )
}
