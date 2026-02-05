'use client';

import { useActionState } from "react";
import { loginWithKey } from "./actions";
import { Key, ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
    const [state, action, isPending] = useActionState(loginWithKey, null);

    return (
        <form action={action} className="w-full space-y-6">
            <div className="space-y-2">
                <label
                    htmlFor="accessKey"
                    className="text-sm font-medium leading-none text-slate-300 ml-1"
                >
                    Student Access Key
                </label>
                <div className="relative group">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                    <input
                        id="accessKey"
                        name="accessKey"
                        type="text"
                        placeholder="e.g. key-12345"
                        className="flex h-12 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 text-white transition-all shadow-inner"
                        required
                        autoComplete="off"
                        autoFocus
                    />
                </div>
            </div>

            {state?.error && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/50 flex items-center gap-2 text-red-200 text-sm animate-shake">
                    <span>⚠️</span>
                    {state.error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="glass-button relative w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Unlocking...
                        </>
                    ) : (
                        <>
                            Start Application
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </span>
            </button>

            <p className="text-center text-xs text-slate-500">
                Protected by Supabase Auth & Next.js 15
            </p>
        </form>
    );
}
