'use client'
import Link from 'next/link'
import { X, Heart } from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { motion } from 'framer-motion'

export function LessonHeader() {
    const { hearts, currentIndex, exercises, status } = useLessonStore()

    const progress = status === 'finished'
        ? 100
        : exercises.length > 0
            ? ((currentIndex + (status === 'feedback' ? 0.5 : 0)) / exercises.length) * 100
            : 0

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white z-40 px-4 flex items-center justify-between max-w-3xl mx-auto w-full">
            <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-600 transition-colors p-2 -ml-2">
                <X className="w-6 h-6" />
            </Link>

            <div className="flex-1 mx-4 sm:mx-8">
                <ProgressBar value={progress} className="h-4" />
            </div>

            <div className="flex items-center text-red-500 font-bold gap-2">
                <motion.div
                    key={hearts}
                    initial={{ x: 0 }}
                    animate={{ x: [0, -5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                >
                    <Heart className="w-6 h-6 fill-current" />
                </motion.div>
                <span className="text-lg">{hearts}</span>
            </div>
        </header>
    )
}
