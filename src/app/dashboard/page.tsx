import { LessonList } from '@/features/dashboard/lesson-list'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-black p-8">
      <div className="z-10 flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
            >
              Admin Console
            </Link>
          )}
        </div>
        <LessonList />
      </div>
    </main>
  )
}
