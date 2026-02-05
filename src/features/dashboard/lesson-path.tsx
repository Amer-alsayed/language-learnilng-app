/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLessons } from './use-lessons'
import { LessonNode } from './lesson-node'
import { Button } from '@/components/ui/button'
import { UnitGuideSheet } from './unit-guide-sheet'
import { AnimatePresence, motion } from 'framer-motion'

function offsetForIndex(index: number) {
  // Keep offsets conservative so it stays clean on mobile screens.
  const pattern = [0, 34, 0, -34]
  return pattern[index % pattern.length]
}

function LessonConnector({
  fromX,
  toX,
  isActive,
  isUnlocking,
}: {
  fromX: number
  toX: number
  isActive: boolean
  isUnlocking?: boolean
}) {
  const height = 78
  const startY = 10
  const endY = height - 10

  const dotColor = isActive
    ? 'rgba(88, 204, 2, 0.55)'
    : 'rgba(71, 85, 105, 0.20)'
  const activeColor = isUnlocking ? 'rgba(88, 204, 2, 0.75)' : dotColor

  return (
    <div className="relative w-full" style={{ height }} aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => {
        const t = (i + 1) / 10
        // Smooth curved path between nodes
        const x =
          fromX +
          (toX - fromX) * t +
          Math.sin(t * Math.PI) * ((toX - fromX) * 0.15)
        const y = startY + (endY - startY) * t

        const size = i % 3 === 0 ? 6 : i % 3 === 1 ? 5 : 4
        const opacity = isActive ? 0.9 - i * 0.05 : 0.55 - i * 0.03

        return (
          <span
            key={i}
            className={`absolute rounded-full${isUnlocking ? 'animate-trail-glow' : ''}`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: y,
              width: size,
              height: size,
              backgroundColor: activeColor,
              opacity: Math.max(0.12, opacity),
              transform: 'translateX(-50%)',
              filter: isActive
                ? 'drop-shadow(0 0 10px rgba(88,204,2,0.18))'
                : undefined,
              animationDelay: isUnlocking ? `${i * 0.06}s` : undefined,
              animationFillMode: isUnlocking ? 'both' : undefined,
            }}
          />
        )
      })}
    </div>
  )
}

