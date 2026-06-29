"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  Tag,
  Star,
  Settings,
  LogOut,
  Layers,
  TrendingUp,
  MessageSquare,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Home",      href: "/admin",            icon: Home },
  { label: "Products",  href: "/admin/products",   icon: Package },
  { label: "Orders",    href: "/admin/orders",      icon: ShoppingBag },
  { label: "Inventory", href: "/admin/inventory",   icon: Layers },
  { label: "Sales",     href: "/admin/sales",       icon: TrendingUp },
  { label: "Analytics", href: "/admin/analytics",   icon: BarChart3 },
  { label: "Customers", href: "/admin/customers",   icon: Users },
  { label: "Coupons",   href: "/admin/coupons",     icon: Tag },
  { label: "Reviews",   href: "/admin/reviews",    icon: Star },
  { label: "Contacts",      href: "/admin/contacts",      icon: MessageSquare },
  { label: "Our Story",     href: "/admin/our-story",     icon: BookOpen },
  { label: "Why AURAFIRM",  href: "/admin/why-aurafirm",  icon: Sparkles },
  { label: "Settings",      href: "/admin/settings",      icon: Settings },
]

export default function AdminSidebar({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin-login")
    router.refresh()
  }

  return (
    <aside className="flex w-52 shrink-0 flex-col bg-white border-r border-neutral-100 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center justify-center px-5 py-4 border-b border-neutral-100">
        <Link href="/admin">
          <Image
            src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
            alt="AURAFIRM logo"
            width={130}
            height={44}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#fdf0e8] text-[#c9744e]"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {label === "Orders" && pendingCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#c9744e] text-[10px] font-bold text-white">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-neutral-100 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
