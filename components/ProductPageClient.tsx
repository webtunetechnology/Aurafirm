"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronDown,
  Share2,
  Star,
  Minus,
  Plus,
  Check,
  ShieldCheck,
  Truck,
  Award,
  Lock,
  ArrowRight,
  ThumbsUp,
  Search,
  ShoppingCart,
  Heart,
  Camera,
  AtSign,
  Play,
  MessageCircle,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import UserMenu from "@/components/UserMenu"
import ReviewSection from "@/components/ReviewSection"
import type { Review } from "@/lib/actions"

// ─── Types matching the DB JSONB columns ────────────────────────────────────

type Ingredient = {
  image: string
  title: string
  description: string
  benefits: string[]
}

type Step = {
  number: string
  title: string
  description: string
}

type FAQ = {
  question: string
  answer: string
}

type Product = {
  id: string
  name: string
  subtitle: string | null
  description: string | null
  price: number
  original_price: number | null
  vip_price: number | null
  size_label: string | null
  category: string
  image_url: string | null
  gallery_images: string[] | null
  helps_with: string[] | null
  suitable_for: string[] | null
  hero_ingredients: Ingredient[] | null
  how_to_use_steps: Step[] | null
  full_ingredients_text: string | null
  manufacturing_info: string | null
  faqs: FAQ[] | null
  rating: number | null
  review_count: number | null
  tags: string[] | null
  slug: string | null
}

const trustBadges = [
  { icon: ShieldCheck, label: "100%\nAuthentic" },
  { icon: Truck,       label: "Fast\nDelivery" },
  { icon: Award,       label: "Quality\nGuaranteed" },
  { icon: Lock,        label: "Secure\nCheckout" },
]

type ProductPageProps = {
  product: Product
  initialReviews: Review[]
  isLoggedIn: boolean
  currentUserId: string | null
  existingReview: Review | null
}

