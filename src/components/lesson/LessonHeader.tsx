'use client'
import Link from 'next/link'
import { X, Heart } from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { motion } from 'framer-motion'

export function LessonHeader({ onExit }: { onExit?: () => void }) {
  const { hearts, currentIndex, exercises, status } = useLessonStore()

  const progress =
    status === 'finished'
      ? 100
      : exercises.length > 0
        ? ((currentIndex + (status === 'feedback' ? 0.5 : 0)) /
            exercises.length) *
          100
        : 0

  return (
    <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/70 fixed top-0 right-0 left-0 z-40 mx-auto flex h-14 w-full max-w-3xl items-center justify-between border-b px-4 backdrop-blur sm:h-16">
      {onExit ? (
        <button
          type="button"
          onClick={onExit}
          className="text-muted-foreground hover:text-foreground -ml-2 p-2 transition-colors"
          aria-label="Exit lesson"
        >
          <X className="h-6 w-6" />
        </button>
      ) : (
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground -ml-2 p-2 transition-colors"
        >
          <X className="h-6 w-6" />
        </Link>
      )}

      <div className="mx-4 flex-1 sm:mx-8">
        <ProgressBar value={progress} className="h-4" />
      </div>

      <div className="flex items-center gap-2 font-bold text-red-400">
        <motion.div
          key={hearts}
          initial={{ x: 0 }}
          animate={{ x: [0, -5, 5, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Heart className="h-6 w-6 fill-current" />
        </motion.div>
        <span className="text-lg">{hearts}</span>
      </div>
    </header>
  )
}
