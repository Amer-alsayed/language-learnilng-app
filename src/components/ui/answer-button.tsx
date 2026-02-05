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
      idle: 'hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600',
      selected: 'border-blue-500 bg-blue-100 text-blue-700',
      badge: 'group-hover:border-blue-400 group-hover:text-blue-500',
    },
    fem: {
      idle: 'hover:border-red-400 hover:bg-red-50 hover:text-red-600',
      selected: 'border-red-500 bg-red-100 text-red-700',
      badge: 'group-hover:border-red-400 group-hover:text-red-500',
    },
    neut: {
      idle: 'hover:border-green-400 hover:bg-green-50 hover:text-green-600',
      selected: 'border-green-500 bg-green-100 text-green-700',
      badge: 'group-hover:border-green-400 group-hover:text-green-500',
    },
  }

  const gStyle = gender ? genderStyles[gender] : null

  return (
    <motion.button
      type={type ?? 'button'}
      whileHover={
        state === 'idle'
          ? {
              scale: 1.02,
              backgroundColor: gStyle ? undefined : 'rgba(0,0,0,0.02)',
            }
          : {}
      }
      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
      className={cn(
        'group focus-visible:ring-ring relative flex w-full items-center rounded-xl border-2 p-4 text-left font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        // Idle State
        state === 'idle' && 'border-zinc-200 bg-white text-zinc-800 shadow-sm',
        // Gender Specific Idle
        state === 'idle' && gStyle ? gStyle.idle : 'hover:border-zinc-300',

        // Selected State
        state === 'selected' &&
          (gStyle
            ? gStyle.selected
            : 'border-primary bg-primary/5 text-primary'),

        // Correct State
        state === 'correct' && 'border-green-500 bg-green-50 text-green-700',
        // Wrong State
        state === 'wrong' && 'border-red-500 bg-red-50 text-red-700',
        className
      )}
      disabled={isDisabled} // Disable interaction after judgement
      aria-pressed={state === 'selected'}
      {...props}
    >
      {shortcut && (
        <span
          className={cn(
            'mr-4 flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold transition-colors',
            state === 'idle' &&
              (gStyle
                ? `border-zinc-200 text-zinc-400 ${gStyle.badge}`
                : 'border-zinc-200 text-zinc-400'),
            state === 'selected' &&
              (gStyle
                ? `border-transparent ${gStyle.selected}`
                : 'border-primary text-primary'),
            state === 'correct' &&
              'border-green-500 border-transparent bg-green-500 text-white',
            state === 'wrong' &&
              'border-red-500 border-transparent bg-red-500 text-white'
          )}
        >
          {shortcut}
        </span>
      )}

      <span className="flex-1">{children}</span>

      {/* Status Icons */}
      <div className="ml-4">
        {state === 'correct' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check className="h-6 w-6 text-green-600" />
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
