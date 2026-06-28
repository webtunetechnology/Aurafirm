"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts"
import { TrendingUp, Package } from "lucide-react"
import { adminGetAnalyticsData } from "@/lib/actions"

type AnalyticsData = Awaited<ReturnType<typeof adminGetAnalyticsData>>

const PIE_COLORS = ["#c9744e", "#e8a87c", "#6b8f5e", "#a0c4a8", "#8b7355", "#d4a574", "#b8d4c8"]

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetAnalyticsData().then((d) => {
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
        <h1 className="text-xl font-extrabold text-neutral-900">Analytics</h1>
        <p className="mt-0.5 text-xs text-neutral-500">Orders, product performance and category breakdown.</p>
      </div>

      {/* Daily orders + revenue (last 30 days) */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-neutral-900">Daily Orders — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.daily} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5ece6" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f0d8c8" }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#c9744e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue (₹)"
              stroke="#6b8f5e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        {/* Top Products by Revenue */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-neutral-900">Top Products by Revenue</h2>
          {data.topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <Package className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-xs">No order data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.topProducts}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5ece6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}K` : v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#c9744e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown pie */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-neutral-900">Product Categories</h2>
          {data.categoryBreakdown.length === 0 ? (
            <p className="pt-8 text-center text-xs text-neutral-400">No products yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="count"
                    nameKey="cat"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {data.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {data.categoryBreakdown.map(({ cat, count }, i) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="capitalize text-neutral-700">{cat}</span>
                    </div>
                    <span className="font-semibold text-neutral-800">{count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top products table */}
      {data.topProducts.length > 0 && (
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#c9744e]" />
            <h2 className="font-bold text-neutral-900">Top Products Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="pb-2 text-left font-semibold text-neutral-500">Product</th>
                  <th className="pb-2 text-right font-semibold text-neutral-500">Units Sold</th>
                  <th className="pb-2 text-right font-semibold text-neutral-500">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {data.topProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 font-medium text-neutral-800">{p.name}</td>
                    <td className="py-2.5 text-right text-neutral-600">{p.units}</td>
                    <td className="py-2.5 text-right font-semibold text-neutral-800">
                      ₹{p.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
