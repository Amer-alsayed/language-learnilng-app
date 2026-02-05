'use client'

import { useLessons } from './use-lessons'
import { Play, Lock, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export function LessonList() {
  const { data, isLoading, error } = useLessons()

  if (isLoading)
    return (
      <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
          >
            <div className="mb-4 flex items-start justify-between">
              <Skeleton className="h-6 w-16 bg-slate-800" />
              <Skeleton className="h-4 w-4 bg-slate-800" />
            </div>
            <Skeleton className="mb-2 h-7 w-3/4 bg-slate-800" />
            <div className="mt-4 flex items-center gap-4">
              <Skeleton className="h-3 w-12 bg-slate-800" />
              <Skeleton className="h-3 w-16 bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    )

  if (error)
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-red-200">
        Error loading lessons: {error.message}
      </div>
    )

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-slate-200">
        <h2 className="text-lg font-semibold">No lessons available yet</h2>
        <p className="mt-2 text-sm text-slate-400">
          Your instructor hasn&apos;t published any lessons. Please check back
          soon.
        </p>
      </div>
    )
  }

  const hasUnlocked = data.some((lesson) => lesson.status !== 'locked')

  return (
    <div className="flex w-full flex-col gap-4">
      {!hasUnlocked && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          No lessons are unlocked yet. Your instructor will activate the next
          lesson after class.
        </div>
      )}

      <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((lesson) => {
          const isLocked = lesson.status === 'locked'
          const isActive = lesson.status === 'active'
          const isCompleted = lesson.status === 'completed'
          const unitNumber =
            lesson.unitOrderIndex > 0
              ? lesson.unitOrderIndex
              : lesson.unitOrderIndex + 1

          const card = (
            <div className="glass-panel rounded-2xl border-slate-800 bg-slate-900/40 p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-purple-500/10">
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
                  UNIT {unitNumber}
                </span>
                {isActive && (
                  <span className="text-green-400">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                )}
                {isCompleted && (
                  <span className="text-amber-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                )}
                {isLocked && <Lock className="h-4 w-4 text-slate-600" />}
              </div>

              <h3 className="mb-2 text-lg font-bold text-slate-100 transition-colors group-hover:text-purple-300">
                {lesson.title}
              </h3>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~5 min
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {isCompleted
                    ? `${lesson.stars}/3 Stars`
                    : isActive
                      ? 'Ready'
                      : 'Locked'}
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all ring-inset group-hover:ring-purple-500/30" />
            </div>
          )

          if (isLocked) {
            return (
              <div key={lesson.id} className="group relative opacity-70">
                {card}
              </div>
            )
          }

          return (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="group relative"
            >
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
