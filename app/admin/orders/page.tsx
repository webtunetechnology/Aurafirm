"use client"

import { useState, useEffect, useTransition } from "react"
import {
  Search, Download, Filter, RotateCcw, Eye, ChevronLeft, ChevronRight,
  ShoppingBag, Clock, CheckCircle, IndianRupee, X, Package, Truck,
  MapPin, Phone, Mail, ExternalLink, Check, ChevronDown,
} from "lucide-react"
import { adminGetOrders, adminUpdateOrderShipping } from "@/lib/actions"

type Order = Awaited<ReturnType<typeof adminGetOrders>>[number]

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
const PAYMENT_OPTIONS = ["all", "paid", "pending", "failed"]
const PER_PAGE = 10

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  pending:    { color: "text-amber-700",   bg: "bg-amber-100",   label: "Pending" },
  processing: { color: "text-blue-700",    bg: "bg-blue-100",    label: "Processing" },
  shipped:    { color: "text-violet-700",  bg: "bg-violet-100",  label: "Shipped" },
  delivered:  { color: "text-green-700",   bg: "bg-green-100",   label: "Delivered" },
  cancelled:  { color: "text-red-600",     bg: "bg-red-100",     label: "Cancelled" },
  refunded:   { color: "text-neutral-600", bg: "bg-neutral-100", label: "Refunded" },
}

const CARRIERS = [
  "BlueDart", "Delhivery", "DTDC", "Ekart", "India Post", "Shadowfax",
  "Xpressbees", "Ecom Express", "FedEx", "Other",
]

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"]

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { color: "text-neutral-600", bg: "bg-neutral-100", label: status }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  )
}

function StatCard({ title, value, icon: Icon, prefix = "" }: {
  title: string; value: number; icon: React.ElementType; prefix?: string
}) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs text-neutral-500">{title}</p>
        <p className="mt-1 text-2xl font-extrabold text-neutral-900">{prefix}{value.toLocaleString("en-IN")}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf0e8]">
        <Icon className="h-5 w-5 text-[#c9744e]" />
      </div>
    </div>
  )
}

// ── Order Detail + Shipping Update Drawer ─────────────────────────────────────

