"use client"

import { useState, useTransition } from "react"
import {
  Search, Mail, Phone, Clock, CheckCircle, MessageSquare,
  Eye, RotateCcw, ChevronDown,
} from "lucide-react"
import { adminUpdateContactStatus } from "@/lib/actions"
import { useRouter } from "next/navigation"

type Message = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: "unread" | "read" | "replied"
  created_at: string
}

const STATUS_META = {
  unread:  { label: "Unread",  bg: "bg-amber-100",  color: "text-amber-700" },
  read:    { label: "Read",    bg: "bg-blue-100",   color: "text-blue-700" },
  replied: { label: "Replied", bg: "bg-green-100",  color: "text-green-700" },
}

function StatusBadge({ status }: { status: Message["status"] }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  )
}

export default function AdminContactsClient({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Message["status"]>("all")
  const [selected, setSelected] = useState<Message | null>(null)

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || m.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: messages.length,
    unread: messages.filter((m) => m.status === "unread").length,
    read: messages.filter((m) => m.status === "read").length,
    replied: messages.filter((m) => m.status === "replied").length,
  }

  function handleUpdateStatus(id: string, status: "read" | "replied") {
    startTransition(async () => {
      await adminUpdateContactStatus(id, status)
      router.refresh()
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s)
    })
  }

  function openMessage(msg: Message) {
    setSelected(msg)
    if (msg.status === "unread") handleUpdateStatus(msg.id, "read")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Contact Messages</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{counts.unread} unread of {counts.all} total</p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "unread", "read", "replied"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
              statusFilter === s
                ? "bg-[#c9744e] text-white"
                : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {s === "all" ? "All" : STATUS_META[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or subject..."
          className="w-full bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none"
        />
      </div>

      {/* Layout: list + detail panel */}
      <div className="flex gap-4 overflow-hidden">

        {/* Message list */}
        <div className={`flex flex-col gap-2 overflow-y-auto ${selected ? "w-96 shrink-0" : "w-full"}`}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
              <MessageSquare className="h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-500">No messages found</p>
            </div>
          ) : (
            filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`flex w-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors ${
                  selected?.id === msg.id
                    ? "border-[#c9744e] bg-[#fdf6f2]"
                    : msg.status === "unread"
                    ? "border-amber-200 bg-amber-50 hover:border-amber-300"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {msg.status === "unread" && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    )}
                    <span className="text-sm font-semibold text-neutral-900 line-clamp-1">{msg.name}</span>
                  </div>
                  <StatusBadge status={msg.status} />
                </div>
                <p className="text-xs font-medium text-[#c9744e]">{msg.subject}</p>
                <p className="line-clamp-2 text-xs text-neutral-500">{msg.message}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{msg.email}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(msg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">{selected.subject}</h2>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selected.email}</span>
                  {selected.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />+91 {selected.phone}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(selected.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {/* Sender info */}
            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf0e8] text-sm font-bold text-[#c9744e]">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{selected.name}</p>
                <p className="text-xs text-neutral-500">{selected.email}</p>
              </div>
            </div>

            {/* Message body */}
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{selected.message}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
              {selected.status !== "replied" && (
                <button
                  onClick={() => handleUpdateStatus(selected.id, "replied")}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c9744e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b86244] disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark as Replied
                </button>
              )}
              {selected.status === "replied" && (
                <button
                  onClick={() => handleUpdateStatus(selected.id, "read")}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Mark as Read
                </button>
              )}
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                <Mail className="h-3.5 w-3.5" />
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
