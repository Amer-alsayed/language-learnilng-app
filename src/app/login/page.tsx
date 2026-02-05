import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712]">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse-glow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />

            {/* Content Container */}
            <div className="z-10 w-full max-w-md px-4 animate-slide-up">
                {/* Glass Card */}
                <div className="glass-panel rounded-2xl p-8 backdrop-blur-xl">
                    <div className="flex flex-col items-center text-center mb-8 space-y-2">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-2 ring-1 ring-white/20">
                            <span className="text-2xl font-bold text-white">D</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white neon-text">
                            German Mastery
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Enter your student key to access the learning terminal.
                        </p>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </main>
    );
}
