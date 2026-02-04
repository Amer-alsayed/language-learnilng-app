'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Lock, Star, Play } from 'lucide-react'

interface LessonCardProps {
  title: string
  description?: string
  status: 'locked' | 'active' | 'completed'
  stars?: number
  index: number
  onClick?: () => void
}

export function LessonCard({
  title,
  description,
  status,
  stars = 0,
  index,
  onClick,
}: LessonCardProps) {
  const isLocked = status === 'locked'

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      type="button"
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      aria-disabled={isLocked}
      className={cn(
        'focus-visible:ring-ring relative w-full max-w-sm overflow-hidden rounded-2xl border-2 p-6 text-left transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        status === 'locked' &&
          'border-zinc-200 bg-zinc-100 text-zinc-400 disabled:cursor-not-allowed',
        status === 'active' &&
          'border-primary shadow-primary/10 cursor-pointer bg-white shadow-lg',
        status === 'completed' && 'cursor-pointer border-amber-200 bg-amber-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3
            className={cn(
              'text-lg font-bold',
              isLocked ? 'text-zinc-400' : 'text-foreground'
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                'text-sm',
                isLocked ? 'text-zinc-300' : 'text-muted-foreground'
              )}
            >
              {description}
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            status === 'locked' && 'bg-zinc-200',
            status === 'active' && 'bg-primary text-primary-foreground',
            status === 'completed' && 'bg-amber-100 text-amber-600'
          )}
        >
          {status === 'locked' && <Lock className="h-5 w-5" />}
          {status === 'active' && <Play className="h-5 w-5 fill-current" />}
          {status === 'completed' && <Star className="h-5 w-5 fill-current" />}
        </div>
      </div>

      {status === 'completed' && (
        <div className="mt-4 flex gap-1">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-4 w-4 transition-colors',
                star <= stars
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-zinc-300'
              )}
            />
          ))}
        </div>
      )}
    </motion.button>
  )
}
