import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Lesson, UserProgress, Unit } from '@/types/schemas'

type LessonSummary = Pick<Lesson, 'id' | 'unit_id' | 'order_index' | 'title'>
type LessonProgress = Pick<UserProgress, 'status' | 'stars'>

export type LessonCardItem = LessonSummary & {
  unitOrderIndex: number // Kept for compatibility, though less used in grouped view
} & LessonProgress

export type UnitGroup = Pick<
  Unit,
  'id' | 'title' | 'description' | 'order_index'
> & {
  lessons: LessonCardItem[]
}

export function useLessons() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Not authenticated')
      }

      const [lessonsResult, unitsResult, progressResult, profileResult] =
        await Promise.all([
          supabase.from('lessons').select('id, unit_id, order_index, title'),
          supabase
            .from('units')
            .select('id, order_index, title, description')
            .order('order_index'),
          supabase
            .from('user_progress')
            .select('lesson_id, status, stars')
            .eq('user_id', user.id),
          supabase.from('profiles').select('role').eq('id', user.id).single(),
        ])

      if (lessonsResult.error) {
        throw lessonsResult.error
      }
      if (unitsResult.error) {
        throw unitsResult.error
      }
      if (progressResult.error) {
        throw progressResult.error
      }
      if (profileResult.error) {
        throw profileResult.error
      }

      const units = unitsResult.data ?? []
      const lessons = (lessonsResult.data ?? []) as LessonSummary[]
      const progressRows = (progressResult.data ?? []) as Array<
        LessonProgress & { lesson_id: string }
      >

      const progressMap = new Map(
        progressRows.map((row) => [row.lesson_id, row])
      )

      const isAdmin = profileResult.data?.role === 'admin'

      // Group lessons by unit
      const groupedUnits: UnitGroup[] = units.map((unit) => {
        let previousLessonCompletedInUnit = false
        const unitLessons = lessons
          .filter((lesson) => lesson.unit_id === unit.id)
          .sort((a, b) => a.order_index - b.order_index)
          .map((lesson) => {
            const progress = progressMap.get(lesson.id)

            // Determine status:
            // 1. Admin: always active
            // 2. Has progress: use that status
            // 3. First lesson of each unit: active so students can choose units
            // 4. If previous lesson in unit completed: unlock (active)
            // 5. Otherwise: locked
            let status: 'locked' | 'active' | 'completed' = 'locked'
            if (isAdmin) {
              status = progress?.status ?? 'active'
            } else if (progress?.status) {
              status = progress.status as 'locked' | 'active' | 'completed'
            } else if (lesson.order_index === 1) {
              status = 'active'
            } else if (previousLessonCompletedInUnit) {
              status = 'active'
            }

            // Only completion unlocks the next lesson within the unit.
            previousLessonCompletedInUnit = progress?.status === 'completed'

            return {
              ...lesson,
              unitOrderIndex: unit.order_index,
              status,
              stars: progress?.stars ?? 0,
            } satisfies LessonCardItem
          })

        return {
          id: unit.id,
          title: unit.title,
          description: unit.description ?? '',
          order_index: unit.order_index,
          lessons: unitLessons,
        }
      })

      return groupedUnits
    },
    // Reduce refetch churn in dev and improve perceived speed when navigating.
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
