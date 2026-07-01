"use client"

import { Bell, Search, MessageSquare, ChevronDown, User, X, LogOut, Settings, Menu } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const searchablePages = [
  { label: "Dashboard",  href: "/admin" },
  { label: "Orders",     href: "/admin/orders" },
  { label: "Products",   href: "/admin/products" },
  { label: "Inventory",  href: "/admin/inventory" },
  { label: "Sales",      href: "/admin/sales" },
  { label: "Analytics",  href: "/admin/analytics" },
  { label: "Customers",  href: "/admin/customers" },
  { label: "Coupons",    href: "/admin/coupons" },
  { label: "Reviews",    href: "/admin/reviews" },
  { label: "Contacts",   href: "/admin/contacts" },
  { label: "Settings",   href: "/admin/settings" },
]

export default function AdminTopbar({ adminName, onMenuToggle }: { adminName: string; onMenuToggle?: () => void }) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Auto-focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  // Close profile dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery("")
  }

  function navigateTo(href: string) {
    closeSearch()
    router.push(href)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin-login")
    router.refresh()
  }

  const filtered = searchablePages.filter((p) =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/20 bg-[#7d3c1f] px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger — visible only on mobile */}
          <button
            aria-label="Toggle sidebar"
            onClick={onMenuToggle}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo — links to dashboard */}
          <Link href="/admin" aria-label="AURAFIRM admin home">
            <img
              src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
              alt="AURAFIRM logo"
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button
            aria-label="Search pages"
            onClick={() => setSearchOpen(true)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notifications — links to orders */}
          <Link
            href="/admin/orders"
            aria-label="View orders"
            className="relative text-white/70 hover:text-white transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white">
              !
            </span>
          </Link>

          {/* Messages — links to contacts */}
          <Link
            href="/admin/contacts"
            aria-label="Contact messages"
            className="text-white/70 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-none">{adminName}</p>
                <p className="text-[10px] text-white/60 leading-none mt-0.5">Super Admin</p>
              </div>
              <ChevronDown
                className={`h-3 w-3 text-white/60 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-neutral-100 bg-white shadow-xl overflow-hidden z-50">
                <div className="border-b border-neutral-100 px-4 py-3">
                  <p className="truncate text-xs font-semibold text-neutral-800">{adminName}</p>
                  <p className="mt-0.5 text-[10px] text-neutral-500">Super Admin</p>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-neutral-400" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search admin pages..."
                className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch()
                  if (e.key === "Enter" && filtered.length > 0) navigateTo(filtered[0].href)
                }}
              />
              <button onClick={closeSearch} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <ul className="max-h-64 overflow-y-auto py-2">
              {filtered.length > 0 ? (
                filtered.map((page) => (
                  <li key={page.href}>
                    <button
                      onClick={() => navigateTo(page.href)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {page.label}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-sm text-neutral-400">
                  No pages found
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
