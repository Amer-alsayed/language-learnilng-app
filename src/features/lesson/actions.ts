'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitLessonResult(lessonId: string, stars: number) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Call the Secure RPC
    const { error } = await supabase.rpc('complete_lesson', {
        p_lesson_id: lessonId,
        p_stars_earned: stars
    })

    if (error) {
        console.error('Submit Result Error:', error)
        return { error: error.message }
    }

    // 3. Revalidate Dashboard to show unlocked next lesson
    revalidatePath('/dashboard')
    revalidatePath(`/lesson/${lessonId}`)

    return { success: true }
}
