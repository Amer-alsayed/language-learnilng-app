import { createClient } from '@/lib/supabase/server'
import { LessonShell } from '@/components/lesson/LessonShell'
import { redirect } from 'next/navigation'

export default async function LessonPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Verify auth? Assuming protected by middleware, but good to check.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch Lesson
    const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !lesson) {
        // In dev, we might want to see the error
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold text-red-500">Lesson Not Found</h1>
                <p className="text-zinc-500">{error?.message || 'Unknown error'}</p>
            </div>
        )
    }

    // Validate content shape roughly (or trust it)
    // The 'content' column is JSONB.
    const exercises = (lesson.content as any)?.exercises || []

    if (exercises.length === 0) {
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-xl font-bold">Empty Lesson</h1>
                <p className="text-zinc-500">This lesson has no exercises yet.</p>
            </div>
        )
    }

    return (
        <LessonShell
            initialExercises={exercises}
            lessonId={id}
        />
    )
}
