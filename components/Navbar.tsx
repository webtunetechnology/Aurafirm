"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  ShoppingCart,
  Heart,
  Search,
  Camera,
  Menu,
  X,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import UserMenu from "@/components/UserMenu"

const navItems = [
  { label: "Home",         href: "/" },
  { label: "Our Story",    href: "/about" },
  { label: "Why AURAFIRM", href: "/why-aurafirm" },
  { label: "Contact",      href: "/contact" },
]

export default function Navbar() {
  const { items } = useCart()
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // The storefront navbar should never appear in the admin panel (or admin login).
  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="flex items-center justify-between bg-[#8a4a32] px-4 py-2 text-[11px] text-white sm:px-8">
        <div className="flex flex-1 items-center justify-center gap-3">
          <span className="text-white/80">Also available on</span>
          <a
            href="https://www.amazon.in/AuraFirm-Youghful-Collagen-Hyaluronic-Niacinamide/dp/B0H5KNMRFF"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 items-center rounded bg-white px-2.5 transition-opacity hover:opacity-90"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/amazon/default.svg"
              alt="Amazon"
              className="h-4 w-auto"
            />
          </a>
          <span className="text-white/40">&amp;</span>
          <a
            href="https://www.flipkart.com/aurafirm-fusion-4x1/p/itmca2a6d1bf87f6?pid=KMTHZGXWSZHRGHG5&lid=LSTKMTHZGXWSZHRGHG5LZLZPT&marketplace=FLIPKART&cmpid=content_skin-treatment_8965229628_gmc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 items-center rounded bg-white px-2.5 transition-opacity hover:opacity-90"
          >
            <img
              src="https://res.cloudinary.com/dgydmwvvm/image/upload/v1782744189/download-removebg-preview_rhfgf8.png"
              alt="Flipkart"
              className="h-6 w-auto"
            />
          </a>
        </div>
        <a
          href="https://www.instagram.com/aurafirm_"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hidden items-center sm:flex text-white/80 hover:text-white transition-colors"
        >
          <Camera className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Main navbar */}
      <header className="border-b border-[#f0d8c8] bg-[#faf5f3]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {/* Logo */}
          <Link href="/" aria-label="AURAFIRM home">
            <Image
              src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
              alt="AURAFIRM logo"
              width={160}
              height={56}
              priority
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-neutral-700 transition-colors hover:text-[#b86244]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 text-neutral-700">
            <Search className="h-4 w-4 cursor-pointer transition-colors hover:text-[#b86244]" aria-label="Search" />
            <Link href="/cart" aria-label="Cart" className="relative transition-colors hover:text-[#b86244]">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9744e] text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <Heart className="h-4 w-4 cursor-pointer transition-colors hover:text-[#b86244]" aria-label="Wishlist" />
            <UserMenu />
            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <nav className="relative ml-auto flex h-full w-72 flex-col bg-[#faf5f3] px-6 py-8 shadow-xl">
            <button
              className="absolute right-4 top-4 text-neutral-600 hover:text-neutral-900"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <Link href="/" className="mb-8 mt-2">
              <Image
                src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
                alt="AURAFIRM logo"
                width={130}
                height={44}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-base font-medium text-neutral-800 transition-colors hover:text-[#b86244]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-3 border-t border-[#f0d8c8] pt-6">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-sm text-neutral-700 hover:text-[#b86244]"
                onClick={() => setMobileOpen(false)}
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {itemCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c9744e] text-[9px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
