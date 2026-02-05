'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  activateLessonAction,
  createStudentAction,
  renewStudentAction,
  setGroupAction,
  unlockLessonForGroupAction,
  unlockUnitForGroupAction,
  unlockUnitForStudentAction,
} from './actions'

function FormMessage({
  state,
}: {
  state: { error?: string; success?: string } | null
}) {
  if (!state) return null
  if (state.error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
        {state.error}
      </div>
    )
  }
  if (state.success) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
        {state.success}
      </div>
    )
  }
  return null
}

export function AdminPanel() {
  const [createState, createAction, createPending] = useActionState(
    createStudentAction,
    null
  )
  const [renewState, renewAction, renewPending] = useActionState(
    renewStudentAction,
    null
  )
  const [groupState, groupAction, groupPending] = useActionState(
    setGroupAction,
    null
  )
  const [activateState, activateAction, activatePending] = useActionState(
    activateLessonAction,
    null
  )
  const [unlockUnitState, unlockUnitAction, unlockUnitPending] = useActionState(
    unlockUnitForStudentAction,
    null
  )
  const [unlockGroupState, unlockGroupAction, unlockGroupPending] =
    useActionState(unlockUnitForGroupAction, null)
  const [
    unlockLessonGroupState,
    unlockLessonGroupAction,
    unlockLessonGroupPending,
  ] = useActionState(unlockLessonForGroupAction, null)

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Console</h1>
            <p className="mt-2 text-sm text-slate-400">
              Provision student keys, manage groups, and unlock lessons.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Create Student Key</h2>
            <p className="mt-1 text-sm text-slate-400">
              Creates a Supabase user and profile record.
            </p>
            <form action={createAction} className="mt-4 space-y-3">
              <input
                name="key"
                placeholder="student-key"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="days"
                  placeholder="Days (default 60)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                />
                <input
                  name="expiresAt"
                  placeholder="Expires at (ISO)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                />
              </div>
              <input
                name="group"
                placeholder="Class group (optional)"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name="activateFirst"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                />
                Activate first lesson automatically
              </label>
              <FormMessage state={createState} />
              <Button
                type="submit"
                className="w-full"
                isLoading={createPending}
              >
                Create Key
              </Button>
            </form>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Renew Access</h2>
            <p className="mt-1 text-sm text-slate-400">
              Extend access for an existing student.
            </p>
            <form action={renewAction} className="mt-4 space-y-3">
              <input
                name="key"
                placeholder="student-key"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="days"
                  placeholder="Days (default 60)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                />
                <input
                  name="expiresAt"
                  placeholder="Expires at (ISO)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                />
              </div>
              <FormMessage state={renewState} />
              <Button type="submit" className="w-full" isLoading={renewPending}>
                Renew Access
              </Button>
            </form>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Assign Group</h2>
            <p className="mt-1 text-sm text-slate-400">
              Attach a student to a class group.
            </p>
            <form action={groupAction} className="mt-4 space-y-3">
              <input
                name="key"
                placeholder="student-key"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <input
                name="group"
                placeholder="Class group (leave blank to clear)"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
              />
              <FormMessage state={groupState} />
              <Button type="submit" className="w-full" isLoading={groupPending}>
                Update Group
              </Button>
            </form>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Activate Lesson (Student)</h2>
            <p className="mt-1 text-sm text-slate-400">
              Unlock a specific lesson for one student.
            </p>
            <form action={activateAction} className="mt-4 space-y-3">
              <input
                name="key"
                placeholder="student-key"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <input
                name="lessonId"
                placeholder="lesson-id"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <FormMessage state={activateState} />
              <Button
                type="submit"
                className="w-full"
                isLoading={activatePending}
              >
                Activate Lesson
              </Button>
            </form>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Unlock Unit (Student)</h2>
            <p className="mt-1 text-sm text-slate-400">
              Unlock all lessons in a unit for a student.
            </p>
            <form action={unlockUnitAction} className="mt-4 space-y-3">
              <input
                name="key"
                placeholder="student-key"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <input
                name="unitId"
                placeholder="unit-id"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <FormMessage state={unlockUnitState} />
              <Button
                type="submit"
                className="w-full"
                isLoading={unlockUnitPending}
              >
                Unlock Unit
              </Button>
            </form>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Unlock Unit (Group)</h2>
            <p className="mt-1 text-sm text-slate-400">
              Unlock all lessons in a unit for an entire class group.
            </p>
            <form action={unlockGroupAction} className="mt-4 space-y-3">
              <input
                name="group"
                placeholder="class-group"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <input
                name="unitId"
                placeholder="unit-id"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <FormMessage state={unlockGroupState} />
              <Button
                type="submit"
                className="w-full"
                isLoading={unlockGroupPending}
              >
                Unlock Unit for Group
              </Button>
            </form>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Unlock Lesson (Group)</h2>
            <p className="mt-1 text-sm text-slate-400">
              Unlock a single lesson for an entire class group.
            </p>
            <form action={unlockLessonGroupAction} className="mt-4 space-y-3">
              <input
                name="group"
                placeholder="class-group"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <input
                name="lessonId"
                placeholder="lesson-id"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white"
                required
              />
              <FormMessage state={unlockLessonGroupState} />
              <Button
                type="submit"
                className="w-full"
                isLoading={unlockLessonGroupPending}
              >
                Unlock Lesson for Group
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
