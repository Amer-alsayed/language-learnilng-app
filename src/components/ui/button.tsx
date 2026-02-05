'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-[0_14px_30px_-22px_rgba(88,204,2,0.6)] hover:bg-primary/90 active:translate-y-[1px]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted hover:text-foreground',
        glass:
          'bg-card/90 backdrop-blur-sm border border-border shadow-sm hover:bg-muted text-foreground', // Light glass variant
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends
    Omit<HTMLMotionProps<'button'>, 'ref'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      children,
      leftIcon,
      rightIcon,
      type,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = isLoading || disabled
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
        whileTap={{ scale: 0.98 }}
        disabled={isDisabled}
        type={type ?? 'button'}
        aria-busy={isLoading || undefined}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {isLoading && (
          <Loader2 className="absolute mr-0 h-4 w-4 animate-spin" />
        )}
        <span
          className={cn('flex items-center gap-2', isLoading && 'invisible')}
        >
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </span>
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
