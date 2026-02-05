import { LoginForm } from '@/features/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string }>
}) {
  const resolvedParams = searchParams ? await searchParams : undefined
  const isExpired = resolvedParams?.reason === 'expired'

  return (
    <main className="gradient-bg bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="animate-pulse-glow absolute top-[-25%] left-[-15%] h-[520px] w-[520px] rounded-full bg-emerald-500/12 blur-[120px]" />
      <div
        className="animate-float absolute right-[-10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]"
        style={{ animationDelay: '2s' }}
      />

      {/* Content Container */}
      <div className="animate-slide-up z-10 w-full max-w-md">
        <div className="border-border bg-card rounded-3xl border p-8 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)]">
          <div className="mb-8 flex flex-col items-center space-y-2 text-center">
            <div className="bg-primary mb-2 flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_14px_30px_-18px_rgba(88,204,2,0.55)]">
              <span className="text-primary-foreground text-2xl font-black">
                D
              </span>
            </div>
            <h1 className="font-heading text-foreground text-3xl font-extrabold tracking-tight">
              German Mastery
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your student key to access the learning terminal.
            </p>
          </div>

          {isExpired && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Your access has expired. Please renew with your instructor.
            </div>
          )}

          <LoginForm />
        </div>
      </div>
    </main>
  )
}
