import { createClient } from '@/lib/supabase/server'
import { LessonShell } from '@/components/lesson/LessonShell'
import { redirect } from 'next/navigation'
import { LessonContentSchema } from '@/types/schemas'
import type { Exercise } from '@/types/schemas'

function dedupeExercisesById(exercises: Exercise[]) {
  const seen = new Set<string>()
  const deduped: Exercise[] = []
  for (const exercise of exercises) {
    if (seen.has(exercise.id)) continue
    seen.add(exercise.id)
    deduped.push(exercise)
  }
  return deduped
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth? Assuming protected by middleware, but good to check.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, expires_at')
    .eq('id', user.id)
    .single()

  if (profile?.expires_at && new Date(profile.expires_at) < new Date()) {
    redirect('/login?reason=expired')
  }

  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    // Check if user has progress for this lesson
    const { data: progress } = await supabase
      .from('user_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('lesson_id', id)
      .maybeSingle()

    // If no progress record, check if this is the very first lesson (auto-unlock for new users)
    if (!progress || progress.status === 'locked') {
      // Fetch lesson details
      const { data: lessonCheck } = await supabase
        .from('lessons')
        .select('order_index, unit_id')
        .eq('id', id)
        .single()

      // Allow the first lesson of every unit, even if the student hasn't
      // completed prior units (students can choose a unit freely).
      const isFirstLessonInUnit = lessonCheck?.order_index === 1

      // Otherwise require the previous lesson in the same unit to be completed.
      let previousLessonCompletedInUnit = false
      if (lessonCheck && !isFirstLessonInUnit) {
        const { data: prevInUnit } = await supabase
          .from('lessons')
          .select('id')
          .eq('unit_id', lessonCheck.unit_id)
          .lt('order_index', lessonCheck.order_index)
          .order('order_index', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (prevInUnit?.id) {
          const { data: prevProgress } = await supabase
            .from('user_progress')
            .select('status')
            .eq('user_id', user.id)
            .eq('lesson_id', prevInUnit.id)
            .maybeSingle()

          previousLessonCompletedInUnit = prevProgress?.status === 'completed'
        }
      }

      // Only block if it's not the first lesson
      if (!isFirstLessonInUnit && !previousLessonCompletedInUnit) {
        return (
          <div className="text-foreground space-y-4 p-8 text-center">
            <h1 className="text-xl font-extrabold">Lesson Locked</h1>
            <p className="text-muted-foreground">
              This lesson has not been unlocked yet. Complete the previous
              lessons to unlock this one.
            </p>
          </div>
        )
      }
    }
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
        <p className="text-muted-foreground">
          {error?.message || 'Unknown error'}
        </p>
      </div>
    )
  }

  // Validate content shape (strict Zod)
  const contentResult = LessonContentSchema.safeParse(lesson.content)

  if (!contentResult.success) {
    return (
      <div className="space-y-2 p-8 text-center">
        <h1 className="text-xl font-bold text-red-500">Invalid Lesson Data</h1>
        <p className="text-muted-foreground">
          This lesson content failed validation. Please contact support.
        </p>
      </div>
    )
  }

  const exercises = contentResult.data.exercises
  const dedupedExercises = dedupeExercisesById(exercises)

  if (dedupedExercises.length === 0) {
    return (
      <div className="space-y-4 p-8 text-center">
        <h1 className="text-xl font-bold">Empty Lesson</h1>
        <p className="text-muted-foreground">
          This lesson has no exercises yet.
        </p>
      </div>
    )
  }

  return <LessonShell initialExercises={dedupedExercises} lessonId={id} />
}
