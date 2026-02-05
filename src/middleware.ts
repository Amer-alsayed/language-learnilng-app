import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // 1. Refresh the session (must be first)
    // We use a custom updateSession that effectively does the initial cookie handling
    const response = await updateSession(request);

    // 2. Gatekeeper Logic
    // We need to check if the user is actually logged in.
    // We use a lightweight supabase client just for this check using the *request* cookies.
    // Note: updateSession already handles the complex cookie set/get for the response,
    // but for checking auth *status* right now, we can peek at the user.

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // We don't need to set cookies here, just reading for auth check
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const path = url.pathname;

    // Rule 1: If logged in and on /login, go to /dashboard
    if (user && path === "/login") {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Rule 2: If NOT logged in and on protected routes, go to /login
    if (!user && (path.startsWith("/dashboard") || path.startsWith("/lesson"))) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Rule 3: Root path should redirect to /dashboard (if logged in) or /login (if not)
    if (path === "/") {
        url.pathname = user ? "/dashboard" : "/login";
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
