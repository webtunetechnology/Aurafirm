"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
  Heart,
  Camera,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  MessageCircle,
  Truck,
  CreditCard,
  Headphones,
  ChevronDown,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"

const heroFeatures = [
  { icon: FlaskConical, title: "Science-Backed", desc: "Research-driven formulations" },
  { icon: Leaf, title: "Pure & Vegan", desc: "Clean, cruelty-free ingredients" },
  { icon: ShieldCheck, title: "Dermat Tested", desc: "Safe for sensitive skin" },
  { icon: Sparkles, title: "Premium Quality", desc: "Globally trusted, high-grade" },
]

const glowHeroes = [
  {
    name: "Premium Face Serum",
    price: "1,299",
    img: "https://res.cloudinary.com/df01whs60/image/upload/v1782241556/front-profile_page-0001-removebg-preview_syyqyk.png",
  },
  {
    name: "Radiance Elixir",
    price: "1,199",
    img: "https://res.cloudinary.com/df01whs60/image/upload/v1782241602/ChatGPT_Image_Jun_19__2026__10_00_30_PM-removebg-preview_hsizp4.png",
  },
]

const testimonials = [
  {
    name: "Aanya Sharma",
    role: "Verified Customer",
    img: "/avatars/c1.png",
    title: "Science Meets Self-Care!",
    rating: "5.0",
    quote:
      "Aurafirm truly delivers on its promise of purity and innovation. My skin feels healthier and more radiant, and I love that every formulation is backed by real research and strict quality checks.",
  },
  {
    name: "Meera Patel",
    role: "Verified Customer",
    img: "/avatars/c2.png",
    title: "Premium Ingredients You Can Feel",
    rating: "5.0",
    quote:
      "You can tell Aurafirm uses globally trusted, high-grade ingredients. From skin health to overall wellness, every product reflects genuine care and a commitment to quality.",
  },
  {
    name: "Bessie Cooper",
    role: "Verified Customer",
    img: "/avatars/c3.png",
    title: "The Best Thing I've Used for My Skin!",
    rating: "5.0",
    quote:
      "More than just skincare, Aurafirm feels like a complete wellness routine. It has restored my skin's radiance and given me a new sense of confidence every day.",
  },
  {
    name: "Priya Nair",
    role: "Verified Customer",
    img: "/avatars/c4.png",
    title: "Holistic Care That Works",
    rating: "5.0",
    quote:
      "What I love most is that Aurafirm focuses on complete wellness — skin, body, and confidence together. It's become an essential part of my daily lifestyle.",
  },
  {
    name: "Riya Kapoor",
    role: "Verified Customer",
    img: "/avatars/c5.png",
    title: "A Lifestyle of Care & Confidence",
    rating: "5.0",
    quote:
      "Aurafirm doesn't just sell products — it creates a lifestyle of care and transformation. Pure, safe, and effective. I trust them completely on my wellness journey.",
  },
]

const faqs = [
  {
    q: "What types of products do you offer?",
    a: "Aurafirm offers premium skincare and wellness products — from face serums and moisturizers to solutions for overall vitality. Our range continues to expand across skincare, health, and nutrition to meet your every need.",
  },
  {
    q: "Are your products safe and dermatologically tested?",
    a: "Yes. Every Aurafirm product is developed with modern research, high-grade ingredients, and strict quality checks to ensure it is pure, safe, and effective — even for sensitive skin.",
  },
  {
    q: "What makes Aurafirm different from other brands?",
    a: "We combine premium, globally trusted ingredients with science-backed formulations and a holistic approach to care — focusing not just on beauty, but on complete wellness of skin, body, and confidence.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards, UPI, net banking, and popular digital wallets, with multiple secure payment options at checkout.",
  },
  {
    q: "Do you offer customer support?",
    a: "Absolutely. Our passionate team is here to answer all your questions and ensure a quick response, supporting you online every day on your wellness journey.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a tracking link via email and SMS. You can also track your order anytime from the 'Track Your Order' section in your account.",
  },
]

const features = [
  { icon: Truck, title: "Free Shipping", sub: "Free shipping for order above $50" },
  { icon: CreditCard, title: "Flexible Payment", sub: "Multiple secure payment options" },
  { icon: Headphones, title: "24\u00d77 Support", sub: "We support online all days." },
]

const trustBadges = [
  { title: "for Indian Skin", sub: "Formulated for all tones" },
  { title: "Vegan - 100%", sub: "cruelty-free plant-powered" },
  { title: "Dermat Tested", sub: "Safe for sensitive skin" },
  { title: "for Indian Skin", sub: "Formulated for all tones" },
  { title: "Vegan - 100%", sub: "cruelty-free plant-powered" },
]

