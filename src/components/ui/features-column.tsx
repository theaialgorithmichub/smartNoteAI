"use client";
import React from "react";
import { motion } from "framer-motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeaturesColumn = (props: {
  className?: string;
  features: Feature[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.features.map(({ icon, title, description }, i) => (
                <div 
                  className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 backdrop-blur-sm shadow-lg max-w-xs w-full transition-all hover:scale-105" 
                  key={i}
                  style={{
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--theme-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div className="mb-4" style={{ color: 'var(--theme-primary)' }}>{icon}</div>
                  <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{title}</div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{description}</div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
