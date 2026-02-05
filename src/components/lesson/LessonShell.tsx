'use client'
import { useEffect } from 'react'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { LessonHeader } from './LessonHeader'
import { LessonFooter } from './LessonFooter'
import { ExerciseRenderer } from './ExerciseRenderer'
import { FeedbackSheet } from '@/components/ui/feedback-sheet'
import { AnimatePresence, motion } from 'framer-motion'
import { Exercise } from '@/types/schemas'
import { submitLessonResult } from '@/features/lesson/actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLessonSounds } from '@/hooks/use-lesson-sounds'
import { triggerConfetti } from '@/lib/confetti'

interface LessonShellProps {
  initialExercises: Exercise[]
  lessonId: string
}

export function LessonShell({ initialExercises, lessonId }: LessonShellProps) {
  const router = useRouter()
  const {
    initialize,
    exercises,
    currentIndex,
    status,
    hearts,
    lastFeedback,
    continue: next,
  } = useLessonStore()

  useLessonSounds()

  // Initialize store on mount
  useEffect(() => {
    initialize(initialExercises)
  }, [initialExercises, initialize])

  // Handle Completion Side Effect
  useEffect(() => {
    if (status === 'finished') {
      triggerConfetti()

      // Calculate Stars (Simple Logic for now)
      // 5 hearts = 3 stars, 3-4 = 2 stars, 1-2 = 1 star
      let stars = 1
      if (hearts === 5) stars = 3
      else if (hearts >= 3) stars = 2

      submitLessonResult(lessonId, stars).catch((err) => console.error(err))
    }
  }, [status, lessonId, hearts])

  const currentExercise = exercises[currentIndex]

  if (!currentExercise && status !== 'finished' && status !== 'failed') {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (status === 'finished') {
    return (
      <div className="animate-in zoom-in-50 mx-auto flex h-screen w-full max-w-md flex-col items-center justify-center space-y-8 p-8 text-center">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold text-yellow-500">
            Lesson Complete!
          </h1>
          <p className="font-medium text-zinc-500">
            You experienced +{hearts >= 5 ? 30 : hearts >= 3 ? 20 : 10} XP
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid w-full grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-4">
            <span className="text-3xl font-bold text-yellow-500">
              {hearts === 5
                ? '100'
                : hearts === 4
                  ? '90'
                  : hearts === 3
                    ? '80'
                    : hearts === 2
                      ? '60'
                      : '40'}
              %
            </span>
            <span className="mt-1 text-xs font-bold tracking-wide text-zinc-400 uppercase">
              Accuracy
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-4">
            <span className="text-3xl font-bold text-blue-500">{hearts}</span>
            <span className="mt-1 text-xs font-bold tracking-wide text-zinc-400 uppercase">
              Lives Left
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4 py-4">
          {/* Visual Stars */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.2, type: 'spring' }}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border-b-4 ${i <= (hearts >= 5 ? 3 : hearts >= 3 ? 2 : 1) ? 'border-yellow-600 bg-yellow-400' : 'border-zinc-300 bg-zinc-200'} shadow-sm`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={
                  i <= (hearts >= 5 ? 3 : hearts >= 3 ? 2 : 1)
                    ? 'white'
                    : '#a1a1aa'
                }
                stroke="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-star"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={() => router.push('/dashboard')}
          size="lg"
          className="w-full font-bold tracking-wide"
        >
          CONTINUE LEARNING
        </Button>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="animate-in zoom-in-50 flex h-screen flex-col items-center justify-center space-y-6 p-8 text-center">
        <h1 className="text-4xl font-bold text-red-500">Game Over</h1>
        <p className="text-xl text-zinc-600">
          Don&apos;t give up! Review and try again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="w-full max-w-xs"
        >
          Try Again
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="w-full max-w-xs"
        >
          Quit
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LessonHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center overflow-hidden px-4 pt-20 pb-32">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={
              // Shake if error
              status === 'feedback' && !lastFeedback?.isCorrect
                ? {
                    x: [0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.4 },
                  }
                : { opacity: 1, x: 0 }
            }
            exit={{ opacity: 0, x: -50, position: 'absolute' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {currentExercise && <ExerciseRenderer exercise={currentExercise} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <LessonFooter />

      <FeedbackSheet
        isOpen={status === 'feedback'}
        isCorrect={lastFeedback?.isCorrect ?? false}
        correctAnswer={lastFeedback?.correctAnswerDisplay}
        explanation={lastFeedback?.feedback}
        onNext={next}
        onOpenChange={() => {}} // Controlled by store
      />
    </div>
  )
}
