import { create } from 'zustand'
import { Exercise } from '@/types/schemas'
import { validateAnswer, ValidationResult } from '@/lib/lesson-logic'

interface LessonSessionStats {
  correctCount: number
  wrongCount: number
  startTime: number
  endTime?: number
}

interface LessonState {
  // Static Data
  exercises: Exercise[]

  // Dynamic State
  status: 'idle' | 'active' | 'feedback' | 'finished' | 'failed'
  currentIndex: number
  hearts: number
  combo: number // Current streak
  maxCombo: number // Best streak this session

  // Interaction State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draftAnswer: any // The answer currently selected by the user

  // Feedback Data (for the Banner)
  lastFeedback: ValidationResult | null

  // Stats
  stats: LessonSessionStats

  // Actions
  initialize: (exercises: Exercise[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setDraftAnswer: (answer: any) => void
  submitAnswer: () => void // No arg needed now, uses draftAnswer
  continue: () => void // Go to next exercise (or correct -> next)
}

export const useLessonStore = create<LessonState>((set, get) => ({
  // Defaults
  exercises: [],
  status: 'idle',
  currentIndex: 0,
  hearts: 5,
  combo: 0,
  maxCombo: 0,
  draftAnswer: null,
  lastFeedback: null,
  stats: {
    correctCount: 0,
    wrongCount: 0,
    startTime: Date.now(),
  },

  initialize: (exercises) => {
    set({
      exercises,
      status: 'active',
      currentIndex: 0,
      hearts: 5,
      combo: 0,
      maxCombo: 0,
      lastFeedback: null,
      stats: {
        correctCount: 0,
        wrongCount: 0,
        startTime: Date.now(),
      },
    })
  },

  setDraftAnswer: (answer) => set({ draftAnswer: answer }),

  submitAnswer: () => {
    const {
      exercises,
      currentIndex,
      combo,
      maxCombo,
      hearts,
      stats,
      draftAnswer,
    } = get()
    const currentExercise = exercises[currentIndex]

    if (!currentExercise || draftAnswer === null || draftAnswer === undefined)
      return

    const result = validateAnswer(currentExercise, draftAnswer)

    if (result.isCorrect) {
      // CORRECT
      const newCombo = combo + 1
      set({
        status: 'feedback', // We still go to feedback state to show "Correct!" banner
        combo: newCombo,
        maxCombo: Math.max(newCombo, maxCombo),
        lastFeedback: result,
        stats: { ...stats, correctCount: stats.correctCount + 1 },
      })
      // Optional: Play sound logic here or via subscriber
    } else {
      // WRONG
      const newHearts = hearts - 1
      set({
        status: newHearts <= 0 ? 'failed' : 'feedback',
        hearts: newHearts,
        combo: 0,
        lastFeedback: result,
        stats: { ...stats, wrongCount: stats.wrongCount + 1 },
      })
    }
  },

  continue: () => {
    const { status, currentIndex, exercises } = get()

    if (status === 'failed') {
      // usually this triggers a reset or redirect, handled by UI
      return
    }

    if (status === 'finished') {
      return
    }

    // Move to next
    const nextIndex = currentIndex + 1

    if (nextIndex >= exercises.length) {
      set({
        status: 'finished',
        lastFeedback: null,
        stats: { ...get().stats, endTime: Date.now() },
      })
    } else {
      set({
        status: 'active',
        currentIndex: nextIndex,
        draftAnswer: null, // Reset for next question
        lastFeedback: null,
      })
    }
  },
}))
