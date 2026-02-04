'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: 'default' | 'masc' | 'fem' | 'neut'
}

export function ProgressBar({
  value,
  max = 100,
  className,
  color = 'default',
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const clampedValue = Math.min(Math.max(value, 0), safeMax)
  const percentage = Math.min(Math.max((clampedValue / safeMax) * 100, 0), 100)

  const colorMap = {
    default: 'bg-primary',
    masc: 'bg-gender-masc',
    fem: 'bg-gender-fem',
    neut: 'bg-gender-neut',
  }

  return (
    <div
      className={cn(
        'bg-secondary h-3 w-full overflow-hidden rounded-full',
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
    >
      <motion.div
        className={cn('h-full', colorMap[color])}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        layout
      />
    </div>
  )
}
