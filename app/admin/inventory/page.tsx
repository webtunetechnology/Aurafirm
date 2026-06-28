"use client"

import { useState, useEffect, useTransition } from "react"
import Image from "next/image"
import { Package, AlertTriangle, CheckCircle, Minus, Plus, Save } from "lucide-react"
import { adminGetProducts, adminUpdateStock } from "@/lib/actions"

type Product = Awaited<ReturnType<typeof adminGetProducts>>[number]

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    adminGetProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  function setStock(id: string, val: number) {
    setEdits((prev) => ({ ...prev, [id]: Math.max(0, val) }))
  }

  function getCurrentStock(p: Product) {
    return edits[p.id] !== undefined ? edits[p.id] : p.stock
  }

  function handleSave(p: Product) {
    const newStock = getCurrentStock(p)
    setSaving(p.id)
    startTransition(async () => {
      await adminUpdateStock(p.id, newStock)
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: newStock } : x)))
      setEdits((prev) => { const n = { ...prev }; delete n[p.id]; return n })
      setSaving(null)
    })
  }

  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 20).length
  const inStock = products.filter((p) => p.stock >= 20).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Inventory</h1>
        <p className="mt-0.5 text-xs text-neutral-500">Manage stock levels for all products.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "In Stock", value: inStock, color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
          { label: "Low Stock (< 20)", value: lowStock, color: "text-amber-700", bg: "bg-amber-100", icon: AlertTriangle },
          { label: "Out of Stock", value: outOfStock, color: "text-red-600", bg: "bg-red-100", icon: Package },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>{lowStock + outOfStock} product(s)</strong> need restocking. Update stock quantities below.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c9744e] border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Current Stock</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Stock Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Adjust Stock</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {products.map((p) => {
                  const current = getCurrentStock(p)
                  const isDirty = edits[p.id] !== undefined
                  const stockStatus =
                    current === 0
                      ? { label: "Out of Stock", cls: "bg-red-100 text-red-600" }
                      : current < 20
                      ? { label: "Low Stock", cls: "bg-amber-100 text-amber-700" }
                      : { label: "In Stock", cls: "bg-green-100 text-green-700" }

                  return (
                    <tr key={p.id} className={`hover:bg-neutral-50/60 ${isDirty ? "bg-[#fdf8f5]" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#fdf0e8]">
                            {p.image_url ? (
                              <Image src={p.image_url} alt={p.name} width={40} height={40} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-4 w-4 text-[#c9744e]/40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">{p.name}</p>
                            <p className="text-[10px] text-neutral-400">{p.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-neutral-600">{p.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${current < 20 ? "text-red-600" : "text-neutral-800"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stockStatus.cls}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setStock(p.id, current - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={current}
                            onChange={(e) => setStock(p.id, parseInt(e.target.value) || 0)}
                            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-center text-xs font-semibold outline-none focus:border-[#c9744e]"
                          />
                          <button
                            onClick={() => setStock(p.id, current + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSave(p)}
                          disabled={!isDirty || isPending || saving === p.id}
                          className="flex items-center gap-1 rounded-lg bg-[#a0522d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8b4513] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Save className="h-3 w-3" />
                          {saving === p.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
