/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { Drawer } from 'vaul'
import Link from 'next/link'
import { Check, ChevronRight, Lock, Play } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import type { UnitGroup } from './use-lessons'

interface UnitGuideSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: UnitGroup | null
}

export function UnitGuideSheet({
  open,
  onOpenChange,
  unit,
}: UnitGuideSheetProps) {
  const [renderUnit, setRenderUnit] = useState<UnitGroup | null>(unit)

  useEffect(() => {
    if (unit) setRenderUnit(unit)
  }, [unit])

  useEffect(() => {
    if (open) return
    const timer = setTimeout(() => {
      if (!open) setRenderUnit(null)
    }, 520)
    return () => clearTimeout(timer)
  }, [open])

  if (!renderUnit) return null

  const totalLessons = renderUnit.lessons.length
  const completedLessons = renderUnit.lessons.filter(
    (l) => l.status === 'completed'
  ).length
  const firstPlayableLesson =
    renderUnit.lessons.find((l) => l.status === 'active') ??
    renderUnit.lessons.find((l) => l.status !== 'locked') ??
    null

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 flex [transform:translateZ(0)] flex-col will-change-transform outline-none focus:outline-none">
          <div className="border-border bg-card text-card-foreground mx-auto w-full max-w-lg rounded-t-[28px] border shadow-[0_-10px_40px_-15px_rgba(15,23,42,0.20)]">
            <Drawer.Handle className="bg-border mx-auto mt-3 h-1.5 w-10 rounded-full" />
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Unit {renderUnit.order_index} • {completedLessons}/
                    {totalLessons} lessons
                  </div>
                  <Drawer.Title className="font-heading mt-1 truncate text-2xl font-extrabold">
                    {renderUnit.title}
                  </Drawer.Title>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {renderUnit.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  Close
                </Button>
              </div>

              {firstPlayableLesson && (
                <div className="mt-5">
                  <Link
                    href={`/lesson/${firstPlayableLesson.id}`}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'flex w-full justify-between font-bold tracking-wide'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Continue
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>

            <div
              className="max-h-[70dvh] overflow-y-auto overscroll-contain px-6 pb-10"
              data-vaul-no-drag
            >
              <div className="mt-2 space-y-2">
                {renderUnit.lessons.map((lesson) => {
                  const isLocked = lesson.status === 'locked'
                  const Icon = isLocked
                    ? Lock
                    : lesson.status === 'completed'
                      ? Check
                      : Play

                  const row = (
                    <div
                      className={cn(
                        'flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors',
                        isLocked
                          ? 'border-border bg-muted text-muted-foreground'
                          : 'border-border bg-card hover:bg-muted'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-xl border',
                            isLocked
                              ? 'border-border bg-background'
                              : lesson.status === 'completed'
                                ? 'border-amber-200/70 bg-amber-50 text-amber-700'
                                : 'border-primary/40 bg-emerald-50 text-emerald-700'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">
                            {lesson.title}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {isLocked
                              ? 'Locked'
                              : lesson.status === 'completed'
                                ? 'Completed'
                                : 'Ready'}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={cn('h-5 w-5', isLocked && 'opacity-40')}
                      />
                    </div>
                  )

                  if (isLocked) return <div key={lesson.id}>{row}</div>

                  return (
                    <Link
                      key={lesson.id}
                      href={`/lesson/${lesson.id}`}
                      onClick={() => onOpenChange(false)}
                      className="block"
                    >
                      {row}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
