"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  FileText, 
  LayoutDashboard, 
  Code, 
  Calendar, 
  Brain,
  Check,
  ArrowRight,
  Sparkles,
  Mic
} from "lucide-react";
import { NOTEBOOK_TEMPLATES, NotebookTemplateType } from "@/types/notebook-templates";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Users,
  FileText,
  LayoutDashboard,
  Code,
  Calendar,
  Brain,
  Mic,
};

const colorMap: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500 to-orange-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-pink-500",
  },
  slate: {
    bg: "bg-slate-50 dark:bg-slate-900/20",
    border: "border-slate-200 dark:border-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-600 to-slate-800",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-red-500",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-600 dark:text-rose-400",
    gradient: "from-rose-500 to-pink-500",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500 to-purple-500",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-emerald-500",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    border: "border-teal-200 dark:border-teal-800",
    text: "text-teal-600 dark:text-teal-400",
    gradient: "from-teal-500 to-cyan-500",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-200 dark:border-cyan-800",
    text: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500 to-blue-500",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-500 to-purple-500",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-600 dark:text-sky-400",
    gradient: "from-sky-500 to-blue-500",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-600 dark:text-red-400",
    gradient: "from-red-500 to-rose-500",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-600 dark:text-yellow-400",
    gradient: "from-yellow-500 to-orange-500",
  },
  lime: {
    bg: "bg-lime-50 dark:bg-lime-900/20",
    border: "border-lime-200 dark:border-lime-800",
    text: "text-lime-600 dark:text-lime-400",
    gradient: "from-lime-500 to-green-500",
  },
};

interface TemplateSelectorProps {
  onSelect: (templateId: NotebookTemplateType) => void;
  selectedTemplate?: NotebookTemplateType;
}

export function TemplateSelector({ onSelect, selectedTemplate }: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<NotebookTemplateType | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Choose a Template
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400">
          Select a template that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NOTEBOOK_TEMPLATES.map((template) => {
          const Icon = iconMap[template.icon];
          const colors = colorMap[template.color] || colorMap.amber; // Fallback to amber if color not found
          const isSelected = selectedTemplate === template.id;
          const isHovered = hoveredTemplate === template.id;

          return (
            <motion.button
              key={template.id}
              onClick={() => onSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950 ${colors.text.replace('text-', 'ring-')}`
                  : `bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:${colors.border}`
              }`}
            >
              {/* Selected Indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center`}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-4`}>
                {Icon && <Icon className="w-6 h-6 text-white" />}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                {template.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {template.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {feature}
                  </span>
                ))}
                {template.features.length > 3 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    +{template.features.length - 3} more
                  </span>
                )}
              </div>

              {/* Hover Effect */}
              <AnimatePresence>
                {isHovered && !isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient} opacity-5`}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* AI Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              Not sure which template to use?
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Describe your use case and let AI suggest the best template for you
            </p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            Get Suggestion
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface TemplatePreviewProps {
  templateId: NotebookTemplateType;
}

export function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const template = NOTEBOOK_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  const colors = colorMap[template.color];
  const Icon = iconMap[template.icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
          {Icon && <Icon className="w-7 h-7 text-white" />}
        </div>
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            {template.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {template.description}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Features</h4>
        <div className="grid grid-cols-2 gap-2">
          {template.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
            >
              <Check className={`w-4 h-4 ${colors.text}`} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <button className={`w-full py-3 bg-gradient-to-r ${colors.gradient} text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
        Create with this template
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
