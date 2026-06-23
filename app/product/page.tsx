"use client"

import { useState } from "react"
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
  Pencil,
  ThumbsUp,
  Search,
  ShoppingCart,
  Heart,
  User,
  Camera,
  AtSign,
  Play,
  MessageCircle,
} from "lucide-react"

const PRODUCT_IMAGE =
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242865/with-box_page-0001_nsdhbr.jpg"

const gallery = [
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242865/with-box_page-0001_nsdhbr.jpg",
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242867/front-profile_page-0001_vcfv72.jpg",
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242867/features-creative-2_page-0001_1_ruvseh.jpg",
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242861/model-1_page-0001_zbu7tn.jpg",
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242871/features-creative_page-0001_juluk2.jpg",
  "https://res.cloudinary.com/df01whs60/image/upload/v1782242858/AuraFirm_face_serum_advertisement_layout_jvarlm.png",
]

const trustBadges = [
  { icon: ShieldCheck, label: "100%\nAuthentic" },
  { icon: Truck, label: "Fast\nDelivery" },
  { icon: Award, label: "Quality\nGuaranteed" },
  { icon: Lock, label: "Secure\nCheckout" },
]

const helpsWith = [
  "Deep hydration and moisture retention",
  "Brightening and evening skin tone",
  "Improving texture, firmness and elasticity",
]

const suitableFor = [
  "All skin types, including sensitive skin",
  "Dull, dry, or uneven-looking skin",
  "Daily morning and evening routines",
]

const ingredients = [
  {
    image: "https://res.cloudinary.com/df01whs60/image/upload/v1782245043/ingredient-hyaluronic_ssgi7l.png",
    title: "Hyaluronic Acid",
    description:
      "Helps attract and retain moisture deep within the skin, supporting long-lasting hydration and a smoother, plumper appearance.",
    benefits: ["Attracts moisture", "Long-lasting hydration", "Smoother skin"],
  },
  {
    image: "https://res.cloudinary.com/df01whs60/image/upload/v1782245150/ingredient-niacinamide_e6mof4.png",
    title: "Niacinamide",
    description:
      "Helps promote a brighter, more even-looking complexion while supporting the skin barrier for healthier-looking skin.",
    benefits: ["Brightens skin", "Evens skin tone", "Supports barrier"],
  },
  {
    image: "https://res.cloudinary.com/df01whs60/image/upload/v1782245097/ingredient-collagen_aruovn.png",
    title: "Peptides & Collagen",
    description:
      "Peptides help support skin repair and firmness, while collagen contributes to a smoother, more youthful-looking appearance.",
    benefits: ["Supports firmness", "Improves elasticity", "Youthful look"],
  },
]

const steps = [
  {
    number: "1",
    title: "Cleanse & Pat Dry",
    description:
      "Start with a clean face. Gently cleanse and pat your skin dry before applying the serum for best absorption.",
  },
  {
    number: "2",
    title: "Apply & Massage",
    description:
      "Dispense a few drops onto your fingertips and gently massage into your face and neck using upward motions.",
  },
  {
    number: "3",
    title: "Moisturise & Protect",
    description:
      "Follow with a moisturiser to lock in hydration. Use morning and evening, and apply sunscreen during the day.",
  },
]

const faqs = [
  {
    question: "Is this serum suitable for all skin types?",
    answer:
      "Yes. The lightweight, fast-absorbing formula is designed for everyday use and is suitable for all skin types, including sensitive skin.",
  },
  {
    question: "How often can I use this serum?",
    answer:
      "It is gentle enough for daily use. For best results, apply morning and evening on clean skin before your moisturiser.",
  },
  {
    question: "What does the 4-in-1 formula contain?",
    answer:
      "It combines Hyaluronic Acid, Niacinamide, Peptides, and Collagen to hydrate, brighten, and support firmer-looking skin in a single serum.",
  },
  {
    question: "What size is this product?",
    answer: "Each bottle contains 100 ml of serum with a convenient dropper for easy application.",
  },
  {
    question: "Is the formula lightweight and non-greasy?",
    answer:
      "Yes. The serum has a lightweight, fast-absorbing texture that blends in effortlessly without leaving a greasy residue.",
  },
]

