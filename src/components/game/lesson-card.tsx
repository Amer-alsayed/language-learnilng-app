'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Lock, Check, Play, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'

type LessonStatus = 'locked' | 'active' | 'completed'

interface LessonCardProps {
  title: string
  description: string
  status: LessonStatus
  progress: number // 0-100
  index: number
  onClick: () => void
}

export function LessonCard({
  title,
  description,
  status,
  progress,
  index,
  onClick,
}: LessonCardProps) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'
  const isActive = status === 'active'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
    >
      <Card
        role="button"
        tabIndex={!isLocked ? 0 : -1}
        onKeyDown={(e) => {
          if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
          }
        }}
        className={cn(
          'relative cursor-pointer overflow-hidden border-2 transition-all',
          isLocked &&
            'bg-muted/50 cursor-not-allowed border-transparent opacity-60 grayscale',
          isActive && 'border-primary ring-primary/20 shadow-lg ring-2', // Active glow
          isCompleted && 'border-yellow-500/50 bg-yellow-50/50', // Gold hint
          !isLocked ? 'hover:shadow-xl' : ''
        )}
        onClick={!isLocked ? onClick : undefined}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'font-heading text-lg font-bold',
                  isCompleted && 'text-yellow-700'
                )}
              >
                {title}
              </h3>
              {isCompleted && <Check className="h-5 w-5 text-yellow-600" />}
            </div>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {description}
            </p>

            {!isLocked && (
              <div className="pt-2">
                <ProgressBar
                  value={progress}
                  color={isCompleted ? 'neut' : 'default'}
                  className="h-2"
                />
                <p className="text-muted-foreground mt-1 text-xs font-medium">
                  {progress}% Mastered
                </p>
              </div>
            )}
          </div>

          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full shadow-inner',
              isLocked
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground',
              isCompleted && 'bg-yellow-500 text-white'
            )}
          >
            {isLocked && <Lock className="h-5 w-5" />}
            {isActive && <Play className="h-5 w-5 fill-current" />}
            {isCompleted && <Star className="h-5 w-5 fill-current" />}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
