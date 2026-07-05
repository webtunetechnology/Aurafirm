"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"
import { getMyOrders, cancelMyOrder } from "@/lib/actions"

// Order statuses at which the customer can still cancel (before it ships)
const CANCELLABLE = ["pending", "processing"]

// Build a best-effort tracking URL from carrier + tracking id when no explicit URL is stored
function buildTrackingUrl(carrier?: string | null, trackingId?: string | null): string | null {
  if (!trackingId) return null
  const c = (carrier ?? "").toLowerCase()
  if (c.includes("delhivery")) return `https://www.delhivery.com/track/package/${trackingId}`
  if (c.includes("bluedart") || c.includes("blue dart")) return `https://www.bluedart.com/tracking?trackFor=0&trackNo=${trackingId}`
  if (c.includes("dtdc")) return `https://www.dtdc.in/tracking.asp?strCnno=${trackingId}`
  if (c.includes("ekart")) return `https://ekartlogistics.com/shipmenttrack/${trackingId}`
  if (c.includes("xpressbees")) return `https://www.xpressbees.com/track?awb=${trackingId}`
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingId}`
  if (c.includes("dhl")) return `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${trackingId}`
  if (c.includes("india post") || c.includes("speed post")) return `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx`
  return null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700",   icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700",     icon: Package },
  shipped:    { label: "Shipped",    color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-700",   icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700",       icon: XCircle },
  refunded:   { label: "Refunded",   color: "bg-neutral-100 text-neutral-600", icon: RotateCcw },
}

type Order = Awaited<ReturnType<typeof getMyOrders>>[number]

interface Props {
  initialOrders: Order[]
  customerName: string
}

export default function MyOrdersPage({ initialOrders, customerName }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState("")

  function openCancelDialog(order: Order) {
    setCancelTarget(order)
    setCancelReason("")
    setCancelError("")
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    setCancelError("")
    const res = await cancelMyOrder(cancelTarget.id, cancelReason)
    setCancelling(false)
    if (!res.success) {
      setCancelError(res.message)
      return
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelTarget.id ? { ...o, status: "cancelled" } : o,
      ),
    )
    setCancelTarget(null)
  }

  const statusConf = (status: string) =>
    STATUS_CONFIG[status] ?? { label: status, color: "bg-neutral-100 text-neutral-600", icon: Package }

  return (
    <div className="min-h-screen bg-[#fdf6f2]">
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Welcome back,{" "}
            <span className="font-medium text-[#c9744e]">{customerName}</span>.
            Track all your AURAFIRM orders here.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dbb89e] bg-white py-20">
            <ShoppingBag className="mb-4 h-12 w-12 text-[#c9744e]/40" />
            <h2 className="text-lg font-semibold text-neutral-700">No orders yet</h2>
            <p className="mt-1 text-sm text-neutral-400">Your order history will appear here.</p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-[#a0522d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#8b4513]"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const conf = statusConf(order.status)
              const Icon = conf.icon
              const isOpen = expanded === order.id
              return (
                <div key={order.id} className="overflow-hidden rounded-2xl border border-[#ead5c8] bg-white shadow-sm">
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf0e8]">
                        <Package className="h-5 w-5 text-[#c9744e]" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800">#{order.order_number}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${conf.color}`}>
                        <Icon className="h-3 w-3" />
                        {conf.label}
                      </span>
                      <span className="font-semibold text-neutral-800">
                        ₹{order.grand_total.toLocaleString("en-IN")}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#ead5c8] px-6 py-5">
                      {/* Items */}
                      <div className="mb-4 space-y-3">
                        {(order.order_items as { id: string; product_name: string; product_image?: string; quantity: number; price: number; total: number }[]).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#fdf0e8]">
                              {item.product_image ? (
                                <Image src={item.product_image} alt={item.product_name} width={48} height={48} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-[#c9744e]/40" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-800">{item.product_name}</p>
                              <p className="text-xs text-neutral-500">
                                Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-neutral-800">
                              ₹{item.total.toLocaleString("en-IN")}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-[#fdf6f2] p-4 text-xs text-neutral-600 md:grid-cols-4">
                        <div>
                          <p className="font-medium text-neutral-400">Payment</p>
                          <p className="mt-0.5 font-semibold capitalize text-neutral-800">{order.payment_method}</p>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-400">Delivery</p>
                          <p className="mt-0.5 font-semibold capitalize text-neutral-800">{order.delivery_method}</p>
                        </div>
                        {order.tracking_id && (
                          <div>
                            <p className="font-medium text-neutral-400">Tracking ID</p>
                            <p className="mt-0.5 font-semibold text-neutral-800">{order.tracking_id}</p>
                          </div>
                        )}
                        {order.carrier && (
                          <div>
                            <p className="font-medium text-neutral-400">Carrier</p>
                            <p className="mt-0.5 font-semibold text-neutral-800">{order.carrier}</p>
                          </div>
                        )}
                      </div>

                      {/* Shipping address */}
                      <div className="mt-3 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-600">Shipping to: </span>
                        {[
                          (order.shipping_address as Record<string, string>).address,
                          (order.shipping_address as Record<string, string>).city,
                          (order.shipping_address as Record<string, string>).state,
                          (order.shipping_address as Record<string, string>).pin,
                        ].filter(Boolean).join(", ")}
                      </div>

                      {/* Tracking */}
                      {(order.status === "shipped" || order.status === "delivered") &&
                        (order.tracking_url || order.tracking_id) && (
                          <div className="mt-4 rounded-xl border border-[#e3d0ef] bg-[#f7f0fc] p-4">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-purple-600" />
                              <p className="text-sm font-semibold text-purple-800">
                                {order.status === "delivered" ? "Delivered" : "Your order is on the way"}
                              </p>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-600">
                              {order.carrier && (
                                <span>
                                  Carrier: <span className="font-semibold text-neutral-800">{order.carrier}</span>
                                </span>
                              )}
                              {order.tracking_id && (
                                <span>
                                  Tracking ID:{" "}
                                  <span className="font-semibold text-neutral-800">{order.tracking_id}</span>
                                </span>
                              )}
                              {order.estimated_delivery && order.status !== "delivered" && (
                                <span>
                                  Est. delivery:{" "}
                                  <span className="font-semibold text-neutral-800">
                                    {new Date(order.estimated_delivery).toLocaleDateString("en-IN", {
                                      day: "numeric", month: "short", year: "numeric",
                                    })}
                                  </span>
                                </span>
                              )}
                            </div>
                            {(() => {
                              const url = order.tracking_url ?? buildTrackingUrl(order.carrier, order.tracking_id)
                              if (!url) return null
                              return (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700"
                                >
                                  Track Package
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )
                            })()}
                          </div>
                        )}

                      {/* Cancellation reason */}
                      {order.status === "cancelled" && order.cancellation_reason && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                          <span className="font-semibold">Cancellation reason: </span>
                          {order.cancellation_reason}
                        </div>
                      )}

                      {/* Cancel action */}
                      {CANCELLABLE.includes(order.status) && (
                        <div className="mt-4 flex justify-end border-t border-[#f0e2d8] pt-4">
                          <button
                            onClick={() => openCancelDialog(order)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:border-red-400 hover:bg-red-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Cancel this order?</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Order #{cancelTarget.order_number} will be cancelled. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Reason for cancellation <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Let us know why you&apos;re cancelling…"
                className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]"
              />
            </div>
            {cancelError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {cancelError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
