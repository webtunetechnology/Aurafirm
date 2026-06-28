import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isCustomerLogin = request.nextUrl.pathname === '/account/login'

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    // Use user_metadata to avoid RLS issues with anon key
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
  matcher: ['/admin/:path*', '/account/:path*'],
}

// Note: /admin-login is intentionally NOT in the matcher — it must stay unprotected.
