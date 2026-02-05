/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { MatchPairs as MatchPairsType } from '@/types/schemas'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

// Helper to shuffle array (Fisher-Yates) - implementing locally to be safe
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

type Card = {
  id: string // unique id for key
  value: string
  side: 'left' | 'right'
  pairId: string // 'left' value to match against
}

export function MatchPairs({ exercise }: { exercise: MatchPairsType }) {
  const { setDraftAnswer, draftAnswer, status } = useLessonStore()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set())
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  // Prepare cards only once on mount
  const cards = useMemo(() => {
    const lefts: Card[] = exercise.pairs.map((p) => ({
      id: `l-${p.left}`,
      value: p.left,
      side: 'left',
      pairId: p.left,
    }))
    const rights: Card[] = exercise.pairs.map((p) => ({
      id: `r-${p.right}`,
      value: p.right,
      side: 'right',
      pairId: p.left,
    }))

    return shuffleArray([...lefts, ...rights])
  }, [exercise.pairs])

  useEffect(() => {
    setSelectedCard(null)
    setWrongIds(new Set())
    setRemovedIds(new Set())
  }, [exercise.pairs])

  // draftAnswer is Record<string, string> (left -> right)
  const matches = (draftAnswer as Record<string, string>) || {}

  const isMatched = (card: Card) => {
    if (card.side === 'left') return !!matches[card.value]
    // for right side, check if it is a value in matches
    return Object.values(matches).includes(card.value)
  }

  const handleCardClick = (card: Card) => {
    if (status !== 'active') return
    if (isMatched(card)) return // Already matched

    if (!selectedCard) {
      setSelectedCard(card)
    } else {
      if (selectedCard.id === card.id) {
        setSelectedCard(null) // Deselect
        return
      }

      // Check for match
      const isPair =
        (selectedCard.side === 'left' &&
          card.side === 'right' &&
          selectedCard.pairId === card.pairId) ||
        (selectedCard.side === 'right' &&
          card.side === 'left' &&
          card.pairId === selectedCard.pairId)

      if (isPair) {
        // Correct Match
        const leftValue =
          selectedCard.side === 'left' ? selectedCard.value : card.value
        const rightValue =
          selectedCard.side === 'right' ? selectedCard.value : card.value

        const newMatches = { ...matches, [leftValue]: rightValue }
        setDraftAnswer(newMatches)

        // Remove both cards with an exit animation
        const a = selectedCard.id
        const b = card.id
        setRemovedIds((prev) => new Set([...prev, a, b]))
        setSelectedCard(null)
      } else {
        if (selectedCard.side === card.side) {
          setSelectedCard(card) // Just switch selection
        } else {
          // Wrong pair
          setWrongIds(new Set([selectedCard.id, card.id]))
          setTimeout(() => setWrongIds(new Set()), 320)
          setSelectedCard(null)
        }
      }
    }
  }

  const visibleCards = useMemo(
    () => cards.filter((c) => !removedIds.has(c.id)),
    [cards, removedIds]
  )

  return (
    <div className="mx-auto mt-2 w-full max-w-2xl px-0 sm:mt-6">
      <h2 className="font-heading text-foreground mb-4 text-center text-xl font-extrabold sm:mb-6 sm:text-3xl">
        {exercise.prompt}
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <AnimatePresence initial={false}>
          {visibleCards.map((card) => {
            const matched = isMatched(card)
            const selected = selectedCard?.id === card.id
            const isWrong = wrongIds.has(card.id)

            return (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card)}
                initial={false}
                layout
                animate={
                  isWrong
                    ? {
                        x: [0, -6, 6, -6, 0],
                        transition: { duration: 0.28 },
                      }
                    : { opacity: 1, scale: 1, filter: 'blur(0px)' }
                }
                exit={{ opacity: 0, scale: 0.86, filter: 'blur(2px)' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ pointerEvents: matched ? 'none' : undefined }}
                className={cn(
                  'flex h-14 w-full items-center justify-center rounded-2xl border-2 border-b-4 p-2 text-center text-sm font-extrabold transition-colors sm:h-24 sm:text-base',
                  selected
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-border bg-card text-foreground hover:bg-muted shadow-sm active:translate-y-[2px] active:border-b-2',
                  isWrong && 'border-red-300 bg-red-50'
                )}
              >
                {card.value}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
