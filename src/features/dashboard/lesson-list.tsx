'use client'

import { useLessons } from './use-lessons'
import { Play, Lock, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export function LessonList() {
    const { data, isLoading, error } = useLessons()

    if (isLoading) return (
        <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Accessing Database...
        </div>
    )

    if (error) return (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-200">
            Error loading lessons: {error.message}
        </div>
    )

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
            {data?.map((lesson, index) => (
                <Link
                    key={lesson.id}
                    href={`/lesson/${lesson.id}`}
                    className="group relative"
                >
                    <div className="glass-panel p-6 rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-purple-500/10 border-slate-800 bg-slate-900/40">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md font-mono border border-slate-700">
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

                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors mb-2">
                            {lesson.title}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
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
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-purple-500/30 transition-all" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
