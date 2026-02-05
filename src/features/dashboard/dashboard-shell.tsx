'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { LessonPath } from './lesson-path'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function DashboardShell() {
  const [activeUnit, setActiveUnit] = useState<{
    id: string | null
    title: string | null
  }>({
    id: null,
    title: null,
  })
  const [isBouncing, setIsBouncing] = useState(false)

  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      return data?.role === 'admin'
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  const displayTitle = useMemo(
    () => activeUnit.title ?? 'German Mastery',
    [activeUnit.title]
  )

  const handlePillClick = () => {
    setIsBouncing(true)
    const unitId = activeUnit.id
    if (!unitId) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const el = document.querySelector(`[data-unit-id="${unitId}"]`)
    if (el instanceof HTMLElement) {
      const rect = el.getBoundingClientRect()
      const targetTop = Math.max(0, window.scrollY + rect.top - 96)
      window.scrollTo({ top: targetTop, behavior: 'smooth' })
    }
  }

  return (
    <main className="gradient-bg bg-background text-foreground min-h-screen pb-24">
      <div className="sticky top-0 z-20 w-full px-4 pt-4">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
          <motion.button
            type="button"
            onClick={handlePillClick}
            onAnimationComplete={() => setIsBouncing(false)}
            animate={isBouncing ? { scale: [1, 1.08, 0.98, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            layout
            className="border-border/60 bg-card/60 relative flex items-center justify-center rounded-full border px-6 py-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.25)] backdrop-blur-lg"
            aria-label="Scroll to current unit"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={displayTitle}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-base font-[var(--font-logo)] font-extrabold tracking-tight sm:text-lg"
              >
                {displayTitle}
              </motion.span>
            </AnimatePresence>

            {isAdmin && (
              <Link
                href="/admin"
                className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition sm:text-xs"
              >
                Admin
              </Link>
            )}
          </motion.button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pt-6">
        <LessonPath onActiveUnitChange={setActiveUnit} />
      </div>
    </main>
  )
}
