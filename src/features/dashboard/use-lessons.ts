import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Lesson } from '@/types/schemas'

export function useLessons() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index')

      if (error) throw error
      return data as Lesson[]
    },
  })
}
