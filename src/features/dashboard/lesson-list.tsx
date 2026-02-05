'use client'

import { useLessons } from './use-lessons'
import { Play, Lock, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export function LessonList() {
  const { data, isLoading, error } = useLessons()

  if (isLoading)
    return (
      <div className="flex h-40 items-center justify-center gap-2 text-slate-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Accessing Database...
      </div>
    )

  if (error)
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-red-200">
        Error loading lessons: {error.message}
      </div>
    )

  return (
    <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((lesson, index) => (
        <Link
          key={lesson.id}
          href={`/lesson/${lesson.id}`}
          className="group relative"
        >
          <div className="glass-panel rounded-2xl border-slate-800 bg-slate-900/40 p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-purple-500/10">
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
                UNIT {lesson.unit_id.split('-')[0] || '01'}
              </span>
              {index === 0 ? (
                <span className="text-green-400">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              ) : (
                <Lock className="h-4 w-4 text-slate-600" />
              )}
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
                0% Done
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all ring-inset group-hover:ring-purple-500/30" />
          </div>
        </Link>
      ))}
    </div>
  )
}
