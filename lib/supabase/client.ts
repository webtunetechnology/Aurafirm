import { createBrowserClient } from '@supabase/ssr'

// createBrowserClient is safe to call multiple times — it is stateless and
// reads the session cookie from document.cookie on every call, which is
// exactly what we need so the browser client stays in sync with the
// server-side cookie written by middleware and server actions.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
