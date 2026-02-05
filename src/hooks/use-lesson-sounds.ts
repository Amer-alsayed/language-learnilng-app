'use client'

import { useEffect, useRef } from 'react'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { soundManager } from '@/lib/sounds'

export function useLessonSounds() {
    const { status, lastFeedback } = useLessonStore()

    // Track previous feedback to detect *new* feedback events
    const prevFeedbackRef = useRef(lastFeedback)
    const prevStatusRef = useRef(status)

    useEffect(() => {
        // Check for feedback change (Answer submission)
        if (lastFeedback && lastFeedback !== prevFeedbackRef.current) {
            if (lastFeedback.isCorrect) {
                soundManager.play('correct')
            } else {
                soundManager.play('wrong')
            }
        }
        prevFeedbackRef.current = lastFeedback

        // Check for status change (Lesson completion)
        if (status === 'finished' && prevStatusRef.current !== 'finished') {
            soundManager.play('complete')
        }
        prevStatusRef.current = status

    }, [lastFeedback, status])
}
