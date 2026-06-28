"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  ShoppingCart,
  Heart,
  Camera,
  AtSign,
  Share2,
  Play,
  Minus,
  Plus,
  Trash2,
  Truck,
  Lock,
  ShieldCheck,
  Leaf,
  ChevronRight,
  ArrowLeft,
  Tag,
  MessageCircle,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import UserMenu from "@/components/UserMenu"

const navItems = ["Shop", "Our Story", "Why AURAFIRM", "Contact"]

const suggestedProducts = [
  {
    id: "vitamin-c-face-wash",
    name: "Vitamin C Face Wash",
    subtitle: "Brightening Cleanser",
    price: 749,
    image:
      "https://res.cloudinary.com/df01whs60/image/upload/v1782241556/front-profile_page-0001-removebg-preview_syyqyk.png",
  },
  {
    id: "niacinamide-serum",
    name: "Niacinamide Serum",
    subtitle: "Pore Refining Formula",
    price: 999,
    image:
      "https://res.cloudinary.com/df01whs60/image/upload/v1782241556/front-profile_page-0001-removebg-preview_syyqyk.png",
  },
  {
    id: "hydra-glow-moisturizer",
    name: "Hydra Glow Moisturizer",
    subtitle: "24H Deep Hydration",
    price: 699,
    image:
      "https://res.cloudinary.com/df01whs60/image/upload/v1782241602/ChatGPT_Image_Jun_19__2026__10_00_30_PM-removebg-preview_hsizp4.png",
  },
  {
    id: "daily-sunscreen-spf50",
    name: "Daily Sunscreen SPF 50",
    subtitle: "Broad Spectrum Protection",
    price: 699,
    image:
      "https://res.cloudinary.com/df01whs60/image/upload/v1782241602/ChatGPT_Image_Jun_19__2026__10_00_30_PM-removebg-preview_hsizp4.png",
  },
]

const trustBadges = [
  { icon: Truck, title: "Free Shipping", sub: "On orders above ₹999" },
  { icon: Lock, title: "Secure Payment", sub: "100% protected" },
  { icon: ShieldCheck, title: "Dermatest Tested", sub: "Safe for sensitive skin" },
  { icon: Leaf, title: "Vegan", sub: "Plant Powered" },
]

const footerColumns = [
  { title: "Company", links: ["About Us", "Blogs", "Contact Us", "Careers"] },
  { title: "Customer Services", links: ["My Account", "Track Your Order", "Returns", "FAQ"] },
  { title: "Our Information", links: ["Privacy", "User Terms & Condition", "Return Policy"] },
  {
    title: "Contact Info",
    links: ["+1 (123) 456 - 789", "care@aurafirm.com", "B-902, Preston Rd.\nInglewood, Maine 96880"],
    isContact: true,
  },
]

const FREE_SHIPPING_THRESHOLD = 1999
const DISCOUNT = 200
const SHIPPING = 99
const TAX_RATE = 0.18

