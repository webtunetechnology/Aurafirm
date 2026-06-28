"use client"

import { useState, useEffect } from "react"
import { Search, Users, ShoppingBag, IndianRupee, UserCheck } from "lucide-react"
import { adminGetCustomers } from "@/lib/actions"

type Customer = Awaited<ReturnType<typeof adminGetCustomers>>[number]

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    adminGetCustomers().then((data) => {
      setCustomers(data)
      setLoading(false)
    })
  }, [])

  const filtered = customers.filter(
    (c) =>
      (c.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search)
  )

  const totalSpend = customers.reduce((s, c) => s + (c.total_spend ?? 0), 0)
  const avgSpend = customers.length > 0 ? Math.round(totalSpend / customers.length) : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Customers</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            All registered customers and their order history.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { title: "Total Customers", value: customers.length, icon: Users, prefix: "" },
          { title: "Active Customers", value: customers.filter((c) => (c.order_count ?? 0) > 0).length, icon: UserCheck, prefix: "" },
          { title: "Total Revenue", value: totalSpend.toLocaleString("en-IN"), icon: IndianRupee, prefix: "₹" },
          { title: "Avg. Spend / Customer", value: avgSpend.toLocaleString("en-IN"), icon: ShoppingBag, prefix: "₹" },
        ].map(({ title, value, icon: Icon, prefix }) => (
          <div key={title} className="flex items-start justify-between rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs text-neutral-500">{title}</p>
              <p className="mt-1 text-2xl font-extrabold text-neutral-900">{prefix}{value}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf0e8]">
              <Icon className="h-5 w-5 text-[#c9744e]" />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-3 text-xs outline-none focus:border-[#c9744e]"
        />
      </div>

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
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Total Spend</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id} className="hover:bg-neutral-50/60">
                      <td className="px-4 py-3 text-neutral-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fdf0e8] text-xs font-bold text-[#c9744e]">
                            {(c.full_name ?? "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">{c.full_name ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{c.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-neutral-800">{c.order_count ?? 0}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-800">
                        ₹{(c.total_spend ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            (c.order_count ?? 0) > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {(c.order_count ?? 0) > 0 ? "Active" : "No Orders"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
