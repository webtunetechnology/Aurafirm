"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import Navbar from "@/components/Navbar"
import { useState } from "react"
import {
  ShoppingBag,

  ChevronDown,
  ArrowRight,
  FlaskConical,
  Leaf,
  Heart,
  Users,
  Sparkles,
  Globe,
  Award,
  Star,
  Zap,
  Sun,
  Camera,
  AtSign,
  Share2,
  Play,
  MessageCircle,
  Sprout,
} from "lucide-react"


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
      { label: "Privacy",                href: "/privacy" },
      { label: "User Terms & Condition", href: "/terms" },
      { label: "Return Policy",          href: "/return-policy" },
    ],
  },
]

const socialIcons = [Camera, AtSign, Share2, Play, MessageCircle]

const iconMap: Record<string, React.ElementType> = {
  FlaskConical, Leaf, Heart, Users, Sparkles, Globe, Award, Star, Zap, Sun,
}

type Content = {
  hero_tag: string
  hero_heading: string
  hero_subtext: string
  hero_image: string
  mission_heading: string
  mission_body: string
  founder_name: string
  founder_quote: string
  founder_image: string
}

type Milestone = { id: string; sort_order: number; year: string; title: string; description: string }
type Value = { id: string; sort_order: number; icon: string; title: string; description: string }

export default function OurStoryClient({
  content,
  milestones,
  values,
}: {
  content: Content
  milestones: Milestone[]
  values: Value[]
}) {
  const { items } = useCart()


  return (
    <div className="min-h-screen bg-[#faf5f3] font-sans">

      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#8a4a32] px-6 py-24 text-white">
        {content.hero_image && (
          <img
            src={content.hero_image}
            alt="Our Story hero"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        )}
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
            {content.hero_tag}
          </span>
          <h1 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            {content.hero_heading}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg">
            {content.hero_subtext}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#8a4a32] transition-opacity hover:opacity-90"
          >
            Explore Our Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#c9744e]">
              Who We Are
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              {content.mission_heading}
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-neutral-600">
              {content.mission_body}
            </p>
            <Link
              href="/why-aurafirm"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c9744e] hover:underline"
            >
              Why AURAFIRM? <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#f0d8c8]">
              {content.founder_image ? (
                <img
                  src={content.founder_image}
                  alt="AURAFIRM founders"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Sprout className="h-16 w-16 text-[#c9744e]/40" />
                </div>
              )}
            </div>
            {/* Founder quote card */}
            <div className="absolute -bottom-6 -left-4 max-w-xs rounded-2xl bg-white p-5 shadow-xl">
              <p className="text-sm leading-relaxed text-neutral-700 before:mr-1 before:content-['\u201C'] after:ml-1 after:content-['\u201D']">
                {content.founder_quote}
              </p>
              <p className="mt-3 text-xs font-bold text-[#8a4a32]">{content.founder_name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      {values.length > 0 && (
        <section className="bg-[#8a4a32] px-6 py-20 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                What We Stand For
              </span>
              <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-4xl">Our Core Values</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => {
                const Icon = iconMap[v.icon] ?? Heart
                return (
                  <div
                    key={v.id}
                    className="rounded-2xl bg-white/10 p-6 backdrop-blur transition-colors hover:bg-white/15"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{v.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {milestones.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c9744e]">
              How We Got Here
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              Our Journey
            </h2>
          </div>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-[#f0d8c8] md:left-1/2 md:-translate-x-0.5" />
            <div className="flex flex-col gap-10">
              {milestones.map((m, i) => (
                <div
                  key={m.id}
                  className={`relative flex gap-8 md:gap-0 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* dot */}
                  <div className="absolute left-[18px] top-3 h-4 w-4 rounded-full border-2 border-[#c9744e] bg-white md:left-1/2 md:-translate-x-1/2" />
                  {/* content */}
                  <div
                    className={`ml-12 md:ml-0 md:w-1/2 ${
                      i % 2 === 0 ? "md:pr-16" : "md:pl-16"
                    }`}
                  >
                    <div className="rounded-2xl border border-[#f0d8c8] bg-white p-6 shadow-sm">
                      <span className="inline-block rounded-full bg-[#fdf6f2] px-3 py-0.5 text-xs font-bold text-[#c9744e]">
                        {m.year}
                      </span>
                      <h3 className="mt-3 text-base font-bold text-neutral-900">{m.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{m.description}</p>
                    </div>
                  </div>
                  {/* spacer for alternating */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl bg-[#fdf6f2] px-8 py-14 text-center">
          <h2 className="text-balance text-3xl font-extrabold text-neutral-900 sm:text-4xl">
            Ready to Experience AURAFIRM?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base text-neutral-600">
            Discover our science-backed skincare range, crafted with clean ingredients and real results.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-[#8a4a32] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7a3c10]"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#c9744e] px-7 py-3 text-sm font-bold text-[#c9744e] transition-colors hover:bg-[#fdf0e8]"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#faf5f3] px-6 pb-8 pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8a4a32] text-white">
                  <Sprout className="h-5 w-5" />
                </div>
                <span className="font-sans text-2xl font-bold text-neutral-800">Aurafirm.</span>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-neutral-500">
                Where science meets self-care. High-quality, safe, and effective skincare built on purity, innovation, and care.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {socialIcons.map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    aria-label="Social media link"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a4a32] text-white transition-colors hover:bg-[#6f3a26]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-neutral-800">{col.title}</h4>
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
            <div>
              <h4 className="text-sm font-bold text-neutral-800">Contact Info</h4>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-neutral-500">
                <li>+0123-456-789</li>
                <li>care@aurafirm.com</li>
                <li>8502 Preston Rd.<br />Inglewood, Maine 98380</li>
              </ul>
            </div>
          </div>
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
