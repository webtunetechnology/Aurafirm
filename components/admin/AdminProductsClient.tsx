"use client"

import { useState, useTransition, useCallback } from "react"
import Image from "next/image"
import {
  Plus, Pencil, Trash2, Search, Package, X, ChevronRight,
  ImageIcon, Info, Leaf, ListOrdered, HelpCircle, Settings2,
  ArrowLeft, Check, AlertCircle,
} from "lucide-react"
import { adminUpsertProduct, adminDeleteProduct, adminGetProducts } from "@/lib/actions"
import ImageUpload from "@/components/admin/ImageUpload"

type Product = Awaited<ReturnType<typeof adminGetProducts>>[number]

const CATEGORIES = [
  "serum", "cleanser", "moisturizer", "sunscreen",
  "supplements", "essence", "mask", "toner", "other",
]

type HeroIngredient = { image: string; title: string; description: string; benefits: string }
type HowToStep = { number: string; title: string; description: string }
type Faq = { question: string; answer: string }

interface RichForm {
  // Basic
  name: string
  subtitle: string
  description: string
  category: string
  tags: string
  is_active: boolean
  slug: string
  // Pricing & Stock
  price: number
  original_price: number
  vip_price: number
  stock: number
  size_label: string
  rating: number
  review_count: number
  // Media
  image_url: string
  gallery_images: string[]
  // Details
  helps_with: string      // newline-separated
  suitable_for: string    // newline-separated
  hero_ingredients: HeroIngredient[]
  // How to Use
  how_to_use_steps: HowToStep[]
  // Ingredients & Info
  full_ingredients_text: string
  manufacturing_info: string
  // FAQs
  faqs: Faq[]
}

const emptyIngredient = (): HeroIngredient => ({ image: "", title: "", description: "", benefits: "" })
const emptyStep = (n: number): HowToStep => ({ number: String(n), title: "", description: "" })
const emptyFaq = (): Faq => ({ question: "", answer: "" })

function buildEmptyForm(): RichForm {
  return {
    name: "", subtitle: "", description: "", category: "serum", tags: "", is_active: true, slug: "",
    price: 0, original_price: 0, vip_price: 0, stock: 100, size_label: "", rating: 4.5, review_count: 0,
    image_url: "", gallery_images: [],
    helps_with: "", suitable_for: "",
    hero_ingredients: [emptyIngredient(), emptyIngredient(), emptyIngredient()],
    how_to_use_steps: [emptyStep(1), emptyStep(2), emptyStep(3)],
    full_ingredients_text: "", manufacturing_info: "",
    faqs: [emptyFaq(), emptyFaq(), emptyFaq()],
  }
}

function productToForm(p: Product): RichForm {
  const ing = (p.hero_ingredients as HeroIngredient[] | null) ?? []
  const steps = (p.how_to_use_steps as HowToStep[] | null) ?? []
  const faqs = (p.faqs as Faq[] | null) ?? []
  return {
    name: p.name,
    subtitle: p.subtitle ?? "",
    description: p.description ?? "",
    category: p.category,
    tags: (p.tags ?? []).join(", "),
    is_active: p.is_active,
    slug: (p as { slug?: string }).slug ?? "",
    price: p.price,
    original_price: p.original_price ?? 0,
    vip_price: (p as { vip_price?: number }).vip_price ?? 0,
    stock: p.stock,
    size_label: (p as { size_label?: string }).size_label ?? "",
    rating: Number((p as { rating?: number }).rating ?? 4.5),
    review_count: (p as { review_count?: number }).review_count ?? 0,
    image_url: p.image_url ?? "",
    gallery_images: (p as { gallery_images?: string[] }).gallery_images ?? [],
    helps_with: ((p as { helps_with?: string[] }).helps_with ?? []).join("\n"),
    suitable_for: ((p as { suitable_for?: string[] }).suitable_for ?? []).join("\n"),
    hero_ingredients: ing.length > 0
      ? ing.map((i) => ({ ...i, benefits: Array.isArray(i.benefits) ? (i.benefits as string[]).join(", ") : String(i.benefits ?? "") }))
      : [emptyIngredient(), emptyIngredient(), emptyIngredient()],
    how_to_use_steps: steps.length > 0 ? steps : [emptyStep(1), emptyStep(2), emptyStep(3)],
    full_ingredients_text: (p as { full_ingredients_text?: string }).full_ingredients_text ?? "",
    manufacturing_info: (p as { manufacturing_info?: string }).manufacturing_info ?? "",
    faqs: faqs.length > 0 ? faqs : [emptyFaq(), emptyFaq(), emptyFaq()],
  }
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean)

