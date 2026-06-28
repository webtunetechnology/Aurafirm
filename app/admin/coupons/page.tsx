"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight, X } from "lucide-react"
import { adminGetCoupons, adminUpsertCoupon, adminDeleteCoupon, adminToggleCoupon } from "@/lib/actions"

type Coupon = Awaited<ReturnType<typeof adminGetCoupons>>[number]

const emptyForm = {
  code: "",
  discount_type: "fixed" as "fixed" | "percentage",
  discount_value: 0,
  min_order_value: 0,
  max_uses: "" as string | number,
  expires_at: "",
  is_active: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  function load() {
    adminGetCoupons().then((data) => {
      setCoupons(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(c: Coupon) {
    setEditing(c)
    setForm({
      code: c.code,
      discount_type: c.discount_type as "fixed" | "percentage",
      discount_value: c.discount_value,
      min_order_value: c.min_order_value,
      max_uses: c.max_uses ?? "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
      is_active: c.is_active,
    })
    setShowForm(true)
  }

  function handleSave() {
    startTransition(async () => {
      await adminUpsertCoupon({
        ...(editing ? { id: editing.id } : {}),
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value),
        max_uses: form.max_uses === "" ? null : Number(form.max_uses),
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: form.is_active,
      })
      load()
      setShowForm(false)
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return
    startTransition(async () => {
      await adminDeleteCoupon(id)
      load()
    })
  }

  function handleToggle(id: string, is_active: boolean) {
    startTransition(async () => {
      await adminToggleCoupon(id, !is_active)
      load()
    })
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-[#c9744e]"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Coupons</h1>
          <p className="mt-0.5 text-xs text-neutral-500">Create and manage discount coupon codes.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-xl bg-[#a0522d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8b4513]"
        >
          <Plus className="h-3.5 w-3.5" /> Add Coupon
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {[
          { label: "Total Coupons", value: coupons.length },
          { label: "Active Coupons", value: coupons.filter((c) => c.is_active).length },
          { label: "Total Uses", value: coupons.reduce((s, c) => s + (c.used_count ?? 0), 0) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf0e8]">
              <Tag className="h-5 w-5 text-[#c9744e]" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="mt-0.5 text-2xl font-extrabold text-neutral-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c9744e] border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Discount</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Min Order</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Uses</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Expires</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                      No coupons yet. Create your first coupon above.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/60">
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-[#fdf0e8] px-2.5 py-1 font-mono text-xs font-bold text-[#a0522d]">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-800">
                        {c.discount_type === "percentage"
                          ? `${c.discount_value}% off`
                          : `₹${c.discount_value} off`}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">₹{c.min_order_value}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {c.used_count ?? 0}
                        {c.max_uses ? ` / ${c.max_uses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {c.expires_at
                          ? new Date(c.expires_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "No expiry"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            c.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(c.id, c.is_active)}
                            disabled={isPending}
                            title={c.is_active ? "Deactivate" : "Activate"}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-[#c9744e]"
                          >
                            {c.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-[#c9744e]"
                          >
                            <Plus className="h-3.5 w-3.5 rotate-45 scale-110" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={isPending}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">
                {editing ? "Edit Coupon" : "Create Coupon"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Coupon Code *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE200"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as "fixed" | "percentage" })}
                    className={inputCls}
                  >
                    <option value="fixed">Fixed (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">
                    Discount Value {form.discount_type === "percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: +e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={form.min_order_value}
                    onChange={(e) => setForm({ ...form, min_order_value: +e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Max Uses (leave blank = unlimited)</label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <label htmlFor="coupon-active" className="text-xs text-neutral-700">Active</label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !form.code || !form.discount_value}
                className="rounded-xl bg-[#a0522d] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8b4513] disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