const heroProducts = [
  {
    img: "https://res.cloudinary.com/df01whs60/image/upload/v1782241556/front-profile_page-0001-removebg-preview_syyqyk.png",
    label1: "Natural\nIngredients",
    label2: "Hydrating\nFace Serum",
    name: "Premium Face Serum",
  },
  {
    img: "https://res.cloudinary.com/df01whs60/image/upload/v1782241602/ChatGPT_Image_Jun_19__2026__10_00_30_PM-removebg-preview_hsizp4.png",
    label1: "Glow\nBoosting",
    label2: "Radiance\nSerum",
    name: "Radiance Elixir",
  },
]

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About Us",    href: "/about" },
      { label: "Contact Us",  href: "/contact" },
    ],
  },
  {
    title: "Customer Services",
    links: [
      { label: "My Account",        href: "/account/orders" },
      { label: "Track Your Order",  href: "/account/orders" },
      { label: "Return",            href: "/contact" },
      { label: "FAQ",               href: "/contact" },
    ],
  },
  {
    title: "Our Information",
    links: [
      { label: "Privacy",                  href: "/privacy" },
      { label: "User Terms & Condition",   href: "/terms" },
      { label: "Return Policy",            href: "/return-policy" },
    ],
  },
]

const socials = [
  { href: "https://www.instagram.com/aurafirm_", label: "Instagram", Icon: Camera },
]

interface DBProduct {
  id: string
  name: string
  subtitle?: string | null
  price: number
  original_price?: number | null
  image_url?: string | null
  tags?: string[] | null
  is_active: boolean
  stock: number
  slug?: string | null
}

