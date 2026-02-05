import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Lesson, UserProgress } from '@/types/schemas'

type LessonSummary = Pick<Lesson, 'id' | 'unit_id' | 'order_index' | 'title'>
type LessonProgress = Pick<UserProgress, 'status' | 'stars'>

export type LessonCardItem = LessonSummary & {
  unitOrderIndex: number
} & LessonProgress

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
          supabase.from('units').select('id, order_index'),
          supabase
            .from('user_progress')
            .select('lesson_id, status, stars')
            .eq('user_id', user.id),
          supabase.from('profiles').select('role').eq('id', user.id).single(),
        ])

      if (lessonsResult.error) throw lessonsResult.error
      if (unitsResult.error) throw unitsResult.error
      if (progressResult.error) throw progressResult.error
      if (profileResult.error) throw profileResult.error

      const units = unitsResult.data ?? []
      const lessons = (lessonsResult.data ?? []) as LessonSummary[]
      const progressRows = (progressResult.data ?? []) as Array<
        LessonProgress & { lesson_id: string }
      >

      const unitOrderMap = new Map(
        units.map((unit) => [unit.id, unit.order_index])
      )

      const progressMap = new Map(
        progressRows.map((row) => [row.lesson_id, row])
      )

      const sortedLessons = lessons.sort((a, b) => {
        const unitOrderA = unitOrderMap.get(a.unit_id) ?? 0
        const unitOrderB = unitOrderMap.get(b.unit_id) ?? 0
        if (unitOrderA !== unitOrderB) return unitOrderA - unitOrderB
        return a.order_index - b.order_index
      })

      const isAdmin = profileResult.data?.role === 'admin'

      return sortedLessons.map((lesson) => {
        const progress = progressMap.get(lesson.id)
        return {
          ...lesson,
          unitOrderIndex: unitOrderMap.get(lesson.unit_id) ?? 0,
          status: isAdmin
            ? (progress?.status ?? 'active')
            : (progress?.status ?? 'locked'),
          stars: progress?.stars ?? 0,
        } satisfies LessonCardItem
      })
    },
  })
}
