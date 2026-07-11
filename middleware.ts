import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Must mutate request cookies first, then rebuild the response so
          // the refreshed session token is written back to the browser.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT and triggers a silent token refresh when needed.
  // This is what keeps the session alive across page loads and refreshes.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  // /admin-login must never be caught in the admin guard — doing so creates
  // an infinite redirect loop (unauthenticated → /admin-login → redirect → …)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin-login'
  const isCustomerLogin = pathname === '/account/login'

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  // If a logged-in customer visits /account/login, send them to their orders
  if (isCustomerLogin && user) {
    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/account/orders', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  // Run on every route so Supabase can silently refresh the session token and
  // write the updated cookie back to the browser on each request.
  // Static assets, _next internals, and favicon are excluded for performance.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// Note: /admin-login is intentionally NOT protected — handled inside the middleware logic above.
