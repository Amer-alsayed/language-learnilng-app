import { LessonList } from '@/features/dashboard/lesson-list'

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black p-8">
      <div className="z-10 flex w-full max-w-5xl flex-col gap-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <LessonList />
      </div>
    </main>
  )
}
