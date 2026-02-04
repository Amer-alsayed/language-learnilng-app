'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface AnswerButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  state?: 'idle' | 'selected' | 'correct' | 'wrong'
  shortcut?: string // e.g. "1", "A"
  children: React.ReactNode
}

export function AnswerButton({
  state = 'idle',
  shortcut,
  className,
  children,
  ...props
}: AnswerButtonProps) {
  return (
    <motion.button
      whileHover={
        state === 'idle'
          ? { scale: 1.02, backgroundColor: 'rgba(0,0,0,0.02)' }
          : {}
      }
      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
      className={cn(
        'group focus-visible:ring-ring relative flex w-full items-center rounded-xl border-2 p-4 text-left font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        // Idle State
        state === 'idle' &&
          'text-foreground border-zinc-200 bg-white hover:border-zinc-300',
        // Selected State
        state === 'selected' && 'border-primary bg-primary/5 text-primary',
        // Correct State
        state === 'correct' && 'border-green-500 bg-green-50 text-green-700',
        // Wrong State
        state === 'wrong' && 'border-red-500 bg-red-50 text-red-700',
        className
      )}
      disabled={state === 'correct' || state === 'wrong'} // Disable interaction after judgement
      {...props}
    >
      {shortcut && (
        <span
          className={cn(
            'mr-4 flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold transition-colors',
            state === 'idle' && 'border-zinc-200 text-zinc-400',
            state === 'selected' && 'border-primary text-primary',
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
