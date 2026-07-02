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
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Home",         href: "/admin",               icon: Home },
  { label: "Products",     href: "/admin/products",      icon: Package },
  { label: "Orders",       href: "/admin/orders",        icon: ShoppingBag },
  { label: "Inventory",    href: "/admin/inventory",     icon: Layers },
  { label: "Sales",        href: "/admin/sales",         icon: TrendingUp },
  { label: "Analytics",    href: "/admin/analytics",     icon: BarChart3 },
  { label: "Customers",    href: "/admin/customers",     icon: Users },
  { label: "Coupons",      href: "/admin/coupons",       icon: Tag },
  { label: "Reviews",      href: "/admin/reviews",       icon: Star },
  { label: "Contacts",     href: "/admin/contacts",      icon: MessageSquare },
  { label: "Our Story",    href: "/admin/our-story",     icon: BookOpen },
  { label: "Why AURAFIRM", href: "/admin/why-aurafirm",  icon: Sparkles },
  { label: "Settings",     href: "/admin/settings",      icon: Settings },
]

interface AdminSidebarProps {
  pendingCount?: number
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function AdminSidebar({
  pendingCount = 0,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin-login")
    router.refresh()
  }

  const sidebarContent = (isDesktop: boolean) => (
    <aside
      className={`flex h-full flex-col bg-white border-r border-neutral-100 transition-all duration-300 ${
        isDesktop && collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo / icon row */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-3">
        {/* Logo — always visible; shrinks to icon when collapsed */}
        <Link
          href="/admin"
          onClick={!isDesktop ? onClose : undefined}
          aria-label="AURAFIRM admin home"
          className="shrink-0"
        >
          <Image
            src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
            alt="AURAFIRM logo"
            width={110}
            height={38}
            priority
            className={`object-contain transition-all duration-300 ${
              isDesktop && collapsed ? "w-8 h-auto" : "w-[110px] h-auto"
            }`}
          />
        </Link>

        {/* Desktop: collapse/expand chevron button beside logo */}
        {isDesktop && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Mobile: close button beside logo */}
        {!isDesktop && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={!isDesktop ? onClose : undefined}
              title={isDesktop && collapsed ? label : undefined}
              className={`flex items-center rounded-xl px-2.5 py-1.5 text-sm font-medium transition-colors group relative ${
                isDesktop && collapsed ? "justify-center" : "gap-3"
              } ${
                active
                  ? "bg-[#fdf0e8] text-[#c9744e]"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!(isDesktop && collapsed) && (
                <>
                  <span>{label}</span>
                  {label === "Orders" && pendingCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#c9744e] text-[10px] font-bold text-white">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </>
              )}
              {/* Tooltip for collapsed desktop */}
              {isDesktop && collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-neutral-800 px-2.5 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {label}
                  {label === "Orders" && pendingCount > 0 && ` (${pendingCount})`}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout + desktop collapse toggle */}
      <div className="border-t border-neutral-100 px-2 py-3 space-y-0.5">
        <button
          onClick={handleLogout}
          title={collapsed && isDesktop ? "Logout" : undefined}
          className={`flex w-full items-center rounded-xl px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800 group relative ${
            isDesktop && collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!(isDesktop && collapsed) && <span>Logout</span>}
          {isDesktop && collapsed && (
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-neutral-800 px-2.5 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Logout
            </span>
          )}
        </button>


      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: collapsible sticky sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
        {sidebarContent(true)}
      </div>

      {/* Mobile: overlay drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full shadow-2xl">
            {sidebarContent(false)}
          </div>
        </div>
      )}
    </>
  )
}
