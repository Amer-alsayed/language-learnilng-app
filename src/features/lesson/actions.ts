'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function submitLessonResult(lessonId: string, stars: number) {
  const supabase = await createClient()

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 2. Call the Secure RPC
  const { error } = await supabase.rpc('complete_lesson', {
    p_lesson_id: lessonId,
    p_stars_earned: stars,
  })

  if (error) {
    console.error('Submit Result Error:', error)
    return { error: error.message }
  }

  // Prefer DB-side unlock (SECURITY DEFINER) if available; fallback to service-role
  // upsert when the RPC isn't present yet.
  const unlockRpc = await supabase.rpc('unlock_next_lesson', {
    p_lesson_id: lessonId,
  })

  if (unlockRpc.error) {
    const service = getServiceClient()
    if (service) {
      await unlockNextLesson(service, user.id, lessonId)
    } else {
      console.error('Unlock next lesson error:', unlockRpc.error)
    }
  }

  // 3. Revalidate Dashboard to show unlocked next lesson
  revalidatePath('/dashboard')
  revalidatePath(`/lesson/${lessonId}`)

  return { success: true }
}

function getServiceClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null

  return createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

async function unlockNextLesson(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string
) {
  const { data: currentLesson } = await supabase
    .from('lessons')
    .select('id, unit_id, order_index')
    .eq('id', lessonId)
    .single()

  if (!currentLesson) return

  const { data: nextInUnit } = await supabase
    .from('lessons')
    .select('id')
    .eq('unit_id', currentLesson.unit_id)
    .gt('order_index', currentLesson.order_index)
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle()

  let nextLessonId = nextInUnit?.id

  if (!nextLessonId) {
    const { data: currentUnit } = await supabase
      .from('units')
      .select('order_index')
      .eq('id', currentLesson.unit_id)
      .single()

    if (!currentUnit) return

    const { data: nextUnit } = await supabase
      .from('units')
      .select('id')
      .gt('order_index', currentUnit.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!nextUnit) return

    const { data: firstLessonInNextUnit } = await supabase
      .from('lessons')
      .select('id')
      .eq('unit_id', nextUnit.id)
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    nextLessonId = firstLessonInNextUnit?.id
  }

  if (!nextLessonId) return

  const { data: existing } = await supabase
    .from('user_progress')
    .select('status, stars')
    .eq('user_id', userId)
    .eq('lesson_id', nextLessonId)
    .maybeSingle()

  if (existing?.status === 'completed') return

  const { error: upsertError } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: nextLessonId,
      status: 'active',
      stars: existing?.stars ?? 0,
    },
    { onConflict: 'user_id, lesson_id' }
  )

  if (upsertError) {
    console.error('Unlock next lesson error:', upsertError)
  }
}
