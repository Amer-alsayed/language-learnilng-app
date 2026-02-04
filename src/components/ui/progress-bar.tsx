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
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

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