function OrderDrawer({ order, onClose, onSaved }: {
  order: Order
  onClose: () => void
  onSaved: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Form state
  const [status, setStatus] = useState(order.status)
  const [carrier, setCarrier] = useState((order as Record<string, unknown>).carrier as string ?? "")
  const [trackingId, setTrackingId] = useState((order as Record<string, unknown>).tracking_id as string ?? "")
  const [trackingUrl, setTrackingUrl] = useState((order as Record<string, unknown>).tracking_url as string ?? "")
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    (order as Record<string, unknown>).estimated_delivery as string ?? ""
  )
  const [notes, setNotes] = useState((order as Record<string, unknown>).notes as string ?? "")

  const shippingAddress = order.shipping_address as Record<string, string> | null

  const currentStepIdx = STATUS_STEPS.indexOf(order.status)

  function handleSave() {
    startTransition(async () => {
      await adminUpdateOrderShipping(order.id, {
        status,
        carrier,
        tracking_id: trackingId,
        tracking_url: trackingUrl,
        estimated_delivery: estimatedDelivery,
        notes,
      })
      setSaveSuccess(true)
      setTimeout(() => { setSaveSuccess(false); onSaved(); onClose() }, 1000)
    })
  }

  const inputCls = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none transition focus:border-[#c9744e] focus:ring-2 focus:ring-[#c9744e]/10"
  const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="shrink-0 border-b border-neutral-100">
          <div className="h-1 w-full bg-[#c9744e]" />
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900">Order #{order.order_number}</h2>
              <p className="text-xs text-neutral-400">
                {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-[#a0522d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b4513] disabled:opacity-60"
              >
                {isPending ? (
                  <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...</>
                ) : saveSuccess ? (
                  <><Check className="h-4 w-4" /> Saved!</>
                ) : "Save Changes"}
              </button>
              <button onClick={onClose} className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* Left — order info (read-only) */}
          <div className="flex w-80 shrink-0 flex-col gap-5 overflow-y-auto border-r border-neutral-100 bg-neutral-50/60 p-5">

            {/* Order status timeline */}
            <div className="rounded-xl border border-neutral-100 bg-white p-4">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Order Progress</p>
              <div className="flex flex-col gap-0">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIdx
                  const active = idx === currentStepIdx
                  const isLast = idx === STATUS_STEPS.length - 1
                  return (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors ${done ? "border-[#c9744e] bg-[#c9744e] text-white" : "border-neutral-200 bg-white text-neutral-400"}`}>
                          {done ? <Check className="h-3 w-3" /> : idx + 1}
                        </div>
                        {!isLast && <div className={`mt-0.5 h-6 w-0.5 ${idx < currentStepIdx ? "bg-[#c9744e]" : "bg-neutral-200"}`} />}
                      </div>
                      <div className="pb-4 pt-0.5">
                        <p className={`text-xs font-semibold capitalize ${active ? "text-[#a0522d]" : done ? "text-neutral-800" : "text-neutral-400"}`}>{step}</p>
                        {active && <p className="text-[10px] text-neutral-400">Current status</p>}
                      </div>
                    </div>
                  )
                })}
                {order.status === "cancelled" && (
                  <div className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    Order Cancelled
                  </div>
                )}
              </div>
            </div>

            {/* Customer info */}
            <div className="rounded-xl border border-neutral-100 bg-white p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Customer</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fdf0e8] text-xs font-bold text-[#c9744e]">
                    {(order.customer_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">{order.customer_name}</p>
                </div>
                {order.customer_email && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> {order.customer_email}
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Phone className="h-3.5 w-3.5 shrink-0" /> {order.customer_phone}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            {shippingAddress && (
              <div className="rounded-xl border border-neutral-100 bg-white p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Ship To</p>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <p className="text-xs leading-relaxed text-neutral-600">
                    {[shippingAddress.address, shippingAddress.city, shippingAddress.state, shippingAddress.pincode, shippingAddress.country]
                      .filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Order items */}
            <div className="rounded-xl border border-neutral-100 bg-white p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Items ({(order.order_items as unknown[]).length})
              </p>
              <div className="space-y-2.5">
                {(order.order_items as { product_name: string; quantity: number; price: number; total: number }[]).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fdf0e8]">
                        <Package className="h-3.5 w-3.5 text-[#c9744e]/60" />
                      </div>
                      <div>
                        <p className="max-w-[130px] truncate text-xs font-medium text-neutral-700">{item.product_name}</p>
                        <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-neutral-800">₹{item.total.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-neutral-100 pt-3 space-y-1">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount</span><span>-₹{order.discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Shipping</span><span>{order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost}`}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm font-bold text-neutral-900">
                  <span>Total</span><span>₹{order.grand_total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — editable shipping + status form */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">

              {/* Section: Status */}
              <div>
                <h3 className="mb-1 text-base font-bold text-neutral-900">Order Status</h3>
                <p className="mb-4 text-xs text-neutral-400">Update the fulfilment status of this order.</p>

                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const m = STATUS_META[s]
                    const isActive = status === s
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                          isActive
                            ? "border-[#c9744e] bg-[#fdf8f5] text-[#a0522d]"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isActive ? "bg-[#c9744e]" : m?.bg.replace("bg-", "bg-") ?? "bg-neutral-300"}`} />
                        {m?.label ?? s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section: Shipping details */}
              <div>
                <h3 className="mb-1 text-base font-bold text-neutral-900">Shipping & Tracking</h3>
                <p className="mb-4 text-xs text-neutral-400">Provide courier and tracking details so the customer can follow their shipment.</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Carrier */}
                  <div>
                    <label className={labelCls}>Courier / Carrier</label>
                    <div className="relative">
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className={`${inputCls} appearance-none pr-8`}
                      >
                        <option value="">Select carrier...</option>
                        {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                  </div>

                  {/* Tracking ID */}
                  <div>
                    <label className={labelCls}>Tracking ID / AWB Number</label>
                    <input
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 1234567890"
                    />
                  </div>

                  {/* Tracking URL */}
                  <div className="col-span-2">
                    <label className={labelCls}>Tracking URL</label>
                    <div className="relative">
                      <input
                        value={trackingUrl}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        className={`${inputCls} pr-10`}
                        placeholder="https://www.delhivery.com/track/package/..."
                      />
                      {trackingUrl && (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#c9744e]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {trackingUrl && (
                      <p className="mt-1 truncate text-[11px] text-[#c9744e]">{trackingUrl}</p>
                    )}
                  </div>

                  {/* Estimated Delivery */}
                  <div>
                    <label className={labelCls}>Estimated Delivery Date</label>
                    <input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={inputCls}
                    />
                  </div>

                  {/* Payment info (read-only) */}
                  <div>
                    <label className={labelCls}>Payment Method</label>
                    <div className={`${inputCls} flex items-center gap-2 bg-neutral-50 text-neutral-500`}>
                      <IndianRupee className="h-4 w-4 text-neutral-400" />
                      <span className="capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</span>
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Tracking preview card */}
              {(carrier || trackingId) && (
                <div className="rounded-xl border border-[#fdf0e8] bg-[#fdf8f5] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#c9744e]" />
                    <p className="text-sm font-bold text-neutral-800">Tracking Info Preview</p>
                    <span className="ml-auto rounded-full bg-[#c9744e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#c9744e]">What customer will see</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {carrier && (
                      <div>
                        <p className="text-neutral-400">Carrier</p>
                        <p className="font-semibold text-neutral-800">{carrier}</p>
                      </div>
                    )}
                    {trackingId && (
                      <div>
                        <p className="text-neutral-400">AWB / Tracking</p>
                        <p className="font-mono font-semibold text-neutral-800">{trackingId}</p>
                      </div>
                    )}
                    {estimatedDelivery && (
                      <div>
                        <p className="text-neutral-400">Est. Delivery</p>
                        <p className="font-semibold text-neutral-800">
                          {new Date(estimatedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}
                        </p>
                      </div>
                    )}
                    {trackingUrl && (
                      <div>
                        <p className="text-neutral-400">Track Link</p>
                        <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-[#c9744e] hover:underline">
                          Open tracking <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Internal notes */}
              <div>
                <h3 className="mb-1 text-base font-bold text-neutral-900">Internal Notes</h3>
                <p className="mb-3 text-xs text-neutral-400">Private notes for your team — not visible to the customer.</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="e.g. Customer called to change delivery time. Handle with care."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  function loadOrders() {
    setLoading(true)
    adminGetOrders({ status: statusFilter, paymentStatus: paymentFilter, search }).then((data) => {
      setOrders(data)
      setLoading(false)
      setPage(1)
    })
  }

  useEffect(() => { loadOrders() }, [statusFilter, paymentFilter, search])

  const totalOrders = orders.length
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "processing").length
  const completedCount = orders.filter((o) => o.status === "delivered").length
  const revenue = orders.reduce((s, o) => s + (o.grand_total ?? 0), 0)

  const totalPages = Math.max(1, Math.ceil(totalOrders / PER_PAGE))
  const paginated = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Orders</h1>
          <p className="mt-0.5 text-xs text-neutral-500">Manage customer orders, shipping status, and tracking details.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50">
          <Download className="h-3.5 w-3.5" /> Export Orders
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title="Total Orders"    value={totalOrders}    icon={ShoppingBag} />
        <StatCard title="Active"          value={pendingCount}   icon={Clock} />
        <StatCard title="Delivered"       value={completedCount} icon={CheckCircle} />
        <StatCard title="Revenue"         value={revenue}        icon={IndianRupee} prefix="₹" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name or phone..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-8 pr-3 text-xs text-neutral-800 outline-none focus:border-[#c9744e]"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-medium text-neutral-400">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs text-neutral-700 outline-none focus:border-[#c9744e]"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-medium text-neutral-400">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs text-neutral-700 outline-none focus:border-[#c9744e]"
            >
              {PAYMENT_OPTIONS.map((p) => (
                <option key={p} value={p}>{p === "all" ? "All Payments" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); setPaymentFilter("all") }}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs text-neutral-600 hover:bg-neutral-50"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 overflow-x-auto">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? "bg-[#a0522d] text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {s === "all" ? "All" : STATUS_META[s]?.label ?? s}
            <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
              {s === "all" ? String(totalOrders) : String(orders.filter((o) => o.status === s).length)}
            </span>
          </button>
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
            <table className="w-full min-w-[860px] text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Order</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Items</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Tracking</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-neutral-400">
                      No orders found.
                    </td>
                  </tr>
                ) : paginated.map((order) => {
                  const o = order as Record<string, unknown>
                  return (
                    <tr key={order.id} className="group hover:bg-neutral-50/70">
                      <td className="px-4 py-3.5 font-bold text-neutral-800">#{order.order_number}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-neutral-800">{order.customer_name}</p>
                        <p className="text-[10px] text-neutral-400">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="max-w-[120px] truncate font-medium text-neutral-700">
                          {(order.order_items as { product_name: string }[])[0]?.product_name ?? "—"}
                        </p>
                        {(order.order_items as unknown[]).length > 1 && (
                          <p className="text-[10px] text-neutral-400">+{(order.order_items as unknown[]).length - 1} more</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-neutral-900">
                        ₹{order.grand_total.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          order.payment_status === "paid" ? "bg-green-100 text-green-700" :
                          order.payment_method === "cod" ? "bg-neutral-100 text-neutral-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {order.payment_method === "cod" ? "COD" : order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        {o.carrier ? (
                          <div>
                            <p className="font-medium text-neutral-700">{String(o.carrier)}</p>
                            {!!o.tracking_id && (
                              <p className="font-mono text-[10px] text-neutral-400">#{String(o.tracking_id)}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#fdf0e8] px-3 py-1.5 text-xs font-semibold text-[#a0522d] hover:bg-[#fbede0]"
                        >
                          <Eye className="h-3 w-3" /> Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
          <p className="text-xs text-neutral-500">
            Showing {Math.min((page - 1) * PER_PAGE + 1, totalOrders || 1)}–{Math.min(page * PER_PAGE, totalOrders)} of {totalOrders} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${page === n ? "bg-[#a0522d] text-white" : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Drawer */}
      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaved={() => loadOrders()}
        />
      )}
    </div>
  )
}
