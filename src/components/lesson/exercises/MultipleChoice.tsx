'use client'
import { MultipleChoice as MultipleChoiceType } from '@/types/schemas'
import { AnswerButton } from '@/components/ui/answer-button'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { useEffect } from 'react'

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
    <div className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-8 px-4 sm:mt-8">
      <h2 className="font-heading text-center text-2xl leading-tight font-bold text-zinc-800 sm:text-3xl">
        {exercise.prompt}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
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

          return (
            <AnswerButton
              key={index}
              shortcut={(index + 1).toString()}
              state={state}
              onClick={() => status === 'active' && setDraftAnswer(index)}
              disabled={status !== 'active'}
            >
              {option}
            </AnswerButton>
          )
        })}
      </div>
    </div>
  )
}
