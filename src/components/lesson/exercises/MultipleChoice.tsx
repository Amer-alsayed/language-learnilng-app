'use client'
import { MultipleChoice as MultipleChoiceType } from '@/types/schemas'
import { AnswerButton } from '@/components/ui/answer-button'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export function MultipleChoice({ exercise }: { exercise: MultipleChoiceType }) {
  const { setDraftAnswer, draftAnswer, status, lastFeedback } = useLessonStore()

  // Keyboard navigation
  useEffect(() => {
    if (status !== 'active') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = parseInt(e.key)
      if (!isNaN(key) && key >= 1 && key <= exercise.options.length) {
        setDraftAnswer(key - 1)
      }
      // Enter to submit? Maybe later.
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, exercise.options.length, setDraftAnswer])

  return (
    <div className="mx-auto mt-2 flex w-full max-w-2xl flex-col gap-6 px-0 sm:mt-6 sm:gap-8">
      <h2 className="font-heading text-foreground text-center text-xl leading-tight font-extrabold sm:text-3xl">
        {exercise.prompt}
      </h2>

      <div
        className={cn(
          'grid gap-2 sm:gap-4',
          exercise.options.length >= 6 ? 'grid-cols-2' : 'grid-cols-1',
          exercise.options.length >= 8 &&
            'max-h-[46vh] overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]'
        )}
      >
        {exercise.options.map((option, index) => {
          const isSelected = draftAnswer === index
          let state: 'idle' | 'selected' | 'correct' | 'wrong' = 'idle'

          if (status === 'feedback') {
            if (index === exercise.correctOptionIndex) {
              state = 'correct'
            } else if (isSelected && lastFeedback && !lastFeedback.isCorrect) {
              state = 'wrong'
            } else {
              state = 'idle' // or maybe 'dimmed'? AnswerButton takes disabled prop
            }
          } else {
            state = isSelected ? 'selected' : 'idle'
          }

          // Determine Gender
          // "Der Mann", "Der", "der", "die Frau"
          const lowerOpt = option.toLowerCase().trim()
          let gender: 'masc' | 'fem' | 'neut' | undefined
          if (lowerOpt === 'der' || lowerOpt.startsWith('der ')) gender = 'masc'
          if (lowerOpt === 'die' || lowerOpt.startsWith('die ')) gender = 'fem'
          if (lowerOpt === 'das' || lowerOpt.startsWith('das ')) gender = 'neut'

          return (
            <AnswerButton
              key={index}
              shortcut={(index + 1).toString()}
              state={state}
              onClick={() => status === 'active' && setDraftAnswer(index)}
              disabled={status !== 'active'}
              gender={gender}
            >
              {option}
            </AnswerButton>
          )
        })}
      </div>
    </div>
  )
}
