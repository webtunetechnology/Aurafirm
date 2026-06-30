"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"

interface AdminLayoutClientProps {
  adminName: string
  pendingCount: number
  children: React.ReactNode
}

export default function AdminLayoutClient({ adminName, pendingCount, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#faf8f6] overflow-hidden">
      <AdminSidebar
        pendingCount={pendingCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminTopbar
          adminName={adminName}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
