"use client"

import { useState, useTransition, useCallback } from "react"
import Image from "next/image"
import {
  Plus, Pencil, Trash2, Search, Package, X, ChevronRight,
  ImageIcon, Info, Leaf, ListOrdered, HelpCircle, Settings2,
  ArrowLeft, Check, AlertCircle,
} from "lucide-react"
import { adminUpsertProduct, adminDeleteProduct, adminGetProducts } from "@/lib/actions"

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
  gallery_images: string  // newline-separated URLs
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
    image_url: "", gallery_images: "",
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
    gallery_images: ((p as { gallery_images?: string[] }).gallery_images ?? []).join("\n"),
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
        gallery_images: lines(form.gallery_images),
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

      {/* Full-screen drawer form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />

          {/* Drawer */}
          <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    {editing ? "Edit Product" : "Add New Product"}
                  </h2>
                  {editing && <p className="text-[11px] text-neutral-400">{editing.name}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending || !form.name || !form.price}
                  className="flex items-center gap-1.5 rounded-xl bg-[#a0522d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8b4513] disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </span>
                  ) : saveSuccess ? (
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Saved!</span>
                  ) : (
                    "Save Product"
                  )}
                </button>
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex shrink-0 overflow-x-auto border-b border-neutral-100 bg-neutral-50/60">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-[11px] font-semibold transition-colors ${
                    activeTab === key
                      ? "border-[#c9744e] text-[#c9744e]"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">

              {/* ── BASIC INFO ── */}
              {activeTab === "basic" && (
                <div className="space-y-5">
                  <SectionCard title="Identity">
                    <Field label="Product Name *" span={2}>
                      <input
                        value={form.name}
                        onChange={(e) => {
                          set("name", e.target.value)
                          if (!editing) set("slug", slugify(e.target.value))
                        }}
                        className={inputCls}
                        placeholder="AuraFirm Fusion 4x1 Face Serum"
                      />
                    </Field>
                    <Field label="Subtitle" span={2}>
                      <input
                        value={form.subtitle}
                        onChange={(e) => set("subtitle", e.target.value)}
                        className={inputCls}
                        placeholder="With Hyaluronic Acid, Niacinamide & Collagen"
                      />
                    </Field>
                    <Field label="URL Slug">
                      <input
                        value={form.slug}
                        onChange={(e) => set("slug", slugify(e.target.value))}
                        className={inputCls}
                        placeholder="fusion-4x1-face-serum"
                      />
                    </Field>
                    <Field label="Category">
                      <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Description" span={2}>
                      <textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        rows={3}
                        className={textareaCls}
                        placeholder="Short product description shown in listings and meta tags."
                      />
                    </Field>
                    <Field label="Tags (comma separated)" span={2}>
                      <input
                        value={form.tags}
                        onChange={(e) => set("tags", e.target.value)}
                        className={inputCls}
                        placeholder="Vegan, Paraben Free, Dermatest Tested"
                      />
                    </Field>
                  </SectionCard>

                  <SectionCard title="Visibility">
                    <div className="col-span-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => set("is_active", !form.is_active)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${form.is_active ? "bg-[#c9744e]" : "bg-neutral-200"}`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                      <span className="text-sm font-medium text-neutral-700">
                        {form.is_active ? "Active — visible in store" : "Inactive — hidden from store"}
                      </span>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ── PRICING & STOCK ── */}
              {activeTab === "pricing" && (
                <div className="space-y-5">
                  <SectionCard title="Pricing">
                    <Field label="Selling Price (₹) *">
                      <input
                        type="number"
                        value={form.price || ""}
                        onChange={(e) => set("price", +e.target.value)}
                        className={inputCls}
                        placeholder="1199"
                      />
                    </Field>
                    <Field label="Original / MRP (₹)">
                      <input
                        type="number"
                        value={form.original_price || ""}
                        onChange={(e) => set("original_price", +e.target.value)}
                        className={inputCls}
                        placeholder="1499"
                      />
                    </Field>
                    <Field label="VIP / Member Price (₹)">
                      <input
                        type="number"
                        value={form.vip_price || ""}
                        onChange={(e) => set("vip_price", +e.target.value)}
                        className={inputCls}
                        placeholder="999"
                      />
                    </Field>
                    <Field label="Size Label">
                      <input
                        value={form.size_label}
                        onChange={(e) => set("size_label", e.target.value)}
                        className={inputCls}
                        placeholder="100 ml"
                      />
                    </Field>
                  </SectionCard>

                  <SectionCard title="Inventory">
                    <Field label="Stock Quantity">
                      <input
                        type="number"
                        value={form.stock || ""}
                        onChange={(e) => set("stock", +e.target.value)}
                        className={inputCls}
                        placeholder="100"
                      />
                    </Field>
                    <Field label="Rating (out of 5)">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={form.rating || ""}
                        onChange={(e) => set("rating", +e.target.value)}
                        className={inputCls}
                        placeholder="4.8"
                      />
                    </Field>
                    <Field label="Review Count">
                      <input
                        type="number"
                        value={form.review_count || ""}
                        onChange={(e) => set("review_count", +e.target.value)}
                        className={inputCls}
                        placeholder="21"
                      />
                    </Field>
                  </SectionCard>
                </div>
              )}

              {/* ── MEDIA ── */}
              {activeTab === "media" && (
                <div className="space-y-5">
                  <SectionCard title="Main Image">
                    <Field label="Main Image URL" span={2}>
                      <input
                        value={form.image_url}
                        onChange={(e) => set("image_url", e.target.value)}
                        className={inputCls}
                        placeholder="https://res.cloudinary.com/..."
                      />
                    </Field>
                    {form.image_url && (
                      <div className="col-span-2">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-[#fdf0e8]">
                          <img src={form.image_url} alt="preview" className="h-full w-full object-contain mix-blend-multiply" />
                        </div>
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="Gallery Images">
                    <Field label="Gallery Image URLs — one per line" span={2}>
                      <textarea
                        value={form.gallery_images}
                        onChange={(e) => set("gallery_images", e.target.value)}
                        rows={6}
                        className={textareaCls}
                        placeholder={"https://res.cloudinary.com/.../img1.jpg\nhttps://res.cloudinary.com/.../img2.jpg"}
                      />
                    </Field>
                    {lines(form.gallery_images).length > 0 && (
                      <div className="col-span-2 flex flex-wrap gap-2">
                        {lines(form.gallery_images).map((url, i) => (
                          <div key={i} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-[#fdf0e8]">
                            <img src={url} alt={`gallery-${i}`} className="h-full w-full object-contain mix-blend-multiply" />
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* ── BENEFITS ── */}
              {activeTab === "details" && (
                <div className="space-y-5">
                  <SectionCard title="What It Helps With">
                    <Field label="One benefit per line" span={2}>
                      <textarea
                        value={form.helps_with}
                        onChange={(e) => set("helps_with", e.target.value)}
                        rows={4}
                        className={textareaCls}
                        placeholder={"Deep hydration and moisture retention\nBrightening and evening skin tone\nImproving texture, firmness and elasticity"}
                      />
                    </Field>
                  </SectionCard>

                  <SectionCard title="Suitable For">
                    <Field label="One entry per line" span={2}>
                      <textarea
                        value={form.suitable_for}
                        onChange={(e) => set("suitable_for", e.target.value)}
                        rows={4}
                        className={textareaCls}
                        placeholder={"All skin types, including sensitive skin\nDull, dry, or uneven-looking skin\nDaily morning and evening routines"}
                      />
                    </Field>
                  </SectionCard>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className={labelCls}>Hero Ingredients (up to 3)</p>
                      {form.hero_ingredients.length < 3 && (
                        <button
                          type="button"
                          onClick={() => set("hero_ingredients", [...form.hero_ingredients, emptyIngredient()])}
                          className="text-[11px] font-semibold text-[#c9744e] hover:underline"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    {form.hero_ingredients.map((ing, i) => (
                      <div key={i} className="relative rounded-xl border border-neutral-100 bg-neutral-50/60 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Ingredient {i + 1}</span>
                          {form.hero_ingredients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => set("hero_ingredients", form.hero_ingredients.filter((_, idx) => idx !== i))}
                              className="text-neutral-300 hover:text-red-400"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className={labelCls}>Image URL</label>
                            <input value={ing.image} onChange={(e) => updateIngredient(i, "image", e.target.value)} className={inputCls} placeholder="https://..." />
                          </div>
                          <div>
                            <label className={labelCls}>Name</label>
                            <input value={ing.title} onChange={(e) => updateIngredient(i, "title", e.target.value)} className={inputCls} placeholder="Hyaluronic Acid" />
                          </div>
                          <div>
                            <label className={labelCls}>Benefits (comma separated)</label>
                            <input value={ing.benefits} onChange={(e) => updateIngredient(i, "benefits", e.target.value)} className={inputCls} placeholder="Hydrates skin, Plumps pores" />
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>Description</label>
                            <textarea value={ing.description} onChange={(e) => updateIngredient(i, "description", e.target.value)} rows={2} className={textareaCls} placeholder="What this ingredient does for the skin..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── HOW TO USE ── */}
              {activeTab === "howto" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={labelCls}>How to Use Steps</p>
                    <button
                      type="button"
                      onClick={() => set("how_to_use_steps", [...form.how_to_use_steps, emptyStep(form.how_to_use_steps.length + 1)])}
                      className="text-[11px] font-semibold text-[#c9744e] hover:underline"
                    >
                      + Add Step
                    </button>
                  </div>
                  {form.how_to_use_steps.map((step, i) => (
                    <div key={i} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c9744e] text-[11px] font-bold text-white">{step.number}</span>
                        {form.how_to_use_steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => set("how_to_use_steps", form.how_to_use_steps.filter((_, idx) => idx !== i))}
                            className="text-neutral-300 hover:text-red-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className={labelCls}>Step Title</label>
                          <input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} className={inputCls} placeholder="Cleanse & Pat Dry" />
                        </div>
                        <div>
                          <label className={labelCls}>Instructions</label>
                          <textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} rows={2} className={textareaCls} placeholder="Detailed instruction for this step..." />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── INGREDIENTS & INFO ── */}
              {activeTab === "ingredients" && (
                <div className="space-y-5">
                  <SectionCard title="Full Ingredients List">
                    <Field label="Paste the complete INCI ingredient list" span={2}>
                      <textarea
                        value={form.full_ingredients_text}
                        onChange={(e) => set("full_ingredients_text", e.target.value)}
                        rows={5}
                        className={textareaCls}
                        placeholder="Aqua, Sodium Hyaluronate, Niacinamide, Glycerin, Palmitoyl Tripeptide-1..."
                      />
                    </Field>
                  </SectionCard>

                  <SectionCard title="Manufacturing Information">
                    <Field label="Manufacturing & Legal Info" span={2}>
                      <textarea
                        value={form.manufacturing_info}
                        onChange={(e) => set("manufacturing_info", e.target.value)}
                        rows={4}
                        className={textareaCls}
                        placeholder="Manufactured in India. Net Qty: 100 ml. Best before 24 months. For queries, contact care@aurafirm.com."
                      />
                    </Field>
                  </SectionCard>
                </div>
              )}

              {/* ── FAQs ── */}
              {activeTab === "faqs" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={labelCls}>Frequently Asked Questions</p>
                    <button
                      type="button"
                      onClick={() => set("faqs", [...form.faqs, emptyFaq()])}
                      className="text-[11px] font-semibold text-[#c9744e] hover:underline"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  {form.faqs.length === 0 && (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-xs text-neutral-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      No FAQs yet. Click &ldquo;+ Add FAQ&rdquo; to add questions customers frequently ask.
                    </div>
                  )}

                  {form.faqs.map((faq, i) => (
                    <div key={i} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">FAQ {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => set("faqs", form.faqs.filter((_, idx) => idx !== i))}
                          className="text-neutral-300 hover:text-red-400"
                        >
                          <X className="h-3.5 w-3.5" />
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
              )}

              {/* Next tab prompt */}
              {activeTab !== "faqs" && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      const idx = TABS.findIndex((t) => t.key === activeTab)
                      if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key)
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-[#c9744e]"
                  >
                    Next: {TABS[TABS.findIndex((t) => t.key === activeTab) + 1]?.label}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
