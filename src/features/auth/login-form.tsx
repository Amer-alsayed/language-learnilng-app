'use client'

import { useActionState } from 'react'
import { loginWithKey } from './actions'
import { Key, ArrowRight, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginWithKey, null)

  return (
    <form action={action} className="w-full space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="accessKey"
          className="ml-1 text-sm leading-none font-medium text-slate-300"
        >
          Student Access Key
        </label>
        <div className="group relative">
          <Key className="absolute top-3 left-3 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-purple-400" />
          <input
            id="accessKey"
            name="accessKey"
            type="text"
            placeholder="e.g. key-12345"
            className="ring-offset-background flex h-12 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-10 py-2 text-sm text-white shadow-inner transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>

      {state?.error && (
        <div className="animate-shake flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-900/20 p-3 text-sm text-red-200">
          <span className="font-semibold">Error:</span>
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="glass-button group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-bold text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-80 transition-opacity group-hover:opacity-100" />
        <span className="relative z-10 flex items-center gap-2">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Unlocking...
            </>
          ) : (
            <>
              Start Application
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </span>
      </button>

      <p className="text-center text-xs text-slate-500">
        Protected by Supabase Auth & Next.js
      </p>
    </form>
  )
}
