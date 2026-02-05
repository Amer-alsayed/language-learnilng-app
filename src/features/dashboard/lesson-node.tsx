'use client'

import Link from 'next/link'
import { Check, Lock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LessonCardItem } from './use-lessons'

interface LessonNodeProps {
  lesson: LessonCardItem
  index: number // Visual index in the unit (0, 1, 2...)
  totalLessons: number
  xOffset: number
  isUnlocking?: boolean
}

export function LessonNode({ lesson, xOffset, isUnlocking }: LessonNodeProps) {
  const isLocked = lesson.status === 'locked'
  const isCompleted = lesson.status === 'completed'
  const isActive = lesson.status === 'active'

  const circleClasses = cn(
    'relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-b-8 text-2xl font-black transition will-change-transform sm:h-20 sm:w-20 sm:text-3xl',
    isLocked
      ? 'border-border bg-muted text-muted-foreground'
      : isCompleted
        ? 'border-amber-600/70 bg-amber-400 text-amber-950 shadow-[0_20px_50px_-34px_rgba(245,158,11,0.55)]'
        : 'border-primary/70 bg-primary text-primary-foreground shadow-[0_26px_70px_-44px_rgba(88,204,2,0.70)]',
    !isLocked &&
      'hover:brightness-[1.03] active:translate-y-0.5 active:border-b-4',
    isUnlocking && 'ring-4 ring-primary/25 animate-[unlock-pop_0.6s_ease-out]'
  )

  const node = (
    <div className="flex w-full flex-col items-center">
      {isActive && (
        <div className="mb-3 flex items-center justify-center">
          <div className="bg-primary ring-primary/30 relative rounded-full px-3 py-1 text-xs font-extrabold tracking-widest text-white shadow-[0_12px_30px_-18px_rgba(88,204,2,0.6)] ring-2">
            START
            <div className="border-t-primary absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent" />
          </div>
        </div>
      )}

      <div
        className="relative"
        style={{
          transform: `translateX(${xOffset}px)`,
        }}
      >
        {/* Glow container */}
        {!isLocked && (
          <div
            className={cn(
              'pointer-events-none absolute -inset-2 -z-20 rounded-full border',
              isCompleted
                ? 'border-amber-300/50 shadow-[0_0_24px_rgba(245,158,11,0.55)]'
                : 'border-primary/40 shadow-[0_0_28px_rgba(88,204,2,0.6)]'
            )}
          />
        )}

        {/* Stronger glow */}
        {!isLocked && !isCompleted && (
          <div className="bg-primary/35 animate-pulse-glow pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl" />
        )}
        {isCompleted && (
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-amber-400/40 blur-2xl" />
        )}
        {isActive && (
          <div className="bg-primary/45 pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl" />
        )}
        {isUnlocking && (
          <div className="bg-primary/55 pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl" />
        )}

        <div className={circleClasses} aria-label={lesson.title}>
          {isCompleted ? (
            <Check className="h-8 w-8 stroke-[4]" />
          ) : isLocked ? (
            <Lock className="h-6 w-6" />
          ) : (
            <Star className="h-8 w-8 fill-current" />
          )}
        </div>
      </div>

      {isCompleted && (
        <div
          className="mt-3 flex items-center justify-center gap-1"
          aria-label={`${lesson.stars} stars`}
        >
          {[...Array(3)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < lesson.stars
                  ? 'fill-amber-300 text-amber-300'
                  : 'text-slate-300'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )

  if (isLocked) return <div className="w-full">{node}</div>

  return (
    <div className="w-full" data-lesson-id={lesson.id}>
      <Link
        href={`/lesson/${lesson.id}`}
        className="block"
        onClick={() => {
          try {
            sessionStorage.setItem('dashboardLastLessonId', lesson.id)
            sessionStorage.setItem('dashboardScrollY', String(window.scrollY))
          } catch {}
        }}
      >
        {node}
      </Link>
    </div>
  )
}
