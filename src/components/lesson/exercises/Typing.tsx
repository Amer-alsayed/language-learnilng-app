'use client'
import { Typing as TypingType } from '@/types/schemas'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { cn } from '@/lib/utils'
import { useRef, useEffect } from 'react'

export function Typing({ exercise }: { exercise: TypingType }) {
  const { setDraftAnswer, draftAnswer, status, lastFeedback, submitAnswer } =
    useLessonStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isNumeric =
    /^[0-9]+$/.test(exercise.correctAnswer.trim()) &&
    (exercise.acceptableAnswers?.every((a) => /^[0-9]+$/.test(a.trim())) ??
      true)

  // Auto-focus on mount
  useEffect(() => {
    if (status === 'active') {
      inputRef.current?.focus()
    }
  }, [status])

  return (
    <div className="mx-auto mt-2 flex w-full max-w-2xl flex-col gap-6 px-0 sm:mt-6 sm:gap-8">
      <h2 className="font-heading text-foreground text-center text-xl leading-tight font-extrabold sm:text-3xl">
        {exercise.prompt}
      </h2>

      <div className="relative w-full">
        <textarea
          ref={inputRef}
          value={draftAnswer || ''}
          onChange={(e) => setDraftAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return
            e.preventDefault()
            if (status !== 'active') return
            if (
              typeof draftAnswer === 'string' &&
              draftAnswer.trim().length === 0
            )
              return
            submitAnswer()
          }}
          disabled={status !== 'active'}
          placeholder={isNumeric ? '' : 'Type your answer here...'}
          inputMode={isNumeric ? 'numeric' : undefined}
          className={cn(
            'placeholder:text-muted-foreground min-h-[96px] w-full resize-none rounded-2xl border-2 p-4 text-lg font-medium transition-colors outline-none sm:min-h-[150px] sm:p-6 sm:text-2xl',
            // Idle
            status === 'active' &&
              'border-border bg-card text-foreground focus:border-primary/60',
            // Correct
            status === 'feedback' &&
              lastFeedback?.isCorrect &&
              'border-emerald-500 bg-emerald-50 text-emerald-900',
            // Wrong
            status === 'feedback' &&
              !lastFeedback?.isCorrect &&
              'border-red-500 bg-red-50 text-red-900',
            // Disabled state
            status !== 'active' && status !== 'feedback' && 'opacity-50'
          )}
          spellCheck={false}
          autoComplete="off"
        />

        {/* Character count or helper could go here */}
      </div>

      {status === 'active' && (
        <div className="text-muted-foreground text-center text-xs sm:text-sm">
          Press <strong>Enter</strong> to submit (Not implemented yet, click
          button)
        </div>
      )}
    </div>
  )
}
