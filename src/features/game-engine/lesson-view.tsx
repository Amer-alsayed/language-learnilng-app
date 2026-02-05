'use client'

import { useLesson } from './use-lesson'

export function LessonView({ id }: { id: string }) {
  const { data, isLoading, error } = useLesson(id)

  if (isLoading) return <div className="text-white">Loading lesson...</div>

  if (error) {
    return (
      <div className="text-red-500">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error.message}</p>
        <p className="mt-2 text-sm text-gray-400">ID: {id}</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{data?.title}</h2>
        <span className="rounded-full bg-green-900 px-3 py-1 font-mono text-xs text-green-300">
          ID: {id}
        </span>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Metadata</h3>
          <pre className="overflow-auto font-mono text-xs text-blue-400">
            {JSON.stringify(
              {
                unit_id: data?.unit_id,
                order_index: data?.order_index,
                created_at: data?.created_at,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-400">
            Content (JSONB)
          </h3>
          <pre className="max-h-[600px] overflow-auto font-mono text-xs text-green-400">
            {JSON.stringify(data?.content, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
