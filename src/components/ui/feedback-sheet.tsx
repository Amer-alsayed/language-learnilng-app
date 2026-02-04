'use client'

import * as React from 'react'
import { Drawer } from 'vaul'
import { Check, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FeedbackSheetProps {
  isOpen: boolean
  isCorrect: boolean
  correctAnswer?: string
  explanation?: string
  onNext: () => void
  onOpenChange: (open: boolean) => void
}

export function FeedbackSheet({
  isOpen,
  isCorrect,
  correctAnswer,
  explanation,
  onNext,
  onOpenChange,
}: FeedbackSheetProps) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      shouldScaleBackground
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 mt-24 flex h-auto flex-col rounded-t-[20px] bg-white outline-none focus:outline-none">
          <div
            className={cn(
              'space-y-6 rounded-t-[20px] p-6',
              isCorrect ? 'bg-green-50' : 'bg-red-50' // Fallback to standard tailwind colors if custom tokens fail, using mix
            )}
          >
            <div
              className={cn(
                'bg-opacity-10 absolute inset-0 z-0',
                isCorrect ? 'bg-feedback-success' : 'bg-feedback-error'
              )}
            />

            <div className="relative z-10 mx-auto w-full max-w-md space-y-6">
              <Drawer.Title
                className={cn(
                  'font-heading flex items-center gap-3 text-2xl font-bold',
                  isCorrect ? 'text-feedback-success' : 'text-feedback-error'
                )}
              >
                {isCorrect ? (
                  <>
                    <div className="bg-feedback-success rounded-full p-2 text-white">
                      <Check className="h-6 w-6" />
                    </div>{' '}
                    Excellent!
                  </>
                ) : (
                  <>
                    <div className="bg-feedback-error rounded-full p-2 text-white">
                      <X className="h-6 w-6" />
                    </div>{' '}
                    Incorrect
                  </>
                )}
              </Drawer.Title>

              <div className="space-y-4">
                {!isCorrect && correctAnswer && (
                  <div className="rounded-xl border border-red-100/50 bg-white/60 p-4 backdrop-blur-sm">
                    <p className="mb-1 text-xs font-bold tracking-wider text-red-400 uppercase">
                      Correct Answer
                    </p>
                    <p className="text-foreground text-lg font-bold">
                      {correctAnswer}
                    </p>
                  </div>
                )}

                {explanation && (
                  <div className="text-muted-foreground text-base leading-relaxed">
                    {explanation}
                  </div>
                )}

                <Button
                  className={cn(
                    'h-14 w-full text-lg font-bold shadow-lg shadow-black/5 transition-transform active:scale-[0.98]',
                    isCorrect
                      ? 'bg-feedback-success hover:bg-feedback-success/90 text-white'
                      : 'bg-feedback-error hover:bg-feedback-error/90 text-white'
                  )}
                  onClick={onNext}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  autoFocus
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
