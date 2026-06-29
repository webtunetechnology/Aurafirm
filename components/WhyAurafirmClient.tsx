"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import Navbar from "@/components/Navbar"
import {
  ShoppingBag,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sparkles,
  Globe,
  Award,
  ChevronDown,
  ArrowRight,
  Camera,
  AtSign,
  Share2,
  Play,
  MessageCircle,
  Sprout,
} from "lucide-react"
import { useState } from "react"

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

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About Us",   href: "/about" },
      { label: "Blogs",      href: "/blogs" },
      { label: "Contact Us", href: "/contact" },
      { label: "Career",     href: "/career" },
    ],
  },
  {
    title: "Customer Services",
    links: [
      { label: "My Account",       href: "/account/orders" },
      { label: "Track Your Order", href: "/account/orders" },
      { label: "Return",           href: "/contact" },
      { label: "FAQ",              href: "/contact" },
    ],
  },
  {
    title: "Our Information",
    links: [
      { label: "Privacy",                 href: "/privacy" },
      { label: "User Terms & Condition",  href: "/terms" },
      { label: "Return Policy",           href: "/return-policy" },
    ],
  },
]

const socialIcons = [Camera, AtSign, Share2, Play, MessageCircle]

export default function WhyAurafirmClient({ pillars }: { pillars: Pillar[] }) {
  const { items } = useCart()


  return (
    <div className="min-h-screen bg-[#faf5f3] font-sans">

      <Navbar />

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
      <footer className="bg-[#faf5f3] px-6 pb-8 pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8a4a32] text-white">
                  <Sprout className="h-5 w-5" />
                </div>
                <span className="font-sans text-2xl font-bold text-neutral-800">Aurafirm.</span>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-neutral-500">
                Where science meets self-care. We create high-quality, safe, and effective skincare and wellness solutions built on purity, innovation, and care.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {socialIcons.map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social media link"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a4a32] text-white transition-colors hover:bg-[#6f3a26]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="font-sans text-sm font-bold text-neutral-800">{col.title}</h4>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-neutral-500 transition-colors hover:text-neutral-800">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Info */}
            <div>
              <h4 className="font-sans text-sm font-bold text-neutral-800">Contact Info</h4>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-neutral-500">
                <li>+0123-456-789</li>
                <li>care@aurafirm.com</li>
                <li>
                  8502 Preston Rd.
                  <br />
                  Inglewood, Maine
                  <br />
                  98380
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row">
            <p className="text-sm text-neutral-500">
              Copyright {"\u00A9"} 2025 <span className="text-[#c79a4b]">Aurafirm.</span> All Rights Reserved.
            </p>
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <button className="flex items-center gap-1 hover:text-neutral-800">
                English <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-neutral-300">|</span>
              <button className="flex items-center gap-1 hover:text-neutral-800">
                USD <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
