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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-100 z-40 pb-6 sm:pb-8 animate-in slide-in-from-bottom-4 duration-200">
            <div className="max-w-3xl mx-auto w-full">
                <Button
                    className="w-full h-12 text-lg font-bold uppercase tracking-wide bg-green-500 hover:bg-green-600 text-white shadow-green-200/50 shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                    disabled={isDisabled}
                    onClick={() => submitAnswer()}
                >
                    Check Answer
                </Button>
            </div>
        </div>
    )
}
