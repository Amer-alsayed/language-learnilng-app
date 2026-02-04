'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type AnswerStatus = 'idle' | 'selected' | 'correct' | 'wrong'

interface AnswerButtonProps {
  text: string
  status?: AnswerStatus
  shortcutKey?: string
  onClick?: () => void
  disabled?: boolean
}

const statusStyles = {
  idle: 'bg-white border-2 border-border hover:border-primary/50 text-foreground', // Zen white
  selected: 'bg-primary border-primary text-primary-foreground', // Brand Blue
  correct: 'bg-feedback-success border-feedback-success text-white', // Green
  wrong: 'bg-feedback-error border-feedback-error text-white', // Red
}

export function AnswerButton({
  text,
  status = 'idle',
  shortcutKey,
  onClick,
  disabled,
}: AnswerButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || status !== 'idle'}
      className={cn(
        'relative w-full rounded-2xl p-4 text-left text-lg font-bold shadow-sm transition-all outline-none md:p-6 md:text-xl',
        statusStyles[status],
        status === 'idle' && 'hover:shadow-md active:scale-[0.99]',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      whileTap={status === 'idle' ? { scale: 0.98 } : undefined}
      animate={status === 'wrong' ? 'shake' : undefined}
      variants={{
        shake: {
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.4 },
        },
      }}
    >
      <div className="flex items-center gap-4">
        {shortcutKey && (
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold uppercase',
              status === 'idle'
                ? 'border-border bg-muted text-muted-foreground'
                : 'border-white/20 bg-white/20 text-white'
            )}
          >
            {shortcutKey}
          </span>
        )}
        <span className="flex-1">{text}</span>
      </div>
    </motion.button>
  )
}