export default function ProductPageClient({
  product,
  initialReviews,
  isLoggedIn,
  currentUserId,
  existingReview,
}: ProductPageProps) {
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity]       = useState(1)
  const [openFaq, setOpenFaq]         = useState<number | null>(null)
  const [openDetail, setOpenDetail]   = useState<number | null>(0)
  const [added, setAdded]             = useState(false)

  const gallery       = product.gallery_images?.length ? product.gallery_images : [product.image_url ?? "/placeholder.svg"]
  const helpsWith     = product.helps_with ?? []
  const suitableFor   = product.suitable_for ?? []
  const ingredients   = product.hero_ingredients ?? []
  const steps         = product.how_to_use_steps ?? []
  const faqs          = product.faqs ?? []
  const rating        = product.rating ?? 4.5
  const reviewCount   = product.review_count ?? 0

  // Round rating to determine filled stars
  const filledStars = Math.round(rating)

  const detailSections = [
    {
      title: "Product details",
      subtitle: "Overview",
      content: product.description,
    },
    {
      title: "Full ingredients",
      subtitle: "Complete ingredient list",
      content: product.full_ingredients_text,
    },
    {
      title: "Manufacturing & compliance",
      subtitle: "Batch, origin, legal, and support details",
      content: product.manufacturing_info,
    },
  ].filter((s) => s.content)

  function handleAddToCart() {
    addItem({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle ?? product.category,
      price: product.price,
      image: product.image_url ?? "",
      tags: product.tags ?? [],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Announcement bar */}
      <div className="bg-[#8B4513] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-6">
          <span className="hidden flex-1 md:block" />
          <p className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-center text-[10px] sm:text-xs md:text-sm">
            {"Vegan \u2013 100% cruelty-free & plant-powered | "}
            <span className="font-semibold">Dermat Tested</span>
            {" \u2013 Safe for sensitive skins"}
          </p>
          <div className="flex flex-1 items-center justify-end gap-3 text-white/90">
            <a href="#" aria-label="Photos" className="transition-opacity hover:opacity-70"><Camera className="h-4 w-4" /></a>
            <a href="#" aria-label="Email"  className="transition-opacity hover:opacity-70"><AtSign className="h-4 w-4" /></a>
            <a href="#" aria-label="Share"  className="transition-opacity hover:opacity-70"><Share2 className="h-4 w-4" /></a>
            <a href="#" aria-label="Video"  className="transition-opacity hover:opacity-70"><Play className="h-4 w-4" /></a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="AuraFirm home">
            <img
              src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
              alt="AURAFIRM logo"
              className="h-14 w-auto object-contain"
            />
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <Link href="/" className="border-b-2 border-[#8B4513] pb-0.5 text-base font-medium text-[#8B4513]">Shop</Link>
            <a href="#" className="text-base text-gray-700 transition-colors hover:text-[#8B4513]">Our Story</a>
            <a href="#" className="text-base text-gray-700 transition-colors hover:text-[#8B4513]">Why AURAFIRM</a>
            <a href="#" className="text-base text-gray-700 transition-colors hover:text-[#8B4513]">Contact</a>
          </nav>
          <div className="flex shrink-0 items-center gap-5 text-gray-700">
            <button type="button" aria-label="Search"   className="transition-colors hover:text-[#8B4513]"><Search className="h-5 w-5" /></button>
            <Link href="/cart" aria-label="Cart"        className="transition-colors hover:text-[#8B4513]"><ShoppingCart className="h-5 w-5" /></Link>
            <button type="button" aria-label="Wishlist" className="transition-colors hover:text-[#8B4513]"><Heart className="h-5 w-5" /></button>
            <UserMenu iconClassName="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <a href="#" className="hover:text-gray-900">{product.category}</a>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={gallery[activeImage] ?? "/placeholder.svg"}
                alt={product.name}
                className="aspect-square w-full object-contain"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-gray-900/70 px-2.5 py-0.5 text-xs font-medium text-white">
                {activeImage + 1}/{gallery.length}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={activeImage === i}
                  className={`overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors ${
                    activeImage === i ? "border-gray-900" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={src ?? "/placeholder.svg"} alt={`Thumbnail ${i + 1}`} className="aspect-square w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{product.category}</p>
              <button type="button" aria-label="Share product" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-gray-100">
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <h1 className="mt-2 text-balance text-2xl font-bold leading-tight text-gray-900 md:text-3xl">{product.name}</h1>

            {product.subtitle && (
              <p className="mt-1 text-sm font-medium text-[#8B4513]">{product.subtitle}</p>
            )}

            <p className="mt-3 text-sm leading-relaxed text-gray-600">{product.description}</p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2" aria-label={`Rating: ${rating} out of 5`}>
              <div className="flex items-center" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i < filledStars ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">{rating}</span>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>

            {/* Size */}
            {product.size_label && (
              <div className="mt-4">
                <span className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900">
                  {product.size_label}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-5">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-gray-900">&#8377;{product.price.toLocaleString("en-IN")}</p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-base text-gray-400 line-through">&#8377;{product.original_price.toLocaleString("en-IN")}</p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">(MRP. Inclusive of all taxes)</p>
            </div>

            {/* VIP price */}
            {product.vip_price && (
              <button type="button" className="mt-3 flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
                <span className="font-semibold">AuraFirm VIP price &#8377;{product.vip_price.toLocaleString("en-IN")}</span>
                <span className="text-white/50">&#xB7;</span>
                <span className="inline-flex items-center gap-1 text-white/80">
                  Join from &#8377;2,999 / 3 mo <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            )}

            {product.size_label && (
              <p className="mt-2 text-xs text-gray-500">Net Qty. {product.size_label}</p>
            )}

            {/* Availability */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Available &middot; Ships in 24 hours</span>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Quantity</p>
              <div className="mt-2 inline-flex items-center rounded-md border border-gray-300">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium text-gray-900" aria-live="polite">{quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)} className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-5 w-full rounded-lg bg-gray-900 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-3 text-center">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="whitespace-pre-line text-[11px] leading-tight text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Helps with / Suitable for */}
        {(helpsWith.length > 0 || suitableFor.length > 0) && (
          <div className="mt-10 grid grid-cols-1 gap-6 rounded-2xl border border-gray-200 bg-white p-6 md:grid-cols-2 md:p-8">
            {helpsWith.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Helps With</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {helpsWith.map((item) => (
                    <li key={item} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {suitableFor.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Suitable For</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {suitableFor.map((item) => (
                    <li key={item} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Hero Ingredients */}
        {ingredients.length > 0 && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hero Ingredients</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-balance text-2xl font-bold text-gray-900 md:text-3xl">{"What's doing the work"}</h2>
              <p className="text-sm text-gray-500">These are the key actives. Complete ingredient list below.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {ingredients.map((ingredient) => (
                <article key={ingredient.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="overflow-hidden rounded-lg bg-white">
                    <img src={ingredient.image ?? "/placeholder.svg"} alt={ingredient.title} className="aspect-[4/3] w-full object-cover" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{ingredient.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{ingredient.description}</p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {ingredient.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />{benefit}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* How to use */}
        {steps.length > 0 && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">How To Use</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-balance text-2xl font-bold text-gray-900 md:text-3xl">Simple routine, clear steps</h2>
              <p className="text-sm text-gray-500">Use after cleansing, then moisturise. Apply sunscreen in the morning.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">{step.number}</span>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Product details accordion */}
        {detailSections.length > 0 && (
          <section className="mt-6 flex flex-col gap-4">
            {detailSections.map((section, i) => {
              const isOpen = openDetail === i
              return (
                <div key={section.title} className="rounded-2xl border border-gray-200 bg-white p-2 md:p-3">
                  <button
                    type="button"
                    onClick={() => setOpenDetail(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left md:px-5"
                  >
                    <span>
                      <span className="block text-base font-bold text-gray-900 md:text-lg">{section.title}</span>
                      <span className="mt-0.5 block text-xs text-gray-500">{section.subtitle}</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-gray-200 px-4 py-4 text-sm leading-relaxed text-gray-600 md:px-5">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Frequently Asked Questions</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-balance text-2xl font-bold text-gray-900 md:text-3xl">Quick answers before purchase</h2>
              <p className="text-sm text-gray-500">Answers for routine, sensitivity, and daily use.</p>
            </div>
            <div className="mt-6 flex flex-col gap-2.5">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i
                return (
                  <div key={faq.question} className="rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    >
                      <span className="text-[13px] font-semibold text-gray-900">{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <p className="px-4 pb-3.5 text-[13px] leading-relaxed text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Customer Reviews */}
        <ReviewSection
          productId={product.id}
          initialReviews={initialReviews}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          existingReview={existingReview}
          productRating={rating}
          productReviewCount={reviewCount}
        />
      </div>

      {/* Trust bar */}
      <div className="mt-8 bg-[#8B4513] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-4 px-4 py-5 md:px-6">
          {[
            { title: "for Indian Skin", sub: "Formulated for all tones" },
            { title: "Vegan - 100%",   sub: "cruelty-free plant-powered" },
            { title: "Dermat Tested",  sub: "Safe for sensitive skin" },
            { title: "for Indian Skin",sub: "Formulated for all tones" },
            { title: "Vegan - 100%",   sub: "cruelty-free plant-powered" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40">
                <Heart className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight">{item.title}</span>
                <span className="block text-xs text-white/80">{item.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white text-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 lg:pr-8">
              <img
                src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
                alt="AURAFIRM logo"
                className="h-14 w-auto object-contain"
              />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-500">
                Where science meets self-care. We create high-quality, safe, and effective skincare and wellness solutions built on purity, innovation, and care.
              </p>
              <div className="mt-6 flex items-center gap-4">
                {[Camera, AtSign, Share2, Play, MessageCircle].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social link" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B4513] text-white transition-opacity hover:opacity-80">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { heading: "Company",          links: ["About Us","Blogs","Contact Us","Career"] },
              { heading: "Customer Services",links: ["My Account","Track Your Order","Return","FAQ"] },
              { heading: "Our Information",  links: ["Privacy","User Terms & Condition","Return Policy"] },
            ].map((col) => (
              <div key={col.heading}>
                <h3 className="text-base font-bold text-gray-900">{col.heading}</h3>
                <ul className="mt-5 flex flex-col gap-4">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-gray-500 transition-colors hover:text-[#8B4513]">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="text-base font-bold text-gray-900">Contact Info</h3>
              <ul className="mt-5 flex flex-col gap-4 text-sm text-gray-500">
                <li><a href="tel:+01234567890" className="transition-colors hover:text-[#8B4513]">+0123-456-789</a></li>
                <li><a href="mailto:care@aurafirm.com" className="transition-colors hover:text-[#8B4513]">care@aurafirm.com</a></li>
                <li className="leading-relaxed">8502 Preston Rd.<br />Inglewood, Maine<br />98380</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-gray-500">
                Copyright &copy; 2025 <span className="font-medium text-[#8B4513]">Aurafirm.</span> All Rights Reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-700">
                <button type="button" className="inline-flex items-center gap-1.5">English <ChevronDown className="h-4 w-4" /></button>
                <span className="text-gray-300">|</span>
                <button type="button" className="inline-flex items-center gap-1.5">USD <ChevronDown className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
