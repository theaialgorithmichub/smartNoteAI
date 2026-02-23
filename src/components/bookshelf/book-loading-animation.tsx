"use client"

import { motion } from "framer-motion"

export function BookLoadingAnimation() {
  return (
    <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center">
      <div className="relative w-32 h-40" style={{ perspective: "1000px" }}>
        {/* Animated 3D Book */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Book Front Cover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-r-lg shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            animate={{
              boxShadow: [
                "0 20px 60px rgba(217, 119, 6, 0.3)",
                "0 30px 80px rgba(217, 119, 6, 0.5)",
                "0 20px 60px rgba(217, 119, 6, 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Book Title Decoration */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
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
              
              {/* Sparkle Effect */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-8 h-8 bg-amber-200/50 rounded-full blur-md" />
              </motion.div>
            </div>

            {/* Book Spine Edge */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-800 to-amber-700 rounded-l-sm" />
          </motion.div>

          {/* Book Back Cover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-700 via-orange-700 to-amber-800 rounded-l-lg shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Back Cover Pattern */}
            <div className="absolute inset-0 p-4 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
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
          </motion.div>

          {/* Book Spine (3D depth) */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-900 to-amber-800"
            style={{
              transformOrigin: "left center",
              transform: "rotateY(-90deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Spine Text Lines */}
            <div className="h-full flex flex-col justify-center items-center gap-1 py-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-0.5 h-1 bg-amber-300/40 rounded" />
              ))}
            </div>
          </motion.div>

          {/* Book Pages (Right Edge) */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-neutral-100 to-neutral-200"
            style={{
              transformOrigin: "right center",
              transform: "rotateY(90deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Page Lines */}
            <div className="h-full flex flex-col justify-start pt-2 gap-px">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-full h-px bg-neutral-300/50" />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Loading...
        </p>
      </motion.div>
    </div>
  )
}
