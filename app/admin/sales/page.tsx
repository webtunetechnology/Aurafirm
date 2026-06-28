"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts"
import { IndianRupee, ShoppingBag, TrendingUp, Tag } from "lucide-react"
import { adminGetSalesData } from "@/lib/actions"

type SalesData = Awaited<ReturnType<typeof adminGetSalesData>>

const PIE_COLORS = ["#c9744e", "#e8a87c", "#6b8f5e", "#a0c4a8", "#8b7355", "#d4a574"]

export default function AdminSalesPage() {
  const [data, setData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetSalesData().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c9744e] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Sales</h1>
        <p className="mt-0.5 text-xs text-neutral-500">Monthly revenue, profit and order trends.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Revenue",   value: `₹${data.totalRevenue.toLocaleString("en-IN")}`,   icon: IndianRupee },
          { label: "Gross Profit",    value: `₹${data.grossProfit.toLocaleString("en-IN")}`,    icon: TrendingUp },
          { label: "Total Orders",    value: data.totalOrders,                                   icon: ShoppingBag },
          { label: "Total Discounts", value: `₹${data.totalDiscount.toLocaleString("en-IN")}`,  icon: Tag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-start justify-between rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="mt-1 text-xl font-extrabold text-neutral-900">{value}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf0e8]">
              <Icon className="h-5 w-5 text-[#c9744e]" />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly revenue + profit bar chart */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-neutral-900">Monthly Revenue vs Profit (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.monthly} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5ece6" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}K` : v}`}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f0d8c8" }}
              formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="revenue" name="Revenue" fill="#c9744e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit"  name="Profit"  fill="#6b8f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders trend line + pie charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_260px_260px]">
        {/* Monthly orders trend */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-neutral-900">Monthly Orders</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.monthly} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ece6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#c9744e"
                strokeWidth={2.5}
                dot={{ fill: "#c9744e", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment method pie */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-neutral-900">Payment Methods</h2>
          {data.paymentBreakdown.length === 0 ? (
            <p className="pt-8 text-center text-xs text-neutral-400">No payment data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.paymentBreakdown}
                  dataKey="count"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {data.paymentBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order status pie */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-neutral-900">Order Status</h2>
          {data.statusBreakdown.filter((s) => s.count > 0).length === 0 ? (
            <p className="pt-8 text-center text-xs text-neutral-400">No order data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {data.statusBreakdown.filter((s) => s.count > 0).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