const TABS = [
  { key: "basic",       label: "Basic Info",       icon: Info },
  { key: "pricing",     label: "Pricing & Stock",  icon: Settings2 },
  { key: "media",       label: "Media",            icon: ImageIcon },
  { key: "details",     label: "Benefits",         icon: Leaf },
  { key: "howto",       label: "How to Use",       icon: ListOrdered },
  { key: "ingredients", label: "Ingredients",      icon: Leaf },
  { key: "faqs",        label: "FAQs",             icon: HelpCircle },
] as const

type TabKey = typeof TABS[number]["key"]

const inputCls = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#c9744e] transition-colors placeholder:text-neutral-300"
const labelCls = "mb-1 block text-xs font-semibold text-neutral-500 uppercase tracking-wide"
const textareaCls = `${inputCls} resize-none leading-relaxed`

function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">{title}</p>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export default function AdminProductsClient({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("basic")
  const [form, setForm] = useState<RichForm>(buildEmptyForm())
  const [isPending, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const set = useCallback(<K extends keyof RichForm>(key: K, value: RichForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  function openNew() {
    setEditing(null)
    setForm(buildEmptyForm())
    setActiveTab("basic")
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm(productToForm(p))
    setActiveTab("basic")
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this product?")) return
    startTransition(async () => {
      await adminDeleteProduct(id)
      const fresh = await adminGetProducts()
      setProducts(fresh)
    })
  }

  function handleSave() {
    startTransition(async () => {
      await adminUpsertProduct({
        ...(editing ? { id: editing.id } : {}),
        name: form.name,
        subtitle: form.subtitle,
        description: form.description,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_active: form.is_active,
        slug: form.slug || slugify(form.name),
        price: form.price,
        original_price: form.original_price || undefined,
        vip_price: form.vip_price || undefined,
        stock: form.stock,
        size_label: form.size_label,
        rating: form.rating,
        review_count: form.review_count,
        image_url: form.image_url,
        gallery_images: form.gallery_images,
        helps_with: lines(form.helps_with),
        suitable_for: lines(form.suitable_for),
        hero_ingredients: form.hero_ingredients
          .filter((i) => i.title)
          .map((i) => ({
            ...i,
            benefits: i.benefits.split(",").map((b) => b.trim()).filter(Boolean),
          })),
        how_to_use_steps: form.how_to_use_steps.filter((s) => s.title),
        full_ingredients_text: form.full_ingredients_text,
        manufacturing_info: form.manufacturing_info,
        faqs: form.faqs.filter((f) => f.question),
      })
      const fresh = await adminGetProducts()
      setProducts(fresh)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        setShowForm(false)
      }, 900)
    })
  }

  function updateIngredient(idx: number, field: keyof HeroIngredient, value: string) {
    const updated = form.hero_ingredients.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing)
    set("hero_ingredients", updated)
  }

  function updateStep(idx: number, field: keyof HowToStep, value: string) {
    const updated = form.how_to_use_steps.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    set("how_to_use_steps", updated)
  }

  function updateFaq(idx: number, field: keyof Faq, value: string) {
    const updated = form.faqs.map((f, i) => i === idx ? { ...f, [field]: value } : f)
    set("faqs", updated)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Products</h1>
          <p className="mt-0.5 text-xs text-neutral-500">{products.length} products in catalog</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-xl bg-[#a0522d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8b4513]"
        >
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category..."
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-3 text-xs outline-none focus:border-[#c9744e]"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">No products found.</td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#fdf0e8]">
                        {p.image_url
                          ? <Image src={p.image_url} alt={p.name} width={40} height={40} className="h-full w-full object-cover mix-blend-multiply" />
                          : <div className="flex h-full w-full items-center justify-center"><Package className="h-4 w-4 text-[#c9744e]/40" /></div>
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800">{p.name}</p>
                        <p className="text-[10px] text-neutral-400">{p.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-neutral-800">₹{p.price.toLocaleString("en-IN")}</p>
                    {p.original_price ? <p className="text-[10px] text-neutral-400 line-through">₹{p.original_price.toLocaleString("en-IN")}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock < 20 ? "text-red-500" : p.stock < 50 ? "text-amber-500" : "text-neutral-800"}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#fdf0e8] hover:text-[#c9744e]"
                        title="Edit product"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                        title="Delete product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full-screen centered modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />

          {/* Modal */}
          <div className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* ── Modal Header ── */}
            <div className="shrink-0 border-b border-neutral-100">
              {/* Accent stripe */}
              <div className="h-1 w-full bg-[#c9744e]" />
              <div className="flex items-center justify-between px-7 py-4">
                <div className="flex items-center gap-4">
                  {/* Product thumbnail if editing */}
                  {editing?.image_url ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#fdf0e8]">
                      <img src={editing.image_url} alt={editing.name} className="h-full w-full object-contain mix-blend-multiply" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fdf0e8]">
                      <Package className="h-5 w-5 text-[#c9744e]/60" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-extrabold text-neutral-900">
                      {editing ? "Edit Product" : "Add New Product"}
                    </h2>
                    <p className="text-xs text-neutral-400">
                      {editing ? editing.name : "Fill in the details below to add a new product to your catalog."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isPending || !form.name || !form.price}
                    className="flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-[#a0522d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#8b4513] disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <><Check className="h-4 w-4" /> Saved!</>
                    ) : (
                      "Save Product"
                    )}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Body: sidebar tabs + scrollable content ── */}
            <div className="flex min-h-0 flex-1">

              {/* Vertical tab sidebar */}
              <aside className="flex w-48 shrink-0 flex-col gap-1 border-r border-neutral-100 bg-neutral-50/70 px-3 py-4">
                {TABS.map(({ key, label, icon: Icon }, idx) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                      activeTab === key
                        ? "bg-[#fdf0e8] text-[#a0522d]"
                        : "text-neutral-500 hover:bg-white hover:text-neutral-800"
                    }`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                      activeTab === key ? "bg-[#c9744e] text-white" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {idx + 1}
                    </span>
                    {label}
                  </button>
                ))}

                {/* Progress hint */}
                <div className="mt-auto pt-4">
                  <div className="rounded-xl bg-white p-3 text-[11px] text-neutral-400">
                    <p className="mb-1.5 font-semibold text-neutral-600">
                      {TABS.findIndex((t) => t.key === activeTab) + 1} / {TABS.length} sections
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-[#c9744e] transition-all"
                        style={{ width: `${((TABS.findIndex((t) => t.key === activeTab) + 1) / TABS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </aside>

              {/* Scrollable tab content */}
              <div className="flex-1 overflow-y-auto px-7 py-6">

                {/* ── BASIC INFO ── */}
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Basic Information</h3>
                      <p className="mt-0.5 text-xs text-neutral-400">Core identity of the product — name, category, and description.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2">
                        <label className={labelCls}>Product Name *</label>
                        <input
                          value={form.name}
                          onChange={(e) => {
                            set("name", e.target.value)
                            if (!editing) set("slug", slugify(e.target.value))
                          }}
                          className={`${inputCls} text-base`}
                          placeholder="AuraFirm Fusion 4x1 Face Serum"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Subtitle</label>
                        <input
                          value={form.subtitle}
                          onChange={(e) => set("subtitle", e.target.value)}
                          className={inputCls}
                          placeholder="With Hyaluronic Acid, Niacinamide & Collagen"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>URL Slug</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">/product/</span>
                          <input
                            value={form.slug}
                            onChange={(e) => set("slug", slugify(e.target.value))}
                            className={`${inputCls} pl-[68px]`}
                            placeholder="fusion-4x1-face-serum"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Description</label>
                        <textarea
                          value={form.description}
                          onChange={(e) => set("description", e.target.value)}
                          rows={4}
                          className={textareaCls}
                          placeholder="Short product description shown in listings and meta tags."
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Tags (comma separated)</label>
                        <input
                          value={form.tags}
                          onChange={(e) => set("tags", e.target.value)}
                          className={inputCls}
                          placeholder="Vegan, Paraben Free, Dermatest Tested"
                        />
                        {form.tags && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                              <span key={tag} className="rounded-full bg-[#fdf0e8] px-2.5 py-0.5 text-[11px] font-medium text-[#a0522d]">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Visibility</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">
                            {form.is_active ? "Active — visible in store" : "Inactive — hidden from store"}
                          </p>
                          <p className="text-xs text-neutral-400">Toggle to show or hide this product on the storefront.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => set("is_active", !form.is_active)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? "bg-[#c9744e]" : "bg-neutral-200"}`}
                        >
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PRICING & STOCK ── */}
                {activeTab === "pricing" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Pricing & Stock</h3>
                      <p className="mt-0.5 text-xs text-neutral-400">Set the selling price, original MRP, VIP price, and inventory quantity.</p>
                    </div>

                    {/* Price preview card */}
                    {form.price > 0 && (
                      <div className="flex items-center gap-6 rounded-xl border border-[#fdf0e8] bg-[#fdf8f5] px-5 py-4">
                        <div className="text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Selling Price</p>
                          <p className="text-2xl font-extrabold text-neutral-900">₹{form.price.toLocaleString("en-IN")}</p>
                        </div>
                        {form.original_price > 0 && (
                          <>
                            <div className="text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">MRP</p>
                              <p className="text-lg font-semibold text-neutral-400 line-through">₹{form.original_price.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="rounded-lg bg-green-100 px-3 py-1.5 text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-green-700">Saving</p>
                              <p className="text-base font-bold text-green-700">
                                {Math.round(((form.original_price - form.price) / form.original_price) * 100)}% off
                              </p>
                            </div>
                          </>
                        )}
                        {form.vip_price > 0 && (
                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">VIP Price</p>
                            <p className="text-lg font-bold text-[#a0522d]">₹{form.vip_price.toLocaleString("en-IN")}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Selling Price (₹) *</label>
                        <input type="number" value={form.price || ""} onChange={(e) => set("price", +e.target.value)} className={inputCls} placeholder="1199" />
                      </div>
                      <div>
                        <label className={labelCls}>Original / MRP (₹)</label>
                        <input type="number" value={form.original_price || ""} onChange={(e) => set("original_price", +e.target.value)} className={inputCls} placeholder="1499" />
                      </div>
                      <div>
                        <label className={labelCls}>VIP / Member Price (₹)</label>
                        <input type="number" value={form.vip_price || ""} onChange={(e) => set("vip_price", +e.target.value)} className={inputCls} placeholder="999" />
                      </div>
                      <div>
                        <label className={labelCls}>Size Label</label>
                        <input value={form.size_label} onChange={(e) => set("size_label", e.target.value)} className={inputCls} placeholder="100 ml" />
                      </div>
                      <div>
                        <label className={labelCls}>Stock Quantity</label>
                        <input type="number" value={form.stock || ""} onChange={(e) => set("stock", +e.target.value)} className={inputCls} placeholder="100" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Rating (/ 5)</label>
                          <input type="number" step="0.1" min="0" max="5" value={form.rating || ""} onChange={(e) => set("rating", +e.target.value)} className={inputCls} placeholder="4.8" />
                        </div>
                        <div>
                          <label className={labelCls}>Reviews</label>
                          <input type="number" value={form.review_count || ""} onChange={(e) => set("review_count", +e.target.value)} className={inputCls} placeholder="21" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MEDIA ── */}
                {activeTab === "media" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Product Images</h3>
                      <p className="mt-0.5 text-xs text-neutral-400">Upload images directly to Supabase Storage. Files are stored in the <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">product-images</code> bucket.</p>
                    </div>

                    {/* Main image */}
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Main Image</p>
                      <ImageUpload
                        value={form.image_url}
                        onChange={(url) => set("image_url", url)}
                        folder={`products/${form.slug || "new"}`}
                        alt="Main product image"
                      />
                    </div>

                    {/* Gallery */}
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          Gallery Images <span className="ml-1 font-normal text-neutral-400">({form.gallery_images.length} / 8)</span>
                        </p>
                        {form.gallery_images.length < 8 && (
                          <ImageUpload
                            value=""
                            onChange={(url) => set("gallery_images", [...form.gallery_images, url])}
                            folder={`products/${form.slug || "new"}/gallery`}
                            compact
                            alt="Add gallery image"
                          />
                        )}
                      </div>

                      {form.gallery_images.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-200 py-8 text-center">
                          <ImageIcon className="h-8 w-8 text-neutral-200" />
                          <p className="text-sm text-neutral-400">No gallery images yet.</p>
                          <p className="text-xs text-neutral-300">Click the upload box above to add images.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-3">
                          {form.gallery_images.map((url, i) => (
                            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white">
                              <img src={url} alt={`gallery-${i + 1}`} className="h-full w-full object-contain mix-blend-multiply" />
                              {/* Hover overlay */}
                              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{i + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => set("gallery_images", form.gallery_images.filter((_, idx) => idx !== i))}
                                  className="rounded-full bg-white/90 p-1 text-red-500 hover:bg-white"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {/* Add more slot */}
                          {form.gallery_images.length < 8 && (
                            <ImageUpload
                              value=""
                              onChange={(url) => set("gallery_images", [...form.gallery_images, url])}
                              folder={`products/${form.slug || "new"}/gallery`}
                              compact
                              alt="Add gallery image"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── BENEFITS ── */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Benefits & Ingredients</h3>
                      <p className="mt-0.5 text-xs text-neutral-400">What the product helps with, who it suits, and the hero active ingredients.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Helps With — one per line</label>
                        <textarea
                          value={form.helps_with}
                          onChange={(e) => set("helps_with", e.target.value)}
                          rows={5}
                          className={textareaCls}
                          placeholder={"Deep hydration and moisture retention\nBrightening and evening skin tone\nImproving texture, firmness and elasticity"}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Suitable For — one per line</label>
                        <textarea
                          value={form.suitable_for}
                          onChange={(e) => set("suitable_for", e.target.value)}
                          rows={5}
                          className={textareaCls}
                          placeholder={"All skin types, including sensitive skin\nDull, dry, or uneven-looking skin\nDaily morning and evening routines"}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className={labelCls}>Hero Ingredients (up to 3)</p>
                        {form.hero_ingredients.length < 3 && (
                          <button
                            type="button"
                            onClick={() => set("hero_ingredients", [...form.hero_ingredients, emptyIngredient()])}
                            className="flex items-center gap-1 rounded-lg bg-[#fdf0e8] px-2.5 py-1 text-xs font-semibold text-[#a0522d] hover:bg-[#fbede0]"
                          >
                            <Plus className="h-3 w-3" /> Add Ingredient
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {form.hero_ingredients.map((ing, i) => (
                          <div key={i} className="relative rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fdf0e8] text-[11px] font-bold text-[#a0522d]">{i + 1}</span>
                              {form.hero_ingredients.length > 1 && (
                                <button type="button" onClick={() => set("hero_ingredients", form.hero_ingredients.filter((_, idx) => idx !== i))} className="text-neutral-200 hover:text-red-400">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            {/* Ingredient image upload */}
                            <div className="mb-3">
                              <label className={`${labelCls} mb-2`}>Image</label>
                              <div className="flex items-center gap-2">
                                <ImageUpload
                                  value={ing.image}
                                  onChange={(url) => updateIngredient(i, "image", url)}
                                  folder={`products/${form.slug || "new"}/ingredients`}
                                  compact
                                  alt={ing.title || `ingredient-${i + 1}`}
                                />
                                {ing.image && (
                                  <p className="flex-1 truncate text-[10px] text-neutral-400">{ing.image.split("/").pop()}</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className={labelCls}>Name</label>
                                <input value={ing.title} onChange={(e) => updateIngredient(i, "title", e.target.value)} className={inputCls} placeholder="Hyaluronic Acid" />
                              </div>
                              <div>
                                <label className={labelCls}>Benefits (comma separated)</label>
                                <input value={ing.benefits} onChange={(e) => updateIngredient(i, "benefits", e.target.value)} className={inputCls} placeholder="Hydrates, Plumps" />
                              </div>
                              <div>
                                <label className={labelCls}>Description</label>
                                <textarea value={ing.description} onChange={(e) => updateIngredient(i, "description", e.target.value)} rows={3} className={textareaCls} placeholder="What it does..." />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── HOW TO USE ── */}
                {activeTab === "howto" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">How to Use</h3>
                      <p className="mt-0.5 text-xs text-neutral-400">Step-by-step usage instructions shown on the product page.</p>
                    </div>

                    <div className="space-y-3">
                      {form.how_to_use_steps.map((step, i) => (
                        <div key={i} className="flex gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c9744e] text-sm font-bold text-white">{step.number}</span>
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className={labelCls}>Step Title</label>
                              <input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} className={inputCls} placeholder="Cleanse & Pat Dry" />
                            </div>
                            <div>
                              <label className={labelCls}>Instructions</label>
                              <textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} rows={3} className={textareaCls} placeholder="Detailed instruction for this step..." />
                            </div>
                          </div>
                          {form.how_to_use_steps.length > 1 && (
                            <button type="button" onClick={() => set("how_to_use_steps", form.how_to_use_steps.filter((_, idx) => idx !== i))} className="self-start text-neutral-200 hover:text-red-400">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => set("how_to_use_steps", [...form.how_to_use_steps, emptyStep(form.how_to_use_steps.length + 1)])}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-3 text-sm font-semibold text-neutral-400 hover:border-[#c9744e] hover:text-[#c9744e]"
                    >
                      <Plus className="h-4 w-4" /> Add Step
                    </button>
                  </div>
                )}

                {/* ── INGREDIENTS & INFO ── */}
                {activeTab === "ingredients" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Ingredients & Legal</h3>
                      <p className="mt-0.5 text-xs text-neutral-400">Full INCI ingredient list and manufacturing/legal information.</p>
                    </div>

                    <div>
                      <label className={labelCls}>Full Ingredients List (INCI)</label>
                      <textarea
                        value={form.full_ingredients_text}
                        onChange={(e) => set("full_ingredients_text", e.target.value)}
                        rows={7}
                        className={textareaCls}
                        placeholder="Aqua, Sodium Hyaluronate, Niacinamide, Glycerin, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7..."
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Manufacturing & Legal Information</label>
                      <textarea
                        value={form.manufacturing_info}
                        onChange={(e) => set("manufacturing_info", e.target.value)}
                        rows={5}
                        className={textareaCls}
                        placeholder="Manufactured in India. Cruelty-free and dermatologically tested. Net Qty: 100 ml. Best before 24 months from date of manufacture. For queries, contact care@aurafirm.com."
                      />
                    </div>
                  </div>
                )}

                {/* ── FAQs ── */}
                {activeTab === "faqs" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Frequently Asked Questions</h3>
                      <p className="mt-0.5 text-xs text-neutral-400">Common questions and answers displayed in the accordion on the product page.</p>
                    </div>

                    {form.faqs.length === 0 && (
                      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-200 py-12 text-center">
                        <HelpCircle className="h-8 w-8 text-neutral-200" />
                        <p className="text-sm font-semibold text-neutral-400">No FAQs yet</p>
                        <p className="text-xs text-neutral-300">Add questions customers frequently ask about this product.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {form.faqs.map((faq, i) => (
                        <div key={i} className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="rounded-full bg-[#fdf0e8] px-2.5 py-0.5 text-[11px] font-bold text-[#a0522d]">Q{i + 1}</span>
                            <button type="button" onClick={() => set("faqs", form.faqs.filter((_, idx) => idx !== i))} className="text-neutral-200 hover:text-red-400">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className={labelCls}>Question</label>
                              <input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} className={inputCls} placeholder="Is this suitable for sensitive skin?" />
                            </div>
                            <div>
                              <label className={labelCls}>Answer</label>
                              <textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} rows={3} className={textareaCls} placeholder="Yes, the formula is dermatologically tested and free from..." />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => set("faqs", [...form.faqs, emptyFaq()])}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-3 text-sm font-semibold text-neutral-400 hover:border-[#c9744e] hover:text-[#c9744e]"
                    >
                      <Plus className="h-4 w-4" /> Add FAQ
                    </button>
                  </div>
                )}

                {/* Next section prompt */}
                {activeTab !== "faqs" && (
                  <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-5">
                    <p className="text-xs text-neutral-400">
                      Section {TABS.findIndex((t) => t.key === activeTab) + 1} of {TABS.length}
                    </p>
                    <button
                      onClick={() => {
                        const idx = TABS.findIndex((t) => t.key === activeTab)
                        if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key)
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-200"
                    >
                      Next: {TABS[TABS.findIndex((t) => t.key === activeTab) + 1]?.label}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
