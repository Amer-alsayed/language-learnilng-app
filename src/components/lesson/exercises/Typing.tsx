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
    <div className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-8 px-4 sm:mt-8">
      <h2 className="font-heading text-center text-2xl leading-tight font-bold text-zinc-800 sm:text-3xl">
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
            'min-h-[160px] w-full resize-none rounded-2xl border-2 p-6 text-xl font-medium transition-all outline-none sm:text-2xl',
            // Idle
            status === 'active' &&
              'border-zinc-200 bg-zinc-50 text-zinc-800 focus:border-zinc-400',
            // Correct
            status === 'feedback' &&
              lastFeedback?.isCorrect &&
              'border-green-500 bg-green-50 text-green-800',
            // Wrong
            status === 'feedback' &&
              !lastFeedback?.isCorrect &&
              'border-red-500 bg-red-50 text-red-800',
            // Disabled state
            status !== 'active' && status !== 'feedback' && 'opacity-50'
          )}
          spellCheck={false}
          autoComplete="off"
        />

        {/* Character count or helper could go here */}
      </div>

      {status === 'active' && (
        <div className="text-center text-sm text-zinc-400">
          Press <strong>Enter</strong> to submit (Not implemented yet, click
          button)
        </div>
      )}
    </div>
  )
}
