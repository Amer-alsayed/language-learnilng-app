'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface AnswerButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  state?: 'idle' | 'selected' | 'correct' | 'wrong'
  shortcut?: string // e.g. "1", "A"
  gender?: 'masc' | 'fem' | 'neut'
  children: React.ReactNode
}

export function AnswerButton({
  state = 'idle',
  shortcut,
  className,
  children,
  type,
  disabled,
  gender,
  ...props
}: AnswerButtonProps) {
  const isDisabled = disabled || state === 'correct' || state === 'wrong'

  // Gender Styles
  const genderStyles = {
    masc: {
      idle: 'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900',
      selected: 'border-blue-500 bg-blue-50 text-blue-900',
      badge: 'group-hover:border-blue-200 group-hover:text-blue-700',
    },
    fem: {
      idle: 'hover:border-red-300 hover:bg-red-50 hover:text-red-900',
      selected: 'border-red-500 bg-red-50 text-red-900',
      badge: 'group-hover:border-red-200 group-hover:text-red-700',
    },
    neut: {
      idle: 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900',
      selected: 'border-emerald-500 bg-emerald-50 text-emerald-900',
      badge: 'group-hover:border-emerald-200 group-hover:text-emerald-700',
    },
  }

  const gStyle = gender ? genderStyles[gender] : null

  return (
    <motion.button
      type={type ?? 'button'}
      whileHover={state === 'idle' ? { scale: 1.01 } : {}}
      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
      className={cn(
        'group focus-visible:ring-ring relative flex w-full items-center rounded-2xl border-2 px-3 py-2.5 text-left font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-100 sm:px-4 sm:py-3.5',
        // Idle State
        state === 'idle' && 'border-border bg-card text-foreground shadow-sm',
        // Gender Specific Idle
        state === 'idle' && gStyle ? gStyle.idle : 'hover:bg-muted',

        // Selected State
        state === 'selected' &&
          (gStyle
            ? gStyle.selected
            : 'border-primary bg-primary/10 text-foreground'),

        // Correct State
        state === 'correct' &&
          'border-emerald-500 bg-emerald-50 text-emerald-900',
        // Wrong State
        state === 'wrong' && 'border-red-500 bg-red-50 text-red-900',
        className
      )}
      disabled={isDisabled} // Disable interaction after judgement
      aria-pressed={state === 'selected'}
      {...props}
    >
      {shortcut && (
        <span
          className={cn(
            'mr-3 flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold transition-colors sm:mr-4 sm:h-8 sm:w-8 sm:text-sm',
            state === 'idle' &&
              (gStyle
                ? `border-border text-muted-foreground ${gStyle.badge}`
                : 'border-border text-muted-foreground'),
            state === 'selected' &&
              (gStyle
                ? `border-transparent ${gStyle.selected}`
                : 'border-primary bg-primary/10 text-foreground'),
            state === 'correct' &&
              'border-transparent bg-emerald-500 text-white',
            state === 'wrong' && 'border-transparent bg-red-500 text-white'
          )}
        >
          {shortcut}
        </span>
      )}

      <span className="min-w-0 flex-1 text-sm leading-snug break-words sm:text-base">
        {children}
      </span>

      {/* Status Icons */}
      <div className="ml-4">
        {state === 'correct' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check className="h-6 w-6 text-emerald-600" />
          </motion.div>
        )}
        {state === 'wrong' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <X className="h-6 w-6 text-red-600" />
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}
