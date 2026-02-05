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
    <div className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-8 px-4 sm:mt-8">
      <h2 className="font-heading text-center text-2xl leading-tight font-bold text-zinc-800 sm:text-3xl">
        {exercise.prompt}
      </h2>

      {/* The Sentence Line (Drop Zone) */}
      <div className="flex min-h-[80px] w-full flex-wrap items-center justify-center gap-2 rounded-xl border-b-2 border-zinc-200 bg-zinc-100 p-4 transition-colors">
        <AnimatePresence mode="popLayout">
          {selectedIndices.length === 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none text-xl font-bold text-zinc-400 italic select-none"
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
              className="rounded-lg border-2 border-zinc-200 bg-white px-3 py-2 font-bold text-zinc-700 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
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
                  'rounded-xl border-2 border-transparent px-4 py-3 font-bold text-transparent select-none',
                  selected ? 'block' : 'hidden' // Only take space if moved
                )}
              >
                {word}
              </div>

              {/* The draggable-ish button */}
              {!selected && (
                <motion.button
                  layoutId={`word-${index}`}
                  className="absolute inset-0 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700 shadow-[0_2px_0_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-zinc-50 active:translate-y-0 active:shadow-none"
                  onClick={() => handleWordClick(index)}
                >
                  {word}
                </motion.button>
              )}

              {/* If not selected, render normal button. If selected, render nothing (it moved) */}
              {!selected && (
                <div className="pointer-events-none px-4 py-3 opacity-0">
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