export default function LumoraLanding({ products = [] }: { products: DBProduct[] }) {
  const { addItem, itemCount } = useCart()
  const sliderRef = useRef<HTMLDivElement>(null)

  // Merge DB products with fallback static data
  const displayProducts = products.length > 0
    ? products.filter((p) => p.is_active)
    : glowHeroes.map((p, i) => ({
        id: `static-${i}`,
        name: p.name,
        subtitle: "Premium Skincare",
        price: parseInt(p.price.replace(",", "")),
        image_url: p.img,
        tags: ["Vegan", "Dermatest Tested"],
        is_active: true,
        stock: 100,
        slug: null,
      }))

  const scrollSlider = (direction: "left" | "right") => {
    const el = sliderRef.current
    if (!el) return
    const amount = 400
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  const [active, setActive] = useState(2)
  const total = testimonials.length
  const prevTestimonial = () => setActive((i) => (i - 1 + total) % total)
  const nextTestimonial = () => setActive((i) => (i + 1) % total)
  const current = testimonials[active]

  const [openFaq, setOpenFaq] = useState(1)

  const [heroIndex, setHeroIndex] = useState(0)
  const heroTotal = heroProducts.length
  const prevHero = () => setHeroIndex((i) => (i - 1 + heroTotal) % heroTotal)
  const nextHero = () => setHeroIndex((i) => (i + 1) % heroTotal)
  const heroProduct = heroProducts[heroIndex]

  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % heroTotal), 4000)
    return () => clearInterval(id)
  }, [heroTotal])

  return (
    <main className="min-h-screen w-full bg-[#faf5f3] font-serif text-neutral-800">
      <Navbar />

      {/* Hero wrapper */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf3ec] via-[#faf5f3] to-[#f9e7db]">
        {/* Decorative faint circles */}
        <div className="pointer-events-none absolute -left-28 top-28 h-72 w-72 rounded-full border-[34px] border-white/50" />
        <div className="pointer-events-none absolute -left-12 bottom-8 h-40 w-40 rounded-full border-[22px] border-white/40" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full border-[30px] border-[#f0d8c8]/50" />
        {/* Soft peach cloud glow behind bottle */}
        <div className="pointer-events-none absolute right-[8%] top-1/4 h-[420px] w-[480px] rounded-full bg-[#f6d9c9]/50 blur-3xl" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-20 pt-8 lg:grid-cols-2">
          {/* Left text */}
          <div>
            <h1 className="font-sans text-6xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl xl:text-8xl">
              <span className="block">
                <span className="text-neutral-800">Your </span>
                <span className="text-[#e3a985]">Skin</span>
              </span>
              <span className="block">
              <span className="text-neutral-800">Your </span>
              <span className="border-b-4 border-[#c9744e] text-[#e3a985]">Glow</span>
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-700">
              Where science meets self-care. Premium, science-backed formulations
              <br />
              for radiant skin and complete wellness — every single day.
            </p>

            <Link
              href="#shop-section"
              className="mt-8 inline-block rounded-md bg-[#c9744e] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#b86244]"
            >
              Explore Our Products
            </Link>
          </div>

          {/* Right product visual slider */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Prev arrow */}
            <button
              onClick={prevHero}
              aria-label="Previous product"
              className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#c9744e] shadow-md backdrop-blur transition-colors hover:bg-[#c9744e] hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="relative flex h-[380px] w-[380px] items-center justify-center rounded-full border border-[#e3a985]/60">
              {/* Product image */}
              <Image
                key={heroProduct.img}
                src={heroProduct.img || "/placeholder.svg"}
                alt={heroProduct.name}
                width={300}
                height={300}
                priority
                className="h-[320px] w-auto animate-in fade-in zoom-in-95 object-contain mix-blend-multiply duration-500"
              />

              {/* Labels */}
              <span className="absolute -right-8 top-12 max-w-[120px] whitespace-pre-line text-lg leading-tight text-neutral-700">
                {heroProduct.label1}
              </span>
              <span className="absolute -left-6 bottom-20 max-w-[120px] whitespace-pre-line text-right text-lg leading-tight text-neutral-700">
                {heroProduct.label2}
              </span>
            </div>

            {/* Next arrow */}
            <button
              onClick={nextHero}
              aria-label="Next product"
              className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#c9744e] shadow-md backdrop-blur transition-colors hover:bg-[#c9744e] hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="mt-6 flex items-center gap-2">
              {heroProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Go to product ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === heroIndex ? "w-6 bg-[#c9744e]" : "w-2 bg-[#e3a985]/60 hover:bg-[#e3a985]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature boxes */}
      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heroFeatures.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-4 rounded-2xl border border-[#f0d8c8] bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fbede5] text-[#c9744e]">
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-neutral-800">{f.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-neutral-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop Our Glow Heroes */}
      <section id="shop-section" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-700 sm:text-4xl">
Shop <span className="border-b-4 border-[#e3a985] text-[#c9744e]">Our Wellness</span> Heroes
        </h2>

        <div className="relative mt-10">
          {/* Left arrow */}
          <button
            onClick={() => scrollSlider("left")}
            aria-label="Scroll left"
            className="absolute -left-4 top-[88px] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c9744e] shadow-md transition-colors hover:bg-[#c9744e] hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Slider track */}
          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {displayProducts.map((p) => (
              <div key={p.id} className="flex w-[180px] shrink-0 flex-col">
                <Link
                  href={p.slug ? `/product/${p.slug}` : "#"}
                  className="group block"
                >
                  <div className="flex h-[200px] items-center justify-center rounded-xl bg-[#fbede5] p-4 transition-transform duration-200 group-hover:scale-[1.02]">
                    <Image
                      src={p.image_url || "/placeholder.svg"}
                      alt={p.name}
                      width={160}
                      height={160}
                      className="h-full w-auto object-contain mix-blend-multiply"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-[#c9744e]">{p.name}</p>
                  <p className="text-sm text-neutral-500">{`\u20B9${p.price.toLocaleString("en-IN")}`}</p>
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() =>
                      addItem({
                        id: p.id,
                        name: p.name,
                        subtitle: p.subtitle ?? "Premium Skincare",
                        price: p.price,
                        image: p.image_url ?? "",
                        tags: p.tags ?? ["Vegan"],
                      })
                    }
                    className="rounded-full bg-[#d4855f] px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#c9744e]"
                  >
                    Add to Cart
                  </button>
                  <button
                    aria-label="Add to wishlist"
                    className="text-[#e3a985] transition-colors hover:text-[#c9744e]"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollSlider("right")}
            aria-label="Scroll right"
            className="absolute -right-4 top-[88px] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c9744e] shadow-md transition-colors hover:bg-[#c9744e] hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Promo banners */}
      <section className="mx-auto max-w-7xl px-6 pb-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              img: "https://res.cloudinary.com/df01whs60/image/upload/v1782242015/ChatGPT_Image_Jun_24_2026_12_43_01_AM_tjs32q.png",
              alt: "Special skincare offer",
            },
            {
              img: "https://res.cloudinary.com/df01whs60/image/upload/v1782242144/ChatGPT_Image_Jun_24_2026_12_45_26_AM_kmjy43.png",
              alt: "Special serum offer",
            },
          ].map((banner, i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <Image
                src={banner.img || "/placeholder.svg"}
                alt={banner.alt}
                width={800}
                height={450}
                className="h-auto w-full object-contain"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Beauty That Loves Your Skin Back */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#fbe4d6] via-[#fceee5] to-[#f6d9c9] px-6 py-14 text-center">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-800 sm:text-5xl text-balance">
            Where Beauty Meets <span className="text-[#d4855f]">Wellness</span>
          </h2>
          <p className="mt-4 text-sm italic text-neutral-600">
            {"We don\u2019t just sell products \u2014 we create a lifestyle of care, confidence, and transformation."}
          </p>
          <Link
            href="#shop-section"
            className="mt-6 inline-block rounded-md bg-[#c9744e] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#b86244]"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Campaign Banner */}
      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: "16 / 9" }}>
          <Image
            src="https://res.cloudinary.com/dgydmwvvm/image/upload/v1783020971/ChatGPT_Image_Jul_2_2026_11_37_47_PM_1_zobiwh.png"
            alt="AURAFIRM Campaign Banner"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="text-sm font-semibold text-neutral-700">Testimonials</p>
        <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
          <span className="block text-neutral-800">Testimonials from</span>
          <span className="block text-[#c79a4b]">Our Loyal Customers</span>
        </h2>

        {/* Avatar row */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {testimonials.map((t, i) => {
            const isActive = i === active
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`View testimonial from ${t.name}`}
                className={`relative shrink-0 overflow-hidden rounded-full ring-offset-2 transition-all duration-300 ${
                  isActive
                    ? "h-24 w-24 ring-2 ring-[#c79a4b]"
                    : "h-16 w-16 opacity-90 hover:opacity-100"
                }`}
              >
                <Image src={t.img || "/placeholder.svg"} alt={t.name} fill className="object-cover" />
              </button>
            )
          })}
        </div>

        {/* Active testimonial with side arrows */}
        <div className="relative mt-10">
          <button
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#c79a4b] text-white shadow-md transition-colors hover:bg-[#b3893d]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mx-auto max-w-2xl px-16">
            <h3 className="font-sans text-xl font-bold text-neutral-800 sm:text-2xl text-balance">{current.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500 text-pretty">{current.quote}</p>

            <div className="mt-6 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-5 w-5 fill-[#f5b301] text-[#f5b301]" />
              ))}
              <span className="ml-2 text-sm font-semibold text-neutral-600">{current.rating}</span>
            </div>

            <p className="mt-6 font-sans font-bold text-neutral-800">{current.name}</p>
            <p className="text-xs text-neutral-500">{current.role}</p>
          </div>

          <button
            onClick={nextTestimonial}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#8a4a32] text-white shadow-md transition-colors hover:bg-[#6f3a26]"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* FAQs */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <p className="text-center text-xs font-semibold tracking-wide text-neutral-400">FAQs</p>
        <h2 className="text-center font-sans text-3xl font-extrabold tracking-tight text-neutral-800 sm:text-4xl">
          Question? <span className="text-[#c79a4b]">Look</span> here.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Accordion */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            {faqs.map((item, i) => {
              const isOpen = i === openFaq
              return (
                <div
                  key={i}
                  className={`rounded-xl transition-colors ${
                    isOpen ? "bg-[#8a4a32] text-white" : "border-b border-neutral-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-semibold ${isOpen ? "text-white" : "text-neutral-800"}`}>
                      {item.q}
                    </span>
                    {isOpen ? (
                      <Minus className="h-4 w-4 shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-neutral-500" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-5 text-xs leading-relaxed text-white/70">{item.a}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Contact card */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#8a4a32] px-6 py-10 text-center text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-sans text-lg font-bold">You have different questions?</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/70">
              Our team will answer all your questions. We ensure a quick response.
            </p>
            <Link href="/contact" className="mt-6 inline-block rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#8a4a32] transition-colors hover:bg-white/90">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-14 grid grid-cols-1 gap-6 border-t border-neutral-200 pt-8 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbede5] text-[#c9744e]">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-neutral-800">{f.title}</p>
                <p className="text-xs text-neutral-500">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom trust banner */}
      <section className="mt-12 bg-[#8a4a32] py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-6">
          {trustBadges.map((b, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40">
                <Heart className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold">{b.title}</p>
                <p className="text-[10px] opacity-80">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#faf5f3] px-6 pb-8 pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link href="/">
                <Image
                  src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
                  alt="AURAFIRM logo"
                  width={140}
                  height={50}
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-neutral-500">
                Where science meets self-care. We create high-quality, safe, and effective skincare and wellness
                solutions built on purity, innovation, and care.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
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
                <li><a href="tel:+918750089105" className="transition-colors hover:text-neutral-800">+91 87500 89105</a></li>
                <li><a href="mailto:aurafirm0@gmail.com" className="transition-colors hover:text-neutral-800">aurafirm0@gmail.com</a></li>
                <li className="leading-relaxed">
                  Plot No.2, Khasra No.51/1,<br />
                  Jai Vihar, Najafgarh,<br />
                  New Delhi – 110043
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row">
            <p className="text-sm text-neutral-500">
              Copyright {"\u00A9"} {new Date().getFullYear()} <span className="text-[#c79a4b]">AURAFIRM.</span> All Rights Reserved.
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
    </main>
  )
}