export default function CartPage() {
  const { items, removeItem, updateQuantity, addItem } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [wishlistSuggested, setWishlistSuggested] = useState<Set<string>>(new Set())

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING
  const tax = Math.round(subtotal * TAX_RATE)
  const grandTotal = subtotal - DISCOUNT + shippingCost + tax

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleWishlistSuggested = (id: string) => {
    setWishlistSuggested((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#faf5f3] font-sans text-neutral-800">
      {/* Announcement bar */}
      <div className="bg-[#8B4513] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-6">
          <span className="hidden flex-1 md:block" />
          <p className="flex-1 text-center text-[10px] sm:text-xs">
            {"♡ Vegan \u2022 100% cruelty free & plant powered | "}
            <span className="font-semibold">Dermatest Tested</span>
            {" \u2013 Safe for sensitive skin \uD83C\uDF31"}
          </p>
          <div className="flex flex-1 items-center justify-end gap-3 text-white/90">
            <a href="#" aria-label="Photos"><Camera className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Share"><Share2 className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Video"><Play className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Sign out"><ArrowLeft className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="border-b border-[#f0d8c8] bg-[#faf5f3]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8">
          <Link href="/" aria-label="AURAFIRM home">
            <Image
              src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
              alt="AURAFIRM logo"
              width={160}
              height={56}
              className="h-14 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Primary">
            {navItems.map((item, i) => (
              <a
                key={item}
                href="#"
                className={`transition-colors hover:text-[#b86244] ${
                  i === 0
                    ? "border-b-2 border-[#b86244] pb-0.5 font-semibold text-[#b86244]"
                    : "text-neutral-700"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-neutral-700">
            <button aria-label="Search" className="transition-colors hover:text-[#b86244]">
              <Search className="h-4.5 w-4.5" />
            </button>
            <Link href="/cart" aria-label="Cart" className="relative transition-colors hover:text-[#b86244]">
              <ShoppingCart className="h-4.5 w-4.5" />
              {items.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9744e] text-[9px] font-bold text-white">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </Link>
            <button aria-label="Wishlist" className="transition-colors hover:text-[#b86244]">
              <Heart className="h-4.5 w-4.5" />
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Page heading */}
        <div className="mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Shopping <span className="text-[#c9744e]">Cart</span>
          </h1>
          <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/" className="hover:text-neutral-800">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-neutral-700">Cart</span>
          </nav>
        </div>

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT: Cart table + suggestions */}
          <div className="flex flex-col gap-6">
            {/* Cart items card */}
            <div className="rounded-2xl border border-[#f0d8c8] bg-white shadow-sm">
              {/* Table header */}
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-[#f0d8c8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 sm:grid">
                <span>Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-center">Total</span>
                <span />
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center text-neutral-500">
                  <ShoppingCart className="h-12 w-12 text-[#e3a985]" />
                  <p className="text-lg font-semibold text-neutral-700">Your cart is empty</p>
                  <Link
                    href="/"
                    className="mt-2 rounded-lg bg-[#c9744e] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b86244]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f5eae4]">
                  {items.map((item) => {
                    const lineTotal = item.price * item.quantity
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center sm:px-6"
                      >
                        {/* Product info */}
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#fbede5]">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={80}
                              className="h-full w-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-800">{item.name}</p>
                            <p className="mt-0.5 text-xs text-neutral-500">{item.subtitle}</p>
                            {item.tags && (
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                {item.tags.map((tag) => (
                                  <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] text-[#6b8f5e]">
                                    <Leaf className="h-2.5 w-2.5" /> {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between sm:justify-center">
                          <span className="text-xs text-neutral-500 sm:hidden">Price</span>
                          <span className="text-sm font-semibold text-neutral-800">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between sm:justify-center">
                          <span className="text-xs text-neutral-500 sm:hidden">Quantity</span>
                          <div className="flex items-center rounded-full border border-[#e3c8bb] bg-[#faf5f3]">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-[#f0d8c8]"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-neutral-800">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-[#f0d8c8]"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="flex items-center justify-between sm:justify-center">
                          <span className="text-xs text-neutral-500 sm:hidden">Total</span>
                          <span className="text-sm font-semibold text-neutral-800">
                            ₹{lineTotal.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 sm:flex-col">
                          <button
                            aria-label="Add to wishlist"
                            onClick={() => toggleWishlist(item.id)}
                            className={`transition-colors ${wishlist.has(item.id) ? "text-[#c9744e]" : "text-neutral-400 hover:text-[#c9744e]"}`}
                          >
                            <Heart className={`h-4 w-4 ${wishlist.has(item.id) ? "fill-current" : ""}`} />
                          </button>
                          <button
                            aria-label="Remove item"
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 transition-colors hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Free shipping progress */}
              {items.length > 0 && (
                <div className="border-t border-[#f0d8c8] bg-[#fdf6f2] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm text-neutral-700">
                      <Truck className="h-4 w-4 text-[#c9744e]" />
                      {amountToFreeShipping > 0 ? (
                        <>
                          You&apos;re{" "}
                          <strong className="text-neutral-900">
                            ₹{amountToFreeShipping.toLocaleString("en-IN")}
                          </strong>{" "}
                          away from{" "}
                          <strong className="text-neutral-900">FREE SHIPPING</strong>
                        </>
                      ) : (
                        <span className="font-semibold text-[#6b8f5e]">
                          You&apos;ve unlocked FREE SHIPPING!
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-neutral-500">
                      ₹{subtotal.toLocaleString("en-IN")} / ₹{FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f0d8c8]">
                    <div
                      className="h-full rounded-full bg-[#c9744e] transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* You May Also Like */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-neutral-800">
                You May <span className="text-[#c9744e]">Also Like</span>
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {suggestedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col rounded-xl border border-[#f0d8c8] bg-white p-3 shadow-sm"
                  >
                    <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-[#fbede5]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="h-full w-auto object-contain mix-blend-multiply"
                      />
                    </div>
                    <p className="mt-2 text-xs font-bold text-neutral-800 leading-tight">{product.name}</p>
                    <p className="mt-0.5 text-[10px] text-neutral-500">{product.subtitle}</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-800">₹{product.price}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          addItem({
                            id: product.id,
                            name: product.name,
                            subtitle: product.subtitle,
                            price: product.price,
                            image: product.image,
                            tags: ["Vegan", "Dermatest Tested"],
                          })
                        }
                        className="flex-1 rounded-full bg-[#c9744e] py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#b86244]"
                      >
                        Add to Cart
                      </button>
                      <button
                        aria-label="Add to wishlist"
                        onClick={() => toggleWishlistSuggested(product.id)}
                        className={`transition-colors ${wishlistSuggested.has(product.id) ? "text-[#c9744e]" : "text-neutral-400 hover:text-[#c9744e]"}`}
                      >
                        <Heart className={`h-4 w-4 ${wishlistSuggested.has(product.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Order summary */}
          <div className="flex flex-col gap-4">
            {/* Secure checkout badge */}
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c9744e] text-[#c9744e]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              100% Secure Checkout
            </div>

            {/* Summary card */}
            <div className="rounded-2xl border border-[#f0d8c8] bg-white p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-neutral-900">Order Summary</h2>

              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Discount</span>
                  <span className="font-semibold text-[#c9744e]">-₹{DISCOUNT}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-[#6b8f5e]">Free</span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Tax (18%)</span>
                  <span className="font-semibold">₹{tax.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="my-4 border-t border-dashed border-[#f0d8c8]" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-extrabold text-neutral-900">Grand Total</p>
                  <p className="text-[10px] text-neutral-500">Inclusive of all taxes</p>
                </div>
                <p className="text-2xl font-extrabold text-[#c9744e]">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Coupon code */}
              <div className="mt-5 flex items-center overflow-hidden rounded-xl border border-[#e3c8bb]">
                <div className="flex flex-1 items-center gap-2 px-3 py-2 text-neutral-500">
                  <Tag className="h-4 w-4 shrink-0" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon Code"
                    className="w-full bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none"
                  />
                </div>
                <button className="bg-[#c9744e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b86244]">
                  Apply
                </button>
              </div>

              {/* CTA buttons */}
              <Link
                href="/checkout"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B4513] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#7a3c10]"
              >
                <Lock className="h-4 w-4" />
                Proceed to Checkout
              </Link>

              <Link
                href="/"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#c9744e] py-3.5 text-sm font-bold text-[#c9744e] transition-colors hover:bg-[#fdf6f2]"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {trustBadges.map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#f0d8c8] bg-white px-3 py-4 text-center shadow-sm"
                >
                  <Icon className="h-5 w-5 text-[#c9744e]" />
                  <p className="text-xs font-bold text-neutral-800">{title}</p>
                  <p className="text-[10px] text-neutral-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Trust bar */}
      <div className="mt-12 bg-[#8B4513] py-5">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-around gap-6">
            {[
              { icon: Heart, title: "for Indian Skin", sub: "Formulated in India" },
              { icon: Leaf, title: "Vegan \u2022 100%", sub: "cruelty free & plant powered" },
              { icon: ShieldCheck, title: "Dermatest Tested", sub: "Safe for sensitive skin" },
              { icon: Heart, title: "for Indian Skin", sub: "Formulated in India" },
              { icon: Leaf, title: "Vegan \u2022 100%", sub: "cruelty free & plant powered" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30">
                  <badge.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">{badge.title}</p>
                  <p className="text-[10px] text-white/75">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#faf5f3] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
                  alt="AURAFIRM logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
                <span className="text-lg font-bold text-neutral-800">Aurafirm.</span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-neutral-500">
                Where science meets self-care. We create high-quality, safe, and effective skincare and
                wellness solutions built on purity, innovation, and care.
              </p>
              <div className="mt-4 flex items-center gap-3">
                {[Camera, AtSign, Share2, Play, MessageCircle].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={`Social link ${i + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e3c8bb] text-neutral-600 transition-colors hover:border-[#c9744e] hover:text-[#c9744e]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">
                  {col.title}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="whitespace-pre-line text-xs text-neutral-500 transition-colors hover:text-[#c9744e]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer bottom */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0d8c8] pt-6 text-xs text-neutral-500">
            <p>
              Copyright &copy; 2025{" "}
              <a href="#" className="font-semibold text-[#c9744e] hover:underline">
                Aurafirm
              </a>
              . All Rights Reserved.
            </p>
            <div className="flex items-center gap-4">
              <select className="rounded border border-[#e3c8bb] bg-transparent px-2 py-1 text-xs text-neutral-600">
                <option>English</option>
              </select>
              <select className="rounded border border-[#e3c8bb] bg-transparent px-2 py-1 text-xs text-neutral-600">
                <option>USD</option>
                <option>INR</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


