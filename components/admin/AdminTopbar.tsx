"use client"

import { Bell, Search, MessageSquare, ChevronDown, User } from "lucide-react"

export default function AdminTopbar({ adminName }: { adminName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/20 bg-[#7d3c1f] px-6">
      {/* Logo text */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tracking-widest text-white/90 uppercase">AURAFIRM</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button aria-label="Search" className="text-white/70 hover:text-white">
          <Search className="h-4 w-4" />
        </button>
        <button aria-label="Notifications" className="relative text-white/70 hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white">
            6
          </span>
        </button>
        <button aria-label="Messages" className="text-white/70 hover:text-white">
          <MessageSquare className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-none">{adminName}</p>
            <p className="text-[10px] text-white/60 leading-none mt-0.5">Super Admin</p>
          </div>
          <ChevronDown className="h-3 w-3 text-white/60" />
        </div>
      </div>
    </header>
  )
}
