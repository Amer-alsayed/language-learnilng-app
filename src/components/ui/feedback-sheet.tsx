import { Drawer } from 'vaul'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

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
  isCorrect: initialIsCorrect,
  correctAnswer,
  explanation,
  onNext,
  onOpenChange,
}: FeedbackSheetProps) {
  // Freezing the state to prevent "Red Flash" on exit
  const [frozenState, setFrozenState] = useState({
    isCorrect: initialIsCorrect,
    correctAnswer,
  })

  useEffect(() => {
    if (
      isOpen &&
      (frozenState.isCorrect !== initialIsCorrect ||
        frozenState.correctAnswer !== correctAnswer)
    ) {
      // eslint-disable-next-line
      setFrozenState({ isCorrect: initialIsCorrect, correctAnswer })
    }
  }, [isOpen, initialIsCorrect, correctAnswer, frozenState])

  // Use frozen state if closing, otherwise active state usually matches
  // But strictly, we should just use frozen state whenever isOpen was true recently
  const activeIsCorrect = isOpen ? initialIsCorrect : frozenState.isCorrect
  const activeCorrectAnswer = isOpen ? correctAnswer : frozenState.correctAnswer

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-transparent" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 flex [transform:translateZ(0)] flex-col will-change-transform outline-none focus:outline-none">
          {/* 
               We put the color on the main wrapper. 
               Added pb-safe to handle iPhone home bar.
            */}
          <div
            className={cn(
              'max-h-[30dvh] w-full overflow-y-auto rounded-t-[32px] p-6 pb-12 shadow-[0_-12px_32px_-18px_rgba(15,23,42,0.18)] transition-colors duration-300',
              activeIsCorrect ? 'bg-green-100' : 'bg-red-100'
            )}
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              {/* Header Section */}
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full shadow-sm',
                    activeIsCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  )}
                >
                  {activeIsCorrect ? (
                    <Check size={28} strokeWidth={3} />
                  ) : (
                    <X size={28} strokeWidth={3} />
                  )}
                </div>
                <div className="flex flex-col">
                  <Drawer.Title
                    className={cn(
                      'text-2xl font-black tracking-tight',
                      activeIsCorrect ? 'text-green-800' : 'text-red-800'
                    )}
                  >
                    {activeIsCorrect ? 'Excellent!' : 'Incorrect'}
                  </Drawer.Title>
                  {/* Show correct answer if wrong */}
                  {!activeIsCorrect && activeCorrectAnswer && (
                    <p className="mt-1 font-medium text-red-600">
                      Correct answer:{' '}
                      <span className="font-bold">{activeCorrectAnswer}</span>
                    </p>
                  )}
                  {/* Explanation */}
                  {explanation && (
                    <p
                      className={cn(
                        'mt-1 text-base',
                        activeIsCorrect ? 'text-green-700' : 'text-red-700'
                      )}
                    >
                      {explanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={onNext}
                className={cn(
                  'h-14 w-full px-8 text-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 sm:w-auto',
                  activeIsCorrect
                    ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600'
                    : 'bg-red-500 text-white shadow-red-200 hover:bg-red-600'
                )}
              >
                Continue
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
