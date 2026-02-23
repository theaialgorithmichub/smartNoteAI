"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  datesWithNotes?: string[]
  size?: "md" | "lg"
  className?: string
}

export function FuturisticCalendar({
  selectedDate,
  onDateSelect,
  datesWithNotes = [],
  size = "md",
  className
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const sizeConfig = size === "lg"
    ? {
        wrapper: "max-w-none",
        panel: "p-7",
        header: "mb-6",
        navButton: "p-3",
        navIcon: "w-7 h-7",
        month: "text-xl",
        weekRow: "gap-2 mb-5",
        weekDay: "text-base py-2.5",
        grid: "gap-2",
        dayCell: "text-lg"
      }
    : {
        wrapper: "max-w-none",
        panel: "p-6",
        header: "mb-5",
        navButton: "p-2.5",
        navIcon: "w-6 h-6",
        month: "text-lg",
        weekRow: "gap-1.5 mb-4",
        weekDay: "text-sm py-2",
        grid: "gap-1.5",
        dayCell: "text-base"
      }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    return { daysInMonth, startingDayOfWeek }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const hasNotes = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return datesWithNotes.includes(formatDate(date))
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth()
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className={`relative w-full ${sizeConfig.wrapper} ${className ?? ""}`.trim()}>
      {/* Futuristic glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-xl blur-lg"></div>
      
      <div className={`relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 rounded-xl ${sizeConfig.panel} border border-emerald-500/20 shadow-xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${sizeConfig.header}`}>
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={previousMonth}
            className={`${sizeConfig.navButton} rounded-md bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 transition-all`}
          >
            <ChevronLeft className={`${sizeConfig.navIcon} text-emerald-400`} />
          </motion.button>
          
          <h3 className={`${sizeConfig.month} font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent`}>
            {monthName}
          </h3>
          
          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextMonth}
            className={`${sizeConfig.navButton} rounded-md bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 transition-all`}
          >
            <ChevronRight className={`${sizeConfig.navIcon} text-emerald-400`} />
          </motion.button>
        </div>

        {/* Days of week */}
        <div className={`grid grid-cols-7 ${sizeConfig.weekRow}`}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={i}
              className={`text-center font-bold text-cyan-400/60 ${sizeConfig.weekDay}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={`grid grid-cols-7 ${sizeConfig.grid}`}>
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const selected = isSelected(day)
            const today = isToday(day)
            const notes = hasNotes(day)

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDateSelect(date)}
                className={`
                  relative aspect-square w-full rounded-xl ${sizeConfig.dayCell} font-medium transition-all flex items-center justify-center
                  ${selected
                    ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/50 border border-emerald-400'
                    : today
                    ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-blue-300 border border-blue-400/50'
                    : notes
                    ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-neutral-800/50 text-neutral-400 border border-neutral-700/30 hover:bg-neutral-700/50 hover:border-emerald-500/30'
                  }
                `}
              >
                <span className="relative z-10">{day}</span>
                
                {/* Glow effect for selected date */}
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-md blur-sm -z-10"
                  />
                )}
                
                {/* Note indicator */}
                {notes && !selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Futuristic corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-emerald-500/30 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/30 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-blue-500/30 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-emerald-500/30 rounded-br-xl"></div>
      </div>
    </div>
  )
}
