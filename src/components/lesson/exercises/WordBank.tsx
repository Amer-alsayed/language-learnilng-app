'use client'
import { WordBank as WordBankType } from '@/types/schemas'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function WordBank({ exercise }: { exercise: WordBankType }) {
    const { setDraftAnswer, draftAnswer, status, lastFeedback } = useLessonStore()

    // Local state for the clicked words (indices)
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])

    // Re-sync with store when internal state changes
    useEffect(() => {
        if (status === 'active') {
            setDraftAnswer(selectedIndices)
        }
    }, [selectedIndices, setDraftAnswer, status])

    // Reset when exercise changes
    useEffect(() => {
        setSelectedIndices([])
    }, [exercise])

    const handleWordClick = (index: number) => {
        if (status !== 'active') return

        if (selectedIndices.includes(index)) {
            // Deselect (remove from list)
            setSelectedIndices(prev => prev.filter(i => i !== index))
        } else {
            // Select (append to list)
            setSelectedIndices(prev => [...prev, index])
        }
    }

    const isSelected = (index: number) => selectedIndices.includes(index)

    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto mt-4 sm:mt-8 px-4">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center text-zinc-800 leading-tight">
                {exercise.prompt}
            </h2>

            {/* The Sentence Line (Drop Zone) */}
            <div className="min-h-[80px] w-full rounded-xl bg-zinc-100 border-b-2 border-zinc-200 p-4 flex flex-wrap gap-2 items-center justify-center transition-colors">
                <AnimatePresence mode='popLayout'>
                    {selectedIndices.length === 0 && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            className="text-zinc-400 font-bold text-xl italic pointer-events-none select-none"
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
                            className="bg-white border-2 border-zinc-200 shadow-sm rounded-lg px-3 py-2 font-bold text-zinc-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                            {exercise.sentenceParts[index]}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* The Word Bank (Source) */}
            <div className="flex flex-wrap gap-3 justify-center">
                {exercise.sentenceParts.map((word, index) => {
                    const selected = isSelected(index)
                    return (
                        <div key={index} className="relative">
                            {/* Placeholder to keep layout stable */}
                            <div className={cn(
                                "px-4 py-3 rounded-xl border-2 border-transparent font-bold text-transparent select-none",
                                selected ? "block" : "hidden" // Only take space if moved
                            )}>
                                {word}
                            </div>

                            {/* The draggable-ish button */}
                            {!selected && (
                                <motion.button
                                    layoutId={`word-${index}`}
                                    className="absolute inset-0 bg-white border-2 border-zinc-200 shadow-[0_2px_0_0_rgba(0,0,0,0.1)] rounded-xl px-4 py-3 font-bold text-zinc-700 hover:bg-zinc-50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                                    onClick={() => handleWordClick(index)}
                                >
                                    {word}
                                </motion.button>
                            )}

                            {/* If not selected, render normal button. If selected, render nothing (it moved) */}
                            {!selected && (
                                <div className="px-4 py-3 opacity-0 pointer-events-none">{word}</div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
