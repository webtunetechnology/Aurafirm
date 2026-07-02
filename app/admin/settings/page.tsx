"use client"

import { useState } from "react"
import { Settings, Store, Bell, Shield, Save } from "lucide-react"

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#c9744e]"

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5 border-b border-neutral-100 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf0e8]">
          <Icon className="h-4 w-4 text-[#c9744e]" />
        </div>
        <h2 className="font-bold text-neutral-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [store, setStore] = useState({
    name: "AURAFIRM",
    email: "support@aurafirm.com",
    phone: "+91",
    address: "Mumbai, Maharashtra, India",
    currency: "INR",
    tax_rate: "18",
  })

  const [notifications, setNotifications] = useState({
    new_order: true,
    low_stock: true,
    payment_failed: true,
    new_customer: false,
  })

  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Settings</h1>
          <p className="mt-0.5 text-xs text-neutral-500">Manage store configuration and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-xl bg-[#a0522d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8b4513]"
        >
          <Save className="h-3.5 w-3.5" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Store Info */}
      <SectionCard title="Store Information" icon={Store}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              { label: "Store Name",   key: "name",     type: "text"   },
              { label: "Support Email",key: "email",    type: "email"  },
              { label: "Phone",        key: "phone",    type: "text"   },
              { label: "Address",      key: "address",  type: "text"   },
              { label: "Currency",     key: "currency", type: "text"   },
              { label: "Tax Rate (%)", key: "tax_rate", type: "number" },
            ] as { label: string; key: keyof typeof store; type: string }[]
          ).map(({ label, key, type }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
              <input
                type={type}
                value={store[key]}
                onChange={(e) => setStore({ ...store, [key]: e.target.value })}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notification Preferences" icon={Bell}>
        <div className="space-y-3">
          {(
            [
              { key: "new_order",      label: "New Order",       desc: "Get notified when a new order is placed."              },
              { key: "low_stock",      label: "Low Stock Alert", desc: "Alert when a product stock falls below 20 units."       },
              { key: "payment_failed", label: "Payment Failed",  desc: "Notify on failed payment attempts."                    },
              { key: "new_customer",   label: "New Customer",    desc: "Notify when a new customer account is created."        },
            ] as { key: keyof typeof notifications; label: string; desc: string }[]
          ).map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">{label}</p>
                <p className="text-xs text-neutral-400">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  notifications[key] ? "bg-[#c9744e]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    notifications[key] ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security" icon={Shield}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-neutral-800">Admin Account</p>
              <p className="text-xs text-neutral-400">admin@aurafirm.com</p>
            </div>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
              Active
            </span>
          </div>
          <div className="rounded-xl border border-neutral-100 px-4 py-4">
            <p className="text-sm font-medium text-neutral-800">Change Password</p>
            <p className="mb-3 text-xs text-neutral-400">Update the admin panel password.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">New Password</label>
                <input type="password" placeholder="••••••••" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">Confirm Password</label>
                <input type="password" placeholder="••••••••" className={inputCls} />
              </div>
            </div>
            <button className="mt-3 rounded-lg bg-[#a0522d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8b4513]">
              Update Password
            </button>
          </div>
        </div>
      </SectionCard>

      {/* About */}
      <SectionCard title="About" icon={Settings}>
        <div className="space-y-2 text-xs text-neutral-500">
          {[
            { label: "App Version",  value: "1.0.0" },
            { label: "Platform",     value: "Next.js 16 + Supabase" },
            { label: "Database",     value: "Supabase (PostgreSQL)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
              <span>{label}</span>
              <span className="font-semibold text-neutral-700">{value}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
