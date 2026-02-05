import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Lesson } from '@/types/schemas'

export function useLesson(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Lesson
    },
  })
}
