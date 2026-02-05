'use client'

import { useActionState } from 'react'
import { loginWithKey } from './actions'
import { Key, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginWithKey, null)

  return (
    <form action={action} className="w-full space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="accessKey"
          className="text-foreground ml-1 text-sm leading-none font-semibold"
        >
          Student Access Key
        </label>
        <div className="group relative">
          <Key className="text-muted-foreground group-focus-within:text-foreground absolute top-3 left-3 h-4 w-4 transition-colors" />
          <input
            id="accessKey"
            name="accessKey"
            type="text"
            placeholder="e.g. key-12345"
            className="ring-offset-background border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-ring flex h-12 w-full rounded-2xl border px-10 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>

      {state?.error && (
        <div className="animate-shake flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <span className="font-bold">Error:</span>
          <span>{state.error}</span>
        </div>
      )}

      <Button
        type="submit"
        isLoading={isPending}
        rightIcon={<ArrowRight className="h-4 w-4" />}
        className="h-12 w-full rounded-2xl text-base font-extrabold shadow-[0_14px_30px_-22px_rgba(88,204,2,0.55)]"
      >
        {isPending ? 'Unlocking…' : 'Start Learning'}
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        Protected by Supabase Auth & Next.js
      </p>
    </form>
  )
}
