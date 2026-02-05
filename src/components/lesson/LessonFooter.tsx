'use client'
import { Button } from '@/components/ui/button'
import { useLessonStore } from '@/lib/stores/use-lesson-store'

export function LessonFooter() {
  const { status, draftAnswer, submitAnswer } = useLessonStore()

  // Only show footer in 'active' state.
  // In 'feedback', the sheet takes over.
  // In 'finished', results screen takes over.
  if (status !== 'active') return null

  const isDisabled =
    draftAnswer === null ||
    draftAnswer === undefined ||
    (Array.isArray(draftAnswer) && draftAnswer.length === 0) ||
    (typeof draftAnswer === 'string' && draftAnswer.trim().length === 0)

  return (
    <div className="animate-in slide-in-from-bottom-4 border-border bg-background/80 supports-[backdrop-filter]:bg-background/70 fixed right-0 bottom-0 left-0 z-40 border-t p-4 pb-6 backdrop-blur duration-200 sm:pb-8">
      <div className="mx-auto w-full max-w-3xl">
        <Button
          size="lg"
          className="h-12 w-full text-base font-extrabold tracking-wide uppercase shadow-[0_12px_30px_-22px_rgba(15,23,42,0.25)] transition-transform active:scale-[0.99] disabled:opacity-60 disabled:shadow-none"
          disabled={isDisabled}
          onClick={() => submitAnswer()}
        >
          Check Answer
        </Button>
      </div>
    </div>
  )
}
