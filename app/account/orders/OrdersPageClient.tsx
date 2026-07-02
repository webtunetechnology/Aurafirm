"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Package,
  ChevronRight,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  ShoppingBag,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getMyOrders } from "@/lib/actions"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700",   icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700",     icon: Package },
  shipped:    { label: "Shipped",    color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-700",   icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700",       icon: XCircle },
  refunded:   { label: "Refunded",   color: "bg-neutral-100 text-neutral-600", icon: RotateCcw },
}

type Order = Awaited<ReturnType<typeof getMyOrders>>[number]

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/account/login")
        return
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
      setCustomerName(profile?.full_name ?? "Customer")
      const data = await getMyOrders()
      setOrders(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const statusConf = (status: string) =>
    STATUS_CONFIG[status] ?? { label: status, color: "bg-neutral-100 text-neutral-600", icon: Package }

  return (
    <div className="min-h-screen bg-[#fdf6f2]">
      {/* Header */}
      <header className="border-b border-[#ead5c8] bg-white px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
              alt="AURAFIRM logo"
              width={130}
              height={44}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-sm text-neutral-600 hover:text-[#c9744e]">
              Continue Shopping
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:border-[#c9744e] hover:text-[#c9744e]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Welcome back, <span className="font-medium text-[#c9744e]">{customerName}</span>. Track all your Aurafirm orders here.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9744e] border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
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
                      <span className="font-semibold text-neutral-800">₹{order.grand_total.toLocaleString("en-IN")}</span>
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
                              <p className="text-xs text-neutral-500">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                            </div>
                            <p className="text-sm font-semibold text-neutral-800">₹{item.total.toLocaleString("en-IN")}</p>
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
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
