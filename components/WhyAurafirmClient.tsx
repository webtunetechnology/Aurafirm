"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import UserMenu from "@/components/UserMenu"
import {
  ShoppingBag,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sparkles,
  Globe,
  Award,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Shop",         href: "/shop" },
  { label: "Our Story",    href: "/about" },
  { label: "Why AURAFIRM", href: "/why-aurafirm" },
  { label: "Contact",      href: "/contact" },
]

const ICON_MAP: Record<string, React.ElementType> = {
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sparkles,
  Globe,
  Award,
}

type Pillar = {
  id: string
  sort_order: number
  icon: string
  title: string
  subtitle: string
  description: string
  stat_value: string
  stat_label: string
  is_active: boolean
}

const LOGO =
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"

export default function WhyAurafirmClient({ pillars }: { pillars: Pillar[] }) {
  const { items } = useCart()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#faf5f3] font-sans">

      {/* Announcement bar */}
      <div className="flex items-center justify-between bg-[#8a4a32] px-4 py-2 text-[11px] text-white sm:px-8">
        <div className="flex flex-1 items-center justify-center gap-3">
          <span className="text-white/80">Also available on</span>
          <a href="https://www.amazon.in" target="_blank" rel="noopener noreferrer" className="flex items-center rounded bg-white px-2.5 py-0.5 transition-opacity hover:opacity-90">
            <img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/amazon/default.svg" alt="Amazon" className="h-4 w-auto" />
          </a>
          <span className="text-white/40">&</span>
          <a href="https://www.flipkart.com" target="_blank" rel="noopener noreferrer" className="flex items-center rounded bg-white px-2.5 py-0.5 transition-opacity hover:opacity-90">
            <img src="https://res.cloudinary.com/dgydmwvvm/image/upload/v1782744189/download-removebg-preview_rhfgf8.png" alt="Flipkart" className="h-5 sm:h-6 w-auto" />
          </a>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#f0e0d6] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="AURAFIRM home">
            <img src={LOGO} alt="AURAFIRM logo" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors hover:text-[#b86244] ${
                  item.href === "/why-aurafirm"
                    ? "border-b-2 border-[#b86244] pb-0.5 font-semibold text-[#b86244]"
                    : "text-neutral-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e3c8bb] text-neutral-600 hover:bg-[#fdf6f2]"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9744e] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <UserMenu />
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e3c8bb] text-neutral-600 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <img src={LOGO} alt="AURAFIRM" className="h-9 w-auto" />
            <button onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5 text-neutral-600" />
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold text-neutral-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#8a4a32] px-6 py-20 text-center text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #f5c9a8 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">
            Our Promise
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Why Choose
            <br />
            <span className="text-[#f5c9a8]">AURAFIRM?</span>
          </h1>
          <p className="mt-6 text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
            We believe skincare should be rooted in science, powered by nature, and honest about what it delivers. Here is what sets us apart.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#8a4a32] transition-opacity hover:opacity-90"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-[#f0e0d6] bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-[#f0e0d6] sm:grid-cols-4">
          {[
            { value: "50,000+", label: "Happy Customers" },
            { value: "100%", label: "Vegan & Cruelty-Free" },
            { value: "4.8★", label: "Average Rating" },
            { value: "GMP", label: "Certified Facility" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-2xl font-extrabold text-[#c9744e]">{s.value}</span>
              <span className="mt-1 text-xs text-neutral-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c9744e]">
            Our Difference
          </p>
          <h2 className="text-balance text-3xl font-extrabold text-neutral-900 sm:text-4xl">
            Built on six uncompromising pillars
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-neutral-500">
            Every decision we make — from ingredient sourcing to packaging — is guided by these core principles.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, idx) => {
            const Icon = ICON_MAP[pillar.icon] ?? Sparkles
            return (
              <div
                key={pillar.id}
                className="group relative flex flex-col rounded-2xl border border-[#f0e0d6] bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fdf0e8] transition-colors group-hover:bg-[#f5d8c4]">
                  <Icon className="h-6 w-6 text-[#c9744e]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-neutral-900">{pillar.title}</h3>
                  {pillar.subtitle && (
                    <p className="mt-0.5 text-xs font-medium text-[#c9744e]">{pillar.subtitle}</p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{pillar.description}</p>
                </div>
                {pillar.stat_value && (
                  <div className="mt-5 flex items-end gap-1.5 border-t border-[#f0e0d6] pt-4">
                    <span className="text-2xl font-extrabold text-[#c9744e]">{pillar.stat_value}</span>
                    <span className="mb-0.5 text-xs text-neutral-500">{pillar.stat_label}</span>
                  </div>
                )}
                <span className="absolute right-5 top-5 text-xs font-bold text-neutral-200">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-6 mb-20 overflow-hidden rounded-3xl bg-[#8a4a32] px-8 py-14 text-center text-white sm:mx-auto sm:max-w-5xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
          Ready to glow?
        </p>
        <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">
          Experience the AURAFIRM difference
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-white/70">
          Join 50,000+ customers who have made AURAFIRM their trusted daily skincare ritual.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-[#8a4a32] transition-opacity hover:opacity-90"
        >
          Shop the Collection <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#f0e0d6] bg-white py-8 text-center text-xs text-neutral-400">
        <p>© {new Date().getFullYear()} AURAFIRM. All rights reserved.</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
          {[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: "Contact", href: "/contact" },
            { label: "Privacy", href: "/privacy" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-neutral-700">
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
