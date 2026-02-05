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
                <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{data?.title}</h2>
                <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs font-mono">
                    ID: {id}
                </span>
            </div>

            <div className="grid gap-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Metadata</h3>
                    <pre className="text-xs text-blue-400 font-mono overflow-auto">
                        {JSON.stringify({
                            unit_id: data?.unit_id,
                            order_index: data?.order_index,
                            created_at: data?.created_at
                        }, null, 2)}
                    </pre>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Content (JSONB)</h3>
                    <pre className="text-xs text-green-400 font-mono overflow-auto max-h-[600px]">
                        {JSON.stringify(data?.content, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    )
}
