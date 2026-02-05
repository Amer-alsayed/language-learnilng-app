import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

function isExpired(expiresAt: string | null | undefined) {
  if (!expiresAt) return false
  const expires = new Date(expiresAt).getTime()
  return Number.isFinite(expires) && expires < Date.now()
}

export async function middleware(request: NextRequest) {
  // 1. Refresh the session (must be first)
  // We use a custom updateSession that effectively does the initial cookie handling
  const response = await updateSession(request)

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
          return request.cookies.getAll()
        },
        setAll(_cookiesToSet) {
          // We don't need to set cookies here, just reading for auth check
          void _cookiesToSet
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let expired = false
  let isAdmin = false
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('expires_at, role')
      .eq('id', user.id)
      .single()

    if (!profileError) {
      expired = isExpired(profile?.expires_at ?? null)
      isAdmin = profile?.role === 'admin'
    }
  }

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Rule 0: Expired accounts are forced back to login
  if (user && expired) {
    url.pathname = '/login'
    url.searchParams.set('reason', 'expired')

    const redirectResponse = NextResponse.redirect(url)
    const signOutClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    await signOutClient.auth.signOut()
    return redirectResponse
  }

  // Rule 1: If logged in and on /login, go to /dashboard
  if (user && path === '/login') {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Rule 1.5: Admin console requires admin role
  if (path.startsWith('/admin') && !isAdmin) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Rule 2: If NOT logged in and on protected routes, go to /login
  if (
    !user &&
    (path.startsWith('/dashboard') ||
      path.startsWith('/lesson') ||
      path.startsWith('/admin'))
  ) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Rule 3: Root path should redirect to /dashboard (if logged in) or /login (if not)
  if (path === '/') {
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  return response
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
