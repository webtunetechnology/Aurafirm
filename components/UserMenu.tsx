"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Package, LogOut, ChevronDown, KeyRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; name: string }

export default function UserMenu({ iconClassName = "h-4 w-4" }: { iconClassName?: string }) {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState>({ status: "loading" })
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    // Safety net: if auth check takes > 3 s (network slow / offline), show
    // the login link rather than a dead pulsing icon the user can't click.
    const fallback = setTimeout(() => {
      setAuth((prev) => prev.status === "loading" ? { status: "guest" } : prev)
    }, 3000)

    async function loadProfile(userId: string) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single()
        setAuth({ status: "user", name: profile?.full_name ?? "Customer" })
      } catch {
        setAuth({ status: "user", name: "Customer" })
      } finally {
        clearTimeout(fallback)
      }
    }

    // onAuthStateChange fires INITIAL_SESSION as soon as the client decodes
    // its storage (cookie). This is the reliable way to read the session from
    // the @supabase/ssr browser client without a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(fallback)
      if (!session) {
        setAuth({ status: "guest" })
        return
      }
      loadProfile(session.user.id)
    })

    return () => { subscription.unsubscribe(); clearTimeout(fallback) }
  }, [])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  async function handleLogout() {
    setOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuth({ status: "guest" })
    router.push("/")
    router.refresh()
  }

  // Guest — just link to login
  if (auth.status === "guest") {
    return (
      <Link href="/account/login" aria-label="My Account" className="transition-colors hover:text-[#b86244]">
        <User className={iconClassName} />
      </Link>
    )
  }

  // Loading — show a clickable link (not a dead div) so the user can always
  // reach the login page even while the auth check is in flight.
  if (auth.status === "loading") {
    return (
      <Link href="/account/login" aria-label="My Account" className="animate-pulse transition-colors hover:text-[#b86244]">
        <User className={`${iconClassName} opacity-40`} />
      </Link>
    )
  }

  // Logged in — avatar + dropdown
  const initials = auth.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full transition-colors hover:opacity-80"
        aria-label="My Account"
        aria-expanded={open}
      >
        {/* Avatar circle */}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c9744e] text-[11px] font-bold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[90px] truncate text-xs font-medium text-neutral-700 sm:block">
          {auth.name.split(" ")[0]}
        </span>
        <ChevronDown className={`h-3 w-3 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xl">
          {/* Name header */}
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="text-xs font-semibold text-neutral-800">{auth.name}</p>
            <p className="text-[11px] text-neutral-400">AuraFirm Customer</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-[#fdf0e8] hover:text-[#a0522d]"
            >
              <Package className="h-4 w-4" />
              My Orders
            </Link>
            <Link
              href="/account/password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-[#fdf0e8] hover:text-[#a0522d]"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-neutral-100 py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