const detailSections = [
  {
    title: "Product details",
    subtitle: "Overview",
    content: (
      <p>
        AuraFirm Fusion 4x1 Face Serum is an advanced daily skincare formula designed to hydrate,
        nourish, brighten, and support firmer-looking skin. Powered by a blend of Hyaluronic Acid,
        Niacinamide, Peptides, and Collagen, this lightweight serum helps improve skin moisture levels,
        enhance skin texture, and promote a healthy, radiant appearance. Hyaluronic Acid attracts and
        retains moisture, Niacinamide supports a brighter and more even-looking complexion, Peptides help
        support skin repair and firmness, and Collagen contributes to a smoother, more youthful-looking
        appearance. Its fast-absorbing, non-greasy formula makes it suitable for everyday morning and
        evening skincare routines.
      </p>
    ),
  },
  {
    title: "Full ingredients",
    subtitle: "Complete ingredient list",
    content: (
      <p>
        Aqua, Sodium Hyaluronate (Hyaluronic Acid), Niacinamide, Glycerin, Palmitoyl Tripeptide-1,
        Palmitoyl Tetrapeptide-7 (Peptides), Hydrolyzed Collagen, Propanediol, Panthenol, Allantoin,
        Sodium PCA, Xanthan Gum, Carbomer, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
      </p>
    ),
  },
  {
    title: "Manufacturing & compliance",
    subtitle: "Batch, origin, legal, and support details",
    content: (
      <div className="flex flex-col gap-1.5">
        <p>Manufactured in India. Cruelty-free and dermatologically tested.</p>
        <p>Net Qty: 100 ml. Best before 24 months from date of manufacture.</p>
        <p>For queries, contact care@aurafirm.com. Marketed by AuraFirm.</p>
      </div>
    ),
  },
]

const ratingDistribution = [
  { stars: 5, percent: 86 },
  { stars: 4, percent: 10 },
  { stars: 3, percent: 0 },
  { stars: 2, percent: 5 },
  { stars: 1, percent: 0 },
]

const reviews = [
  {
    initial: "S",
    name: "Simran Singh",
    rating: 5,
    date: "6/20/2026",
    title: "Dull skin ka solution",
    body: "Yaar my skin was so dry and dull from all the pollution and late nights but this serum has genuinely brought back some glow and softness after just a couple of weeks. Kafi impressed with how light it feels yet still hydrates properly without making my face oily.",
  },
  {
    initial: "S",
    name: "Simran Singh",
    rating: 5,
    date: "6/18/2026",
    title: "Skin finally glowing",
    body: "My skin was kafi rough and uneven after all the sun exposure but this serum has genuinely made it softer and brighter within a few weeks. Toh bilkul recommend karungi anyone dealing with dull, tired-looking skin.",
  },
  {
    initial: "K",
    name: "Kavitha R.",
    rating: 2,
    date: "6/20/2026",
    title: "Did not suit me",
    body: "Used it for almost a month only, but I didn't notice much difference in brightness and my skin still feels dry by evening.",
  },
  {
    initial: "S",
    name: "sanjana_mum",
    rating: 4,
    date: "6/18/2026",
    title: "Good but strong smell",
    body: "Living in Mumbai the humidity makes my skin feel heavy and sticky by afternoon, and this serum absorbs fast and keeps my skin feeling fresh and hydrated. Only thing is the fragrance is a bit too strong for my liking.",
  },
]

