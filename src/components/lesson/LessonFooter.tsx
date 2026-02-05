'use client'
import { Button } from '@/components/ui/button'
import { useLessonStore } from '@/lib/stores/use-lesson-store'

export function LessonFooter() {
  const { status, draftAnswer, submitAnswer } = useLessonStore()

  // Only show footer in 'active' state.
  // In 'feedback', the sheet takes over.
  // In 'finished', results screen takes over.
  if (status !== 'active') return null

  const isDisabled = draftAnswer === null

  return (
    <div className="animate-in slide-in-from-bottom-4 fixed right-0 bottom-0 left-0 z-40 border-t border-zinc-100 bg-white p-4 pb-6 duration-200 sm:pb-8">
      <div className="mx-auto w-full max-w-3xl">
        <Button
          className="h-12 w-full bg-green-500 text-lg font-bold tracking-wide text-white uppercase shadow-lg shadow-green-200/50 transition-all hover:bg-green-600 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
          disabled={isDisabled}
          onClick={() => submitAnswer()}
        >
          Check Answer
        </Button>
      </div>
    </div>
  )
}
