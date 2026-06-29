"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  GripVertical,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { adminUpsertWhyPillar, adminDeleteWhyPillar } from "@/lib/actions"
import { useRouter } from "next/navigation"

const ICON_OPTIONS = [
  "FlaskConical",
  "Leaf",
  "ShieldCheck",
  "Sparkles",
  "Globe",
  "Award",
  "Heart",
  "Star",
  "Zap",
  "Sun",
]

type Pillar = {
  id: string
  sort_order: number
  icon: string
  title: string
  subtitle: string
  description: string
  stat_value: string
  stat_label: string
  is_active: boolean
}

const EMPTY_PILLAR: Omit<Pillar, "id"> = {
  sort_order: 0,
  icon: "Sparkles",
  title: "",
  subtitle: "",
  description: "",
  stat_value: "",
  stat_label: "",
  is_active: true,
}

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:bg-white transition-colors"

function PillarForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Omit<Pillar, "id"> & { id?: string }
  onSave: (data: Omit<Pillar, "id"> & { id?: string }) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form, v: string | boolean | number) =>
    setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="rounded-2xl border border-[#f0d8c8] bg-[#fdf6f2] p-6">
      <h3 className="mb-5 font-bold text-neutral-800">
        {initial.id ? "Edit Pillar" : "New Pillar"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Title *</label>
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Science-Backed Formulations"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Subtitle</label>
          <input
            className={inputCls}
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="e.g. Research-driven, results-proven"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Icon</label>
          <select
            className={inputCls}
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
          >
            {ICON_OPTIONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Description *</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Explain this pillar in 2–3 sentences…"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Stat Value</label>
          <input
            className={inputCls}
            value={form.stat_value}
            onChange={(e) => set("stat_value", e.target.value)}
            placeholder="e.g. 50,000+"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Stat Label</label>
          <input
            className={inputCls}
            value={form.stat_label}
            onChange={(e) => set("stat_label", e.target.value)}
            placeholder="e.g. Happy Customers"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Sort Order</label>
          <input
            type="number"
            className={inputCls}
            value={form.sort_order}
            onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <div
              className={`relative h-5 w-9 rounded-full transition-colors ${
                form.is_active ? "bg-[#c9744e]" : "bg-neutral-300"
              }`}
              onClick={() => set("is_active", !form.is_active)}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  form.is_active ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-neutral-700">Active (visible on page)</span>
          </label>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim() || !form.description.trim()}
          className="flex items-center gap-2 rounded-lg bg-[#8B4513] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#7a3c10]"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save Pillar"}
        </button>
      </div>
    </div>
  )
}

export default function AdminWhyAurafirmClient({ pillars: initial }: { pillars: Pillar[] }) {
  const router = useRouter()
  const [pillars, setPillars] = useState<Pillar[]>(initial)
  const [editing, setEditing] = useState<(Omit<Pillar, "id"> & { id?: string }) | null>(null)
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = (data: Omit<Pillar, "id"> & { id?: string }) => {
    startTransition(async () => {
      await adminUpsertWhyPillar(data as Parameters<typeof adminUpsertWhyPillar>[0])
      setEditing(null)
      setAdding(false)
      showToast("Pillar saved successfully")
      router.refresh()
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this pillar? This cannot be undone.")) return
    setDeletingId(id)
    startTransition(async () => {
      await adminDeleteWhyPillar(id)
      setPillars((p) => p.filter((x) => x.id !== id))
      setDeletingId(null)
      showToast("Pillar deleted")
    })
  }

  return (
    <div className="mx-auto max-w-4xl">

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-[#6b8f5e] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Why AURAFIRM</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Manage the brand pillars shown on the{" "}
            <a
              href="/why-aurafirm"
              target="_blank"
              className="inline-flex items-center gap-1 text-[#c9744e] hover:underline"
            >
              /why-aurafirm <ExternalLink className="h-3 w-3" />
            </a>{" "}
            page.
          </p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          className="flex items-center gap-2 rounded-xl bg-[#8B4513] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7a3c10]"
        >
          <Plus className="h-4 w-4" /> Add Pillar
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-6">
          <PillarForm
            initial={{ ...EMPTY_PILLAR, sort_order: pillars.length + 1 }}
            onSave={handleSave}
            onCancel={() => setAdding(false)}
            saving={isPending}
          />
        </div>
      )}

      {/* Pillar list */}
      <div className="flex flex-col gap-4">
        {pillars.map((pillar) => (
          <div key={pillar.id}>
            {editing?.id === pillar.id ? (
              <PillarForm
                initial={editing}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                saving={isPending}
              />
            ) : (
              <div className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                <GripVertical className="mt-1 h-4 w-4 shrink-0 text-neutral-300" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                      #{pillar.sort_order}
                    </span>
                    <span className="rounded bg-[#fdf0e8] px-2 py-0.5 text-[10px] font-medium text-[#c9744e]">
                      {pillar.icon}
                    </span>
                    {!pillar.is_active && (
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-neutral-900">{pillar.title}</h3>
                  {pillar.subtitle && (
                    <p className="text-xs font-medium text-[#c9744e]">{pillar.subtitle}</p>
                  )}
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{pillar.description}</p>
                  {pillar.stat_value && (
                    <p className="mt-1 text-xs text-neutral-400">
                      Stat: <strong className="text-neutral-700">{pillar.stat_value}</strong>{" "}
                      {pillar.stat_label}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setEditing(pillar)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-[#c9744e] hover:text-[#c9744e]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pillar.id)}
                    disabled={deletingId === pillar.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-red-400 hover:text-red-500 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {pillars.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
          <Sparkles className="mb-3 h-8 w-8 text-neutral-300" />
          <p className="font-semibold text-neutral-500">No pillars yet</p>
          <p className="mt-1 text-sm text-neutral-400">Click &quot;Add Pillar&quot; to get started.</p>
        </div>
      )}
    </div>
  )
}