export default function ProductPage() {
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openDetail, setOpenDetail] = useState<number | null>(0)

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Site header */}
      <header>
        {/* Announcement bar */}
        <div className="bg-[#8B4513] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-6">
            <span className="hidden flex-1 md:block" />
            <p className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-center text-[10px] sm:text-xs md:text-sm">
              {"\u21E9 Vegan \u2013 100% cruelty-free & plant-powered | "}
              <span className="font-semibold">Dermat Tested</span>
              {" \u2013 Safe for sensitive skins \u21E9"}
            </p>
            <div className="flex flex-1 items-center justify-end gap-3 text-white/90">
              <a href="#" aria-label="Photos" className="transition-opacity hover:opacity-70">
                <Camera className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Email" className="transition-opacity hover:opacity-70">
                <AtSign className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Share" className="transition-opacity hover:opacity-70">
                <Share2 className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Video" className="transition-opacity hover:opacity-70">
                <Play className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-6">
            {/* Logo */}
            <a href="#" className="flex shrink-0 items-center" aria-label="AURAFIRM home">
              <img
                src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
                alt="AURAFIRM logo"
                className="h-14 w-auto object-contain"
              />
            </a>

            {/* Center nav */}
            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
              <a
                href="#"
                className="border-b-2 border-[#8B4513] pb-0.5 text-base font-medium text-[#8B4513]"
                aria-current="page"
              >
                Shop
              </a>
              <a href="#" className="text-base text-gray-700 transition-colors hover:text-[#8B4513]">
                Our Story
              </a>
              <a href="#" className="text-base text-gray-700 transition-colors hover:text-[#8B4513]">
                Why AURAFIRM
              </a>
              <a href="#" className="text-base text-gray-700 transition-colors hover:text-[#8B4513]">
                Contact
              </a>
            </nav>

            {/* Right icons */}
            <div className="flex shrink-0 items-center gap-5 text-gray-700">
              <button type="button" aria-label="Search" className="transition-colors hover:text-[#8B4513]">
                <Search className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Cart" className="transition-colors hover:text-[#8B4513]">
                <ShoppingCart className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Wishlist" className="transition-colors hover:text-[#8B4513]">
                <Heart className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Account" className="transition-colors hover:text-[#8B4513]">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500"
        >
          <a href="#" className="hover:text-gray-900">
            Home
          </a>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <a href="#" className="hover:text-gray-900">
            Skin Care
          </a>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-gray-900">
            AuraFirm Fusion 4x1 Face Serum with Hyaluronic Acid, Niacinamide, Peptides &amp; Collagen
          </span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={gallery[activeImage] || "/placeholder.svg"}
                alt="AuraFirm Fusion 4x1 Face Serum bottle"
                className="aspect-square w-full object-contain"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-gray-900/70 px-2.5 py-0.5 text-xs font-medium text-white">
                {activeImage + 1}/6
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
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`Thumbnail ${i + 1}`}
                    className="aspect-square w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Skin Care
              </p>
              <button
                type="button"
                aria-label="Share product"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <h1 className="mt-2 text-2xl font-bold leading-tight text-balance md:text-3xl text-gray-900">
              AuraFirm Fusion 4x1 Face Serum with Hyaluronic Acid, Niacinamide, Peptides &amp; Collagen
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Advanced lightweight daily serum that hydrates, brightens, and supports firmer-looking skin
              with Hyaluronic Acid, Niacinamide, Peptides, and Collagen. Fast-absorbing formula.
            </p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">4.8</span>
              <span className="text-sm text-gray-500">(21)</span>
            </div>

            {/* Size */}
            <div className="mt-4">
              <span className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900">
                100 ml
              </span>
            </div>

            {/* Price */}
            <div className="mt-5">
              <p className="text-3xl font-bold text-gray-900">₹1,199</p>
              <p className="mt-1 text-xs text-gray-500">(MRP. Inclusive of all taxes)</p>
            </div>

            {/* VIP price */}
            <button
              type="button"
              className="mt-3 flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              <span className="font-semibold">AuraFirm VIP price ₹999</span>
              <span className="text-white/50">·</span>
              <span className="inline-flex items-center gap-1 text-white/80">
                Join from ₹2,999 / 3 mo <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <p className="mt-2 text-xs text-gray-500">Net Qty. 100 ml</p>

            {/* Availability */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Available · Ships in 24 hours</span>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quantity
              </p>
              <div className="mt-2 inline-flex items-center rounded-md border border-gray-300">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium text-gray-900" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-gray-900 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Add to Cart
            </button>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-3 text-center"
                >
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="whitespace-pre-line text-[11px] leading-tight text-gray-600">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Helps with / Suitable for */}
        <div className="mt-10 grid grid-cols-1 gap-6 rounded-2xl bg-white border border-gray-200 p-6 md:grid-cols-2 md:p-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Helps With
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {helpsWith.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Suitable For
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {suitableFor.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hero Ingredients */}
        <section className="mt-6 rounded-2xl bg-white border border-gray-200 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Hero Ingredients
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-bold text-balance md:text-3xl text-gray-900">What&apos;s doing the work</h2>
            <p className="text-sm text-gray-500">
              These are the key actives. Complete ingredient list below.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {ingredients.map((ingredient) => (
              <article
                key={ingredient.title}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="overflow-hidden rounded-lg bg-white">
                  <img
                    src={ingredient.image || "/placeholder.svg"}
                    alt={ingredient.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{ingredient.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {ingredient.description}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {ingredient.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* How to use */}
        <section className="mt-6 rounded-2xl bg-white border border-gray-200 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            How To Use
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-bold text-balance md:text-3xl text-gray-900">Simple routine, clear steps</h2>
            <p className="text-sm text-gray-500">
              Use after cleansing, then moisturise. Apply sunscreen in the morning.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  {step.number}
                </span>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Product details accordion */}
        <section className="mt-6 flex flex-col gap-4">
          {detailSections.map((section, i) => {
            const isOpen = openDetail === i
            return (
              <div key={section.title} className="rounded-2xl bg-white border border-gray-200 p-2 md:p-3">
                <button
                  type="button"
                  onClick={() => setOpenDetail(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left md:px-5"
                >
                  <span>
                    <span className="block text-base font-bold text-gray-900 md:text-lg">
                      {section.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {section.subtitle}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
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

        {/* FAQ */}
        <section className="mt-6 rounded-2xl bg-white border border-gray-200 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Frequently Asked Questions
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-bold text-balance md:text-3xl text-gray-900">Quick answers before purchase</h2>
            <p className="text-sm text-gray-500">
              Answers for routine, sensitivity, and daily use.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={faq.question}
                  className="rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                  >
                    <span className="text-[13px] font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-3.5 text-[13px] leading-relaxed text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="mt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-balance md:text-3xl text-gray-900">Customer Reviews</h2>
            <p className="mt-1 text-sm text-gray-500">Real experiences from verified buyers</p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              {/* Summary */}
              <div className="flex flex-col items-start">
                <span className="text-5xl font-bold leading-none text-gray-900">4.8</span>
                <div className="mt-3 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Based on <span className="font-semibold text-gray-900">21</span> reviews
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Write a Review
                </button>
              </div>

              {/* Distribution */}
              <div className="flex flex-col gap-2.5">
                {ratingDistribution.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="flex w-8 items-center gap-1 text-sm text-gray-500">
                      {row.stars}
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-gray-500">{row.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* All Reviews */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">All Reviews (21)</h2>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Sort by:
              <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-900">
                Most Recent
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </span>
            </label>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {reviews.map((review, i) => (
              <article key={i} className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {review.initial}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{review.name}</span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Verified Purchase
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s < review.rating
                                ? "fill-amber-500 text-amber-500"
                                : "fill-gray-200 text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>

                <h3 className="mt-4 text-sm font-semibold text-gray-900">{review.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.body}</p>

                <div className="mt-4 border-t border-gray-200 pt-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Helpful
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              Show all 21 reviews
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </section>
      </div>

      {/* Trust bar */}
      <div className="bg-[#8B4513] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-4 px-4 py-5 md:px-6">
          {[
            { title: "for Indian Skin", sub: "Formulated for all tones" },
            { title: "Vegan - 100%", sub: "cruelty-free plant-powered" },
            { title: "Dermat Tested", sub: "Safe for sensitive skin" },
            { title: "for Indian Skin", sub: "Formulated for all tones" },
            { title: "Vegan - 100%", sub: "cruelty-free plant-powered" },
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
      <footer className="bg-white border-t border-gray-200 text-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2 lg:pr-8">
              <div className="flex items-center">
                <img
                  src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
                  alt="AURAFIRM logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-500">
                Where science meets self-care. We create high-quality, safe, and effective skincare and
                wellness solutions built on purity, innovation, and care.
              </p>
              <div className="mt-6 flex items-center gap-4">
                {[Camera, AtSign, Share2, Play, MessageCircle].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social link"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B4513] text-white transition-opacity hover:opacity-80"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                heading: "Company",
                links: ["About Us", "Blogs", "Contact Us", "Career"],
              },
              {
                heading: "Customer Services",
                links: ["My Account", "Track Your Order", "Return", "FAQ"],
              },
              {
                heading: "Our Information",
                links: ["Privacy", "User Terms & Condition", "Return Policy"],
              },
            ].map((col) => (
              <div key={col.heading}>
                <h3 className="text-base font-bold text-gray-900">{col.heading}</h3>
                <ul className="mt-5 flex flex-col gap-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-500 transition-colors hover:text-[#8B4513]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact info */}
            <div>
              <h3 className="text-base font-bold text-gray-900">Contact Info</h3>
              <ul className="mt-5 flex flex-col gap-4 text-sm text-gray-500">
                <li>
                  <a href="tel:+0123456789" className="transition-colors hover:text-[#8B4513]">
                    +0123-456-789
                  </a>
                </li>
                <li>
                  <a href="mailto:care@aurafirm.com" className="transition-colors hover:text-[#8B4513]">
                    care@aurafirm.com
                  </a>
                </li>
                <li className="leading-relaxed">
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
          <div className="mt-10 border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-gray-500">
                Copyright {"\u00A9"} 2025 <span className="font-medium text-[#8B4513]">Aurafirm.</span> All
                Rights Reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-700">
                <button type="button" className="inline-flex items-center gap-1.5">
                  English <ChevronDown className="h-4 w-4" />
                </button>
                <span className="text-gray-300">|</span>
                <button type="button" className="inline-flex items-center gap-1.5">
                  USD <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}