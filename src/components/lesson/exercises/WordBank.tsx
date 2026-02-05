'use client'
import { WordBank as WordBankType } from '@/types/schemas'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function WordBank({ exercise }: { exercise: WordBankType }) {
  const { setDraftAnswer, status } = useLessonStore()

  // Local state for the clicked words (indices)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  // Re-sync with store when internal state changes
  useEffect(() => {
    if (status === 'active') {
      setDraftAnswer(selectedIndices)
    }
  }, [selectedIndices, setDraftAnswer, status])

  const handleWordClick = (index: number) => {
    if (status !== 'active') return

    if (selectedIndices.includes(index)) {
      // Deselect (remove from list)
      setSelectedIndices((prev) => prev.filter((i) => i !== index))
    } else {
      // Select (append to list)
      setSelectedIndices((prev) => [...prev, index])
    }
  }

  const isSelected = (index: number) => selectedIndices.includes(index)

  return (
    <div className="mx-auto mt-2 flex w-full max-w-2xl flex-col gap-6 px-0 sm:mt-6 sm:gap-8">
      <h2 className="font-heading text-foreground text-center text-xl leading-tight font-extrabold sm:text-3xl">
        {exercise.prompt}
      </h2>

      {/* The Sentence Line (Drop Zone) */}
      <div className="border-border bg-card flex min-h-[56px] w-full flex-wrap items-center justify-center gap-2 rounded-2xl border p-3 transition-colors sm:min-h-[80px] sm:p-4">
        <AnimatePresence mode="popLayout">
          {selectedIndices.length === 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground pointer-events-none text-base font-bold italic select-none sm:text-xl"
            >
              Build sentence...
            </motion.span>
          )}
          {selectedIndices.map((index) => (
            <motion.button
              key={`selected-${index}`}
              layoutId={`word-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => handleWordClick(index)}
              className="border-border bg-muted text-foreground rounded-xl border px-3 py-2 text-sm font-bold shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-900 sm:text-base"
            >
              {exercise.sentenceParts[index]}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* The Word Bank (Source) */}
      <div className="flex flex-wrap justify-center gap-3">
        {exercise.sentenceParts.map((word, index) => {
          const selected = isSelected(index)
          return (
            <div key={index} className="relative">
              {/* Placeholder to keep layout stable */}
              <div
                className={cn(
                  'rounded-xl border-2 border-transparent px-4 py-2 text-sm font-bold text-transparent select-none sm:py-3 sm:text-base',
                  selected ? 'block' : 'hidden' // Only take space if moved
                )}
              >
                {word}
              </div>

              {/* The draggable-ish button */}
              {!selected && (
                <motion.button
                  layoutId={`word-${index}`}
                  className="border-border bg-card text-foreground hover:bg-muted absolute inset-0 rounded-xl border-2 px-4 py-2 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none sm:py-3 sm:text-base"
                  onClick={() => handleWordClick(index)}
                >
                  {word}
                </motion.button>
              )}

              {/* If not selected, render normal button. If selected, render nothing (it moved) */}
              {!selected && (
                <div className="pointer-events-none px-4 py-2 opacity-0 sm:py-3">
                  {word}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