export function LessonPath({
  onActiveUnitChange,
}: {
  onActiveUnitChange?: (payload: {
    id: string | null
    title: string | null
  }) => void
}) {
  const { data: units, isLoading, error } = useLessons()
  const [openUnitId, setOpenUnitId] = useState<string | null>(null)
  const didRestoreScrollRef = useRef(false)
  const unitRefs = useRef<Map<string, HTMLElement>>(new Map())
  const activeUnitIdRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const scrollEndTimerRef = useRef<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [showLoading, setShowLoading] = useState(true)
  const [unlockState, setUnlockState] = useState<{
    completedId: string
    nextId?: string
  } | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      try {
        sessionStorage.setItem('dashboardScrollY', String(window.scrollY))
      } catch {}
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openUnit = useMemo(() => {
    if (!openUnitId) return null
    return units?.find((u) => u.id === openUnitId) ?? null
  }, [openUnitId, units])

  const updateActiveUnit = useCallback(() => {
    if (!units || units.length === 0) return
    const targetX = Math.max(
      0,
      Math.min(window.innerWidth - 1, window.innerWidth / 2)
    )
    const targetY = Math.max(
      0,
      Math.min(window.innerHeight - 1, window.innerHeight * 0.42)
    )

    let finalId: string | null = null

    // Mobile-safe: pick the unit wrapper currently under a fixed viewport point.
    const stack = document.elementsFromPoint(targetX, targetY)
    for (const el of stack) {
      const unitEl = (el as HTMLElement).closest?.('[data-unit-id]')
      const id = unitEl?.getAttribute?.('data-unit-id')
      if (id) {
        finalId = id
        break
      }
    }

    // Fallback for rare cases where nothing is found at the point.
    if (!finalId) {
      const scrollY = window.scrollY
      const threshold = scrollY + window.innerHeight * 0.4
      let chosenId: string | null = null
      let chosenTop = Number.NEGATIVE_INFINITY
      let minTopId: string | null = null
      let minTop = Number.POSITIVE_INFINITY

      unitRefs.current.forEach((el, id) => {
        if (!el.isConnected) return
        const top = el.getBoundingClientRect().top + scrollY
        if (top <= threshold && top > chosenTop) {
          chosenTop = top
          chosenId = id
        }
        if (top < minTop) {
          minTop = top
          minTopId = id
        }
      })
      finalId = chosenId ?? minTopId ?? units[0]?.id ?? null
    }
    if (!finalId || activeUnitIdRef.current === finalId) return
    activeUnitIdRef.current = finalId
    const unit = units.find((u) => u.id === finalId)
    onActiveUnitChange?.({
      id: unit?.id ?? null,
      title: unit?.title ?? null,
    })
  }, [onActiveUnitChange, units])

  useEffect(() => {
    if (!units || units.length === 0) return
    const scheduleUpdate = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        updateActiveUnit()
      })
    }

    const onScroll = () => {
      scheduleUpdate()
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current)
      }
      scrollEndTimerRef.current = window.setTimeout(() => {
        updateActiveUnit()
      }, 140)
    }

    const onTouch = () => {
      scheduleUpdate()
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current)
      }
      scrollEndTimerRef.current = window.setTimeout(() => {
        updateActiveUnit()
      }, 200)
    }

    const visualViewport = window.visualViewport

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouch, { passive: true })
    visualViewport?.addEventListener('scroll', onScroll, { passive: true })
    visualViewport?.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouch)
      visualViewport?.removeEventListener('scroll', onScroll)
      visualViewport?.removeEventListener('resize', onScroll)
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current)
      }
    }
  }, [updateActiveUnit, units])

  useEffect(() => {
    if (!units || units.length === 0) return
    if (typeof window === 'undefined' || !('IntersectionObserver' in window))
      return
    observerRef.current?.disconnect()

    const observer = new IntersectionObserver(
      () => {
        if (rafRef.current !== null) return
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null
          updateActiveUnit()
        })
      },
      {
        root: null,
        rootMargin: '-40% 0px -60% 0px',
        threshold: 0,
      }
    )

    unitRefs.current.forEach((el) => observer.observe(el))
    observerRef.current = observer
    return () => observer.disconnect()
  }, [updateActiveUnit, units])

  useEffect(() => {
    if (!units || units.length === 0) return
    const first = units[0]
    onActiveUnitChange?.({ id: first?.id ?? null, title: first?.title ?? null })
  }, [onActiveUnitChange, units])

  const setUnitWrapperRef = (unitId: string) => (el: HTMLDivElement | null) => {
    if (!el) {
      const existing = unitRefs.current.get(unitId)
      if (existing && observerRef.current) {
        observerRef.current.unobserve(existing)
      }
      unitRefs.current.delete(unitId)
      return
    }
    unitRefs.current.set(unitId, el)
    if (observerRef.current) {
      observerRef.current.observe(el)
    }
    requestAnimationFrame(updateActiveUnit)
    window.setTimeout(updateActiveUnit, 120)
  }

  useEffect(() => {
    if (!units || units.length === 0) return
    const completedId = sessionStorage.getItem('dashboardJustCompletedLessonId')
    if (!completedId) return

    let nextId: string | undefined
    for (const unit of units) {
      const idx = unit.lessons.findIndex((l) => l.id === completedId)
      if (idx !== -1) {
        nextId = unit.lessons[idx + 1]?.id
        break
      }
    }

    setUnlockState({ completedId, nextId })
    sessionStorage.removeItem('dashboardJustCompletedLessonId')
    const timer = setTimeout(() => setUnlockState(null), 2500)
    return () => clearTimeout(timer)
  }, [units])

  useEffect(() => {
    if (didRestoreScrollRef.current) return
    if (isLoading) return
    if (!units || units.length === 0) return

    try {
      const lastLessonId = sessionStorage.getItem('dashboardLastLessonId')
      if (lastLessonId) {
        const el = document.querySelector(`[data-lesson-id="${lastLessonId}"]`)
        if (el instanceof HTMLElement) {
          didRestoreScrollRef.current = true
          requestAnimationFrame(() => {
            el.scrollIntoView({ block: 'center', behavior: 'auto' })
          })
          sessionStorage.removeItem('dashboardLastLessonId')
          return
        }
      }

      const raw = sessionStorage.getItem('dashboardScrollY')
      if (!raw) return
      const y = Number(raw)
      if (!Number.isFinite(y) || y <= 0) return

      didRestoreScrollRef.current = true
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
      })
    } catch {}
  }, [isLoading, units])

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
      return
    }
    const timer = window.setTimeout(() => setShowLoading(false), 220)
    return () => window.clearTimeout(timer)
  }, [isLoading])

  return (
    <>
      <AnimatePresence>
        {showLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-muted-foreground flex items-center justify-center py-12 text-sm"
          >
            <div className="border-border/60 bg-card/70 flex items-center gap-3 rounded-full border px-5 py-2 shadow-sm backdrop-blur-lg">
              <span className="bg-primary h-2.5 w-2.5 animate-pulse rounded-full" />
              Loading your path...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="text-destructive p-8 text-center">
          Error loading path: {(error as Error).message}
        </div>
      )}

      {!isLoading && (!units || units.length === 0) && (
        <div className="text-muted-foreground p-10 text-center text-sm">
          No lessons available. content coming soon!
        </div>
      )}

      {!isLoading && units && units.length > 0 && (
        <div className="flex w-full flex-col gap-16 pb-24">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="relative flex flex-col items-center"
              data-unit-id={unit.id}
              ref={setUnitWrapperRef(unit.id)}
            >
              {/* Unit Header */}
              <div className="mb-10 w-full px-2 sm:px-0">
                <div className="border-border/60 bg-card/70 mx-auto max-w-md rounded-3xl border p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.25)] backdrop-blur-lg">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                        Unit {unit.order_index}
                      </div>
                      <h3 className="font-heading text-foreground mt-1 text-xl leading-tight font-extrabold sm:text-2xl">
                        {unit.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                        {unit.description}
                      </p>
                    </div>
                    <Button
                      variant="glass"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setOpenUnitId(unit.id)}
                    >
                      Guide
                    </Button>
                  </div>

                  <div className="bg-muted mt-4 h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${
                          unit.lessons.length === 0
                            ? 0
                            : (unit.lessons.filter(
                                (l) => l.status === 'completed'
                              ).length /
                                unit.lessons.length) *
                              100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Lessons Path */}
              <div className="flex w-full max-w-md flex-col items-center">
                {unit.lessons.map((lesson, index) => {
                  const xOffset = offsetForIndex(index)
                  const nextXOffset = offsetForIndex(index + 1)
                  const isConnectorActive = lesson.status === 'completed'

                  return (
                    <Fragment key={lesson.id}>
                      <LessonNode
                        lesson={lesson}
                        index={index}
                        totalLessons={unit.lessons.length}
                        xOffset={xOffset}
                        isUnlocking={unlockState?.nextId === lesson.id}
                      />
                      {index < unit.lessons.length - 1 && (
                        <LessonConnector
                          fromX={xOffset}
                          toX={nextXOffset}
                          isActive={isConnectorActive}
                          isUnlocking={
                            unlockState?.completedId === lesson.id &&
                            unlockState?.nextId === unit.lessons[index + 1]?.id
                          }
                        />
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <UnitGuideSheet
        open={!!openUnitId}
        unit={openUnit}
        onOpenChange={(open) => {
          if (!open) setOpenUnitId(null)
        }}
      />
    </>
  )
}
