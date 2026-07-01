"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ShoppingBag,
  IndianRupee,
  Users,
  TrendingUp,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { adminGetDashboardStats, adminGetTopProducts } from "@/lib/actions"

type Stats = Awaited<ReturnType<typeof adminGetDashboardStats>>
type TopProduct = Awaited<ReturnType<typeof adminGetTopProducts>>[number]

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
  refunded:   "bg-neutral-100 text-neutral-600",
}

function changeColor(v: string) {
  if (v.startsWith("+")) return "text-[#6b8f5e]"
  if (v.startsWith("-")) return "text-red-500"
  return "text-neutral-400"
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
}: {
  title: string
  value: string | number
  change?: string
  icon: React.ElementType
  prefix?: string
}) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium text-neutral-500">{title}</p>
        <p className="mt-1 text-2xl font-extrabold text-neutral-900">
          {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </p>
        {change && (
          <p className={`mt-1 text-xs font-medium ${changeColor(change)}`}>
            {change} vs last 7 days
          </p>
        )}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fdf0e8]">
        <Icon className="h-5 w-5 text-[#c9744e]" />
      </div>
    </div>
  )
}

const REFRESH_INTERVAL = 30_000 // 30 seconds

export default function AdminDashboardClient({
  stats: initialStats,
  topProducts: initialTopProducts,
}: {
  stats: Stats
  topProducts: TopProduct[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const dateLabel = (() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    return `${fmt(start)} – ${fmt(now)}, ${now.getFullYear()}`
  })()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
      setLastRefreshed(new Date())
    })
  }

  // Auto-refresh every 30 s
  useEffect(() => {
    const id = setInterval(handleRefresh, REFRESH_INTERVAL)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = initialStats
  const topProducts = initialTopProducts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Welcome back, Admin!</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs text-neutral-600 shadow-sm">
            {dateLabel}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Refreshing…" : `Last: ${lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard title="Total Orders"     value={stats.totalOrders}    change={stats.changes.orders}    icon={ShoppingBag}   />
        <StatCard title="Total Sales"      value={stats.totalRevenue}   change={stats.changes.revenue}   icon={IndianRupee}   prefix="₹" />
        <StatCard title="Total Customers"  value={stats.totalCustomers} change={stats.changes.customers} icon={Users}         />
        <StatCard title="Gross Profit"     value={stats.grossProfit}    change={stats.changes.profit}    icon={TrendingUp}    prefix="₹" />
        <StatCard title="Avg. Order Value" value={stats.avgOrderValue}  change={stats.changes.avg}       icon={ClipboardList} prefix="₹" />
      </div>

      {/* Chart + top products + recent orders */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px_340px]">

        {/* Sales Overview */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-neutral-900">Sales Overview</h2>
              <p className="mt-0.5 text-xl font-extrabold text-neutral-900">
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
                <span className={`ml-2 text-xs font-medium ${changeColor(stats.changes.revenue)}`}>
                  {stats.changes.revenue} vs last 7 days
                </span>
              </p>
            </div>
            <span className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600">
              This Week
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ece6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}K` : v}`}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f0d8c8" }}
                formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`, "Sales"]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#c9744e"
                strokeWidth={2.5}
                dot={{ fill: "#c9744e", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">Top Selling Products</h2>
            <Link href="/admin/analytics" className="text-xs text-[#c9744e] hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-xs text-neutral-400">No sales data yet.</p>
            ) : (
              topProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#fdf0e8]">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover mix-blend-multiply" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-neutral-800">{p.name}</p>
                    <p className="text-[10px] text-neutral-400">{p.units} unit{p.units !== 1 ? "s" : ""} sold</p>
                  </div>
                  <p className="text-xs font-bold text-neutral-800">₹{p.revenue.toLocaleString("en-IN")}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#c9744e] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-xs text-neutral-400">No orders yet.</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id ?? order.created_at} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-800">#{order.order_number ?? "—"}</p>
                    <p className="text-[10px] text-neutral-400">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-neutral-800">
                      ₹{(order.grand_total ?? 0).toLocaleString("en-IN")}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {stats.lowStockProducts > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-neutral-800">Inventory Low Stock Alert</p>
              <p className="text-sm text-neutral-500">
                {stats.lowStockProducts} product{stats.lowStockProducts > 1 ? "s are" : " is"} running low on stock.
              </p>
            </div>
          </div>
          <Link
            href="/admin/inventory"
            className="rounded-xl bg-[#a0522d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#8b4513]"
          >
            View Inventory
          </Link>
        </div>
      )}
    </div>
  )
}
