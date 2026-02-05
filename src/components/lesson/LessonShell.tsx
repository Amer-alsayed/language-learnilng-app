/* eslint-disable react-hooks/refs */
'use client'
import { useEffect, useRef, useState } from 'react'
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
import { useQueryClient } from '@tanstack/react-query'

interface LessonShellProps {
  initialExercises: Exercise[]
  lessonId: string
}

export function LessonShell({ initialExercises, lessonId }: LessonShellProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isExiting, setIsExiting] = useState(false)
  const didInitializeRef = useRef(false)
  const didMountRef = useRef(false)
  const didCompleteSideEffectRef = useRef(false)
  const prevStatusRef = useRef<
    'idle' | 'active' | 'feedback' | 'finished' | 'failed'
  >('idle')
  const {
    initialize,
    exercises,
    currentIndex,
    status,
    hearts,
    lastFeedback,
    sessionLessonId,
    draftAnswer,
    submitAnswer,
    continue: next,
  } = useLessonStore()

  useLessonSounds()

  // Invalidate dashboard cache and navigate
  const handleBackToDashboard = () => {
    try {
      sessionStorage.setItem('dashboardLastLessonId', lessonId)
      if (status === 'finished') {
        sessionStorage.setItem('dashboardJustCompletedLessonId', lessonId)
      }
    } catch {}
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
    router.push('/dashboard')
  }

  const handleExit = () => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(() => {
      handleBackToDashboard()
    }, 180)
  }

  // Initialize store on mount
  useEffect(() => {
    // React Strict Mode (dev) intentionally re-runs effects; guard to avoid
    // resetting progress and making the first exercise appear twice.
    if (didInitializeRef.current) return
    didInitializeRef.current = true
    initialize(initialExercises, lessonId)
  }, [initialExercises, initialize, lessonId])

  // Handle Completion Side Effect
  useEffect(() => {
    const prevStatus = prevStatusRef.current
    prevStatusRef.current = status

    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (status === 'finished') {
      if (prevStatus === 'finished') return
      if (didCompleteSideEffectRef.current) return
      didCompleteSideEffectRef.current = true
      if (sessionLessonId !== lessonId) return
      triggerConfetti()

      // Calculate Stars (Simple Logic for now)
      // 5 hearts = 3 stars, 3-4 = 2 stars, 1-2 = 1 star
      let stars = 1
      if (hearts === 5) stars = 3
      else if (hearts >= 3) stars = 2

      submitLessonResult(lessonId, stars).catch((err) => console.error(err))
    }
  }, [status, lessonId, hearts, sessionLessonId])

  const currentExercise = exercises[currentIndex]

  const canSubmit =
    status === 'active' &&
    draftAnswer !== null &&
    draftAnswer !== undefined &&
    !(Array.isArray(draftAnswer) && draftAnswer.length === 0) &&
    !(typeof draftAnswer === 'string' && draftAnswer.trim().length === 0)

  useEffect(() => {
    if (status !== 'active') return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      if (e.repeat) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // If user wants a newline in a textarea, allow Shift+Enter.
      if (e.shiftKey) return

      // If focus is inside an input/textarea, we still want Enter to submit,
      // but we must prevent newline/submit glitches.
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'textarea' || tag === 'input') {
        e.preventDefault()
      }

      if (!canSubmit) return
      submitAnswer()
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () =>
      window.removeEventListener('keydown', onKeyDown as EventListener)
  }, [status, canSubmit, submitAnswer])

  // If the global store still has state from another lesson, avoid flashing
  // the previous "finished" UI while this lesson initializes.
  if (
    !didInitializeRef.current &&
    sessionLessonId !== null &&
    sessionLessonId !== lessonId
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

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
          <p className="text-muted-foreground font-medium">
            You experienced +{hearts >= 5 ? 30 : hearts >= 3 ? 20 : 10} XP
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid w-full grid-cols-2 gap-4">
          <div className="border-border bg-card flex flex-col items-center rounded-2xl border p-4 shadow-sm">
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
            <span className="text-muted-foreground mt-1 text-xs font-bold tracking-wide uppercase">
              Accuracy
            </span>
          </div>
          <div className="border-border bg-card flex flex-col items-center rounded-2xl border p-4 shadow-sm">
            <span className="text-3xl font-bold text-blue-500">{hearts}</span>
            <span className="text-muted-foreground mt-1 text-xs font-bold tracking-wide uppercase">
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
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border-b-4 ${i <= (hearts >= 5 ? 3 : hearts >= 3 ? 2 : 1) ? 'border-yellow-600 bg-yellow-400' : 'border-border bg-muted'} shadow-[0_12px_30px_-22px_rgba(15,23,42,0.18)]`}
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
          onClick={handleBackToDashboard}
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
        <p className="text-muted-foreground text-xl">
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
          onClick={handleBackToDashboard}
          variant="ghost"
          className="w-full max-w-xs"
        >
          Quit
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-background text-foreground flex h-[100dvh] flex-col overflow-hidden"
      initial={false}
      animate={isExiting ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ pointerEvents: isExiting ? 'none' : undefined }}
    >
      <LessonHeader onExit={handleExit} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center overflow-y-auto overscroll-contain px-3 pt-14 pb-20 sm:px-4 sm:pt-20 sm:pb-28">
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
    </motion.div>
  )
}
