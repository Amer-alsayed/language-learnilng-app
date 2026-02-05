'use client'
import { Typing as TypingType } from '@/types/schemas'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export function Typing({ exercise }: { exercise: TypingType }) {
    const { setDraftAnswer, draftAnswer, status, lastFeedback } = useLessonStore()
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Auto-focus on mount
    useEffect(() => {
        if (status === 'active') {
            inputRef.current?.focus()
        }
    }, [status])

    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto mt-4 sm:mt-8 px-4">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center text-zinc-800 leading-tight">
                {exercise.prompt}
            </h2>

            <div className="relative w-full">
                <textarea
                    ref={inputRef}
                    value={draftAnswer || ''}
                    onChange={(e) => setDraftAnswer(e.target.value)}
                    onKeyDown={(e) => {
                        // Prevent Enter from new-line, maybe submit?
                        // For now just let it be.
                    }}
                    disabled={status !== 'active'}
                    placeholder="Type your answer here..."
                    className={cn(
                        "w-full p-6 text-xl sm:text-2xl font-medium rounded-2xl resize-none min-h-[160px] transition-all outline-none border-2",
                        // Idle
                        status === 'active' && "bg-zinc-50 border-zinc-200 focus:border-zinc-400 text-zinc-800",
                        // Correct
                        status === 'feedback' && lastFeedback?.isCorrect && "bg-green-50 border-green-500 text-green-800",
                        // Wrong
                        status === 'feedback' && !lastFeedback?.isCorrect && "bg-red-50 border-red-500 text-red-800",
                        // Disabled state
                        status !== 'active' && status !== 'feedback' && "opacity-50"
                    )}
                    spellCheck={false}
                    autoComplete="off"
                />

                {/* Character count or helper could go here */}
            </div>

            {status === 'active' && (
                <div className="text-center text-zinc-400 text-sm">
                    Press <strong>Enter</strong> to submit (Not implemented yet, click button)
                </div>
            )}
        </div>
    )
}
