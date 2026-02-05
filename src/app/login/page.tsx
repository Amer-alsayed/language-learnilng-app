import { LoginForm } from '@/features/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string }>
}) {
  const resolvedParams = searchParams ? await searchParams : undefined
  const isExpired = resolvedParams?.reason === 'expired'

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712]">
      {/* Background Ambience */}
      <div className="animate-pulse-glow absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/30 blur-[120px]" />
      <div
        className="animate-float absolute right-[-10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]"
        style={{ animationDelay: '2s' }}
      />

      {/* Content Container */}
      <div className="animate-slide-up z-10 w-full max-w-md px-4">
        {/* Glass Card */}
        <div className="glass-panel rounded-2xl p-8 backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center space-y-2 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg ring-1 shadow-purple-500/30 ring-white/20">
              <span className="text-2xl font-bold text-white">D</span>
            </div>
            <h1 className="neon-text text-3xl font-bold tracking-tighter text-white">
              German Mastery
            </h1>
            <p className="text-sm text-slate-400">
              Enter your student key to access the learning terminal.
            </p>
          </div>

          {isExpired && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              Your access has expired. Please renew with your instructor.
            </div>
          )}

          <LoginForm />
        </div>
      </div>
    </main>
  )
}
