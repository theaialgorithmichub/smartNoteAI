"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"

export interface AnimatedCardItem {
  id: number
  title: string
  description: string
  /** Website URL to render inside an iframe preview */
  iframeUrl?: string
  /** Fallback image URL when iframeUrl is not available */
  imageUrl?: string
}

interface Card {
  id: number
  item: AnimatedCardItem
}

const defaultItems: AnimatedCardItem[] = [
  {
    id: 1,
    title: "Creative Showcase",
    description: "Beautiful layouts built with shadcn/ui",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Film Festival",
    description: "Curated selection of short films",
    imageUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Production Studio",
    description: "Behind the scenes of modern storytelling",
    imageUrl:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d4?auto=format&fit=crop&w=1200&q=80",
  },
]

const positionStyles = [
  { scale: 1, y: 16 },
  { scale: 0.95, y: -24 },
  { scale: 0.9, y: -64 },
]

const exitAnimation = {
  y: 420,
  scale: 1,
  zIndex: 10,
}

const enterAnimation = {
  y: -24,
  scale: 0.9,
}

function CardContent({ item }: { item: AnimatedCardItem }) {
  const { title, description, iframeUrl, imageUrl } = item

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="-outline-offset-1 flex h-[280px] sm:h-[320px] w-full items-center justify-center overflow-hidden rounded-xl outline outline-black/10 dark:outline-white/10">
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            title={title}
            className="h-full w-full border-0"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <img
            src={
              imageUrl ||
              "https://images.unsplash.com/photo-1517817748491-9280bfb8b4c4?auto=format&fit=crop&w=1200&q=80"
            }
            alt={title}
            className="h-full w-full select-none object-cover"
          />
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-2 px-3 pb-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-foreground">{title}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
      </div>
    </div>
  )
}

function AnimatedCard({
  card,
  index,
  isAnimating,
}: {
  card: Card
  index: number
  isAnimating: boolean
}) {
  const { scale, y } = positionStyles[index] ?? positionStyles[2]
  const zIndex = index === 0 && isAnimating ? 10 : 3 - index

  const exitAnim = index === 0 ? exitAnimation : undefined
  const initialAnim = index === 2 ? enterAnimation : undefined

  return (
    <motion.div
      key={card.id}
      initial={initialAnim}
      animate={{ y, scale }}
      exit={exitAnim}
      transition={{
        type: "spring",
        duration: 1,
        bounce: 0,
      }}
      style={{
        zIndex,
        left: "50%",
        x: "-50%",
        bottom: 0,
      }}
      className="absolute flex h-[380px] w-[380px] items-center justify-center overflow-hidden rounded-t-xl border-x border-t border-border bg-card p-2 shadow-lg will-change-transform sm:h-[420px] sm:w-[560px]"
    >
      <CardContent item={card.item} />
    </motion.div>
  )
}

export interface AnimatedCardStackProps {
  items?: AnimatedCardItem[]
}

export default function AnimatedCardStack({ items }: AnimatedCardStackProps) {
  const baseItems = useMemo(() => {
    const source = items && items.length > 0 ? items : defaultItems
    return source.slice(0, 3)
  }, [items])

  const [cards, setCards] = useState<Card[]>(
    baseItems.map((item) => ({ id: item.id, item }))
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const [nextId, setNextId] = useState(baseItems.length + 1)

  const handleAnimate = () => {
    if (cards.length === 0) return
    setIsAnimating(true)

    // Simple rotate: move first to end
    const rotated = [...cards.slice(1), cards[0]]
    setCards(
      rotated.map((card, index) => ({
        ...card,
        id: card.id ?? nextId + index,
      }))
    )

    setNextId((prev) => prev + 1)
    setIsAnimating(false)
  }

  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      <div className="relative h-[480px] w-full overflow-hidden sm:h-[520px] sm:w-[700px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 3).map((card, index) => (
            <AnimatedCard
              key={card.id}
              card={card}
              index={index}
              isAnimating={isAnimating}
            />
          ))}
        </AnimatePresence>
      </div>

      {cards.length > 1 && (
        <div className="relative z-10 -mt-px flex w-full items-center justify-center border-t border-border py-4">
          <button
            onClick={handleAnimate}
            className="flex h-12 w-12 cursor-pointer select-none items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:bg-secondary/80 hover:border-primary/30 active:scale-95"
            aria-label="Next card"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}

