"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Save, Plus, Pencil, Trash2, X, Eye, EyeOff, ExternalLink,
  BookOpen, Clock, Heart,
} from "lucide-react"
import {
  adminUpdateOurStoryContent,
  adminUpsertOurStoryMilestone,
  adminDeleteOurStoryMilestone,
  adminUpsertOurStoryValue,
  adminDeleteOurStoryValue,
} from "@/lib/actions"

const ICON_OPTIONS = ["FlaskConical","Leaf","Heart","Users","Sparkles","Globe","Award","Star","Zap","Sun","ShieldCheck","Sprout"]

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:bg-white transition-colors"
const labelCls = "block text-xs font-semibold text-neutral-600 mb-1"

type Content = {
  hero_tag: string; hero_heading: string; hero_subtext: string; hero_image: string
  mission_heading: string; mission_body: string
  founder_name: string; founder_quote: string; founder_image: string
}
type Milestone = { id: string; sort_order: number; year: string; title: string; description: string; is_active: boolean }
type Value = { id: string; sort_order: number; icon: string; title: string; description: string; is_active: boolean }

const EMPTY_MILESTONE: Omit<Milestone, "id"> = { sort_order: 0, year: "", title: "", description: "", is_active: true }
const EMPTY_VALUE: Omit<Value, "id"> = { sort_order: 0, icon: "Heart", title: "", description: "", is_active: true }

export default function AdminOurStoryClient({
  content: initialContent,
  milestones: initialMilestones,
  values: initialValues,
}: {
  content: Content
  milestones: Milestone[]
  values: Value[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // tabs
  const [tab, setTab] = useState<"content" | "milestones" | "values">("content")

  // content form
  const [content, setContent] = useState<Content>(initialContent)
  const [contentSaved, setContentSaved] = useState(false)

  // milestones
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [editingMilestone, setEditingMilestone] = useState<Partial<Milestone> | null>(null)

  // values
  const [values, setValues] = useState<Value[]>(initialValues)
  const [editingValue, setEditingValue] = useState<Partial<Value> | null>(null)

  // ── Content ──────────────────────────────────────────────────────────────────
  function handleContentSave() {
    startTransition(async () => {
      await adminUpdateOurStoryContent(content as Record<string, string>)
      setContentSaved(true)
      setTimeout(() => setContentSaved(false), 2500)
      router.refresh()
    })
  }

  // ── Milestones ───────────────────────────────────────────────────────────────
  function handleMilestoneSave() {
    if (!editingMilestone?.year || !editingMilestone?.title || !editingMilestone?.description) return
    startTransition(async () => {
      await adminUpsertOurStoryMilestone(editingMilestone as Milestone)
      setEditingMilestone(null)
      router.refresh()
    })
  }

  async function handleMilestoneDelete(id: string) {
    startTransition(async () => {
      await adminDeleteOurStoryMilestone(id)
      setMilestones((p) => p.filter((m) => m.id !== id))
    })
  }

  // ── Values ───────────────────────────────────────────────────────────────────
  function handleValueSave() {
    if (!editingValue?.title || !editingValue?.description) return
    startTransition(async () => {
      await adminUpsertOurStoryValue(editingValue as Value)
      setEditingValue(null)
      router.refresh()
    })
  }

  async function handleValueDelete(id: string) {
    startTransition(async () => {
      await adminDeleteOurStoryValue(id)
      setValues((p) => p.filter((v) => v.id !== id))
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Our Story</h1>
            <p className="mt-0.5 text-sm text-neutral-500">Manage the public /about page content</p>
          </div>
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <ExternalLink className="h-4 w-4" /> Preview Page
          </a>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1">
          {([
            { key: "content",    label: "Page Content",  icon: BookOpen },
            { key: "milestones", label: "Timeline",       icon: Clock },
            { key: "values",     label: "Values",         icon: Heart },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-[#8a4a32] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">

        {/* ── Content tab ─────────────────────────────────────────────────── */}
        {tab === "content" && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-bold text-neutral-800">Hero Section</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Tag Line</label>
                  <input className={inputCls} value={content.hero_tag}
                    onChange={(e) => setContent((p) => ({ ...p, hero_tag: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Heading</label>
                  <input className={inputCls} value={content.hero_heading}
                    onChange={(e) => setContent((p) => ({ ...p, hero_heading: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Sub Text</label>
                  <textarea rows={3} className={inputCls} value={content.hero_subtext}
                    onChange={(e) => setContent((p) => ({ ...p, hero_subtext: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Hero Image URL (optional)</label>
                  <input className={inputCls} placeholder="https://..." value={content.hero_image}
                    onChange={(e) => setContent((p) => ({ ...p, hero_image: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-bold text-neutral-800">Mission Section</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Heading</label>
                  <input className={inputCls} value={content.mission_heading}
                    onChange={(e) => setContent((p) => ({ ...p, mission_heading: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Body Text</label>
                  <textarea rows={4} className={inputCls} value={content.mission_body}
                    onChange={(e) => setContent((p) => ({ ...p, mission_body: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-bold text-neutral-800">Founder / Quote Card</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Founder Name</label>
                  <input className={inputCls} value={content.founder_name}
                    onChange={(e) => setContent((p) => ({ ...p, founder_name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Founder Quote</label>
                  <textarea rows={3} className={inputCls} value={content.founder_quote}
                    onChange={(e) => setContent((p) => ({ ...p, founder_quote: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Founder / Brand Image URL (optional)</label>
                  <input className={inputCls} placeholder="https://..." value={content.founder_image}
                    onChange={(e) => setContent((p) => ({ ...p, founder_image: e.target.value }))} />
                </div>
              </div>
            </div>

            <button
              onClick={handleContentSave}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-[#8a4a32] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#7a3c10] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : contentSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── Milestones tab ──────────────────────────────────────────────── */}
        {tab === "milestones" && (
          <div className="max-w-3xl space-y-4">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#fdf6f2] px-3 py-0.5 text-xs font-bold text-[#c9744e]">{m.year}</span>
                    <span className="text-sm font-semibold text-neutral-900">{m.title}</span>
                    {!m.is_active && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-400">Hidden</span>}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{m.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setEditingMilestone(m)}
                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMilestoneDelete(m.id)}
                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setEditingMilestone({ ...EMPTY_MILESTONE, sort_order: milestones.length + 1 })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-4 text-sm font-medium text-neutral-500 transition-colors hover:border-[#c9744e] hover:text-[#c9744e]"
            >
              <Plus className="h-4 w-4" /> Add Milestone
            </button>

            {/* Milestone form modal */}
            {editingMilestone && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900">{editingMilestone.id ? "Edit" : "Add"} Milestone</h3>
                    <button onClick={() => setEditingMilestone(null)}><X className="h-5 w-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Year</label>
                        <input className={inputCls} placeholder="e.g. 2021" value={editingMilestone.year ?? ""}
                          onChange={(e) => setEditingMilestone((p) => ({ ...p, year: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Sort Order</label>
                        <input type="number" className={inputCls} value={editingMilestone.sort_order ?? 0}
                          onChange={(e) => setEditingMilestone((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Title</label>
                      <input className={inputCls} value={editingMilestone.title ?? ""}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea rows={3} className={inputCls} value={editingMilestone.description ?? ""}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, description: e.target.value }))} />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                      <input type="checkbox" checked={editingMilestone.is_active ?? true}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, is_active: e.target.checked }))} />
                      Visible on public page
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setEditingMilestone(null)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                      Cancel
                    </button>
                    <button onClick={handleMilestoneSave} disabled={isPending}
                      className="flex items-center gap-2 rounded-lg bg-[#8a4a32] px-5 py-2 text-sm font-bold text-white hover:bg-[#7a3c10] disabled:opacity-60">
                      <Save className="h-4 w-4" /> Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Values tab ──────────────────────────────────────────────────── */}
        {tab === "values" && (
          <div className="max-w-3xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((v) => (
                <div key={v.id} className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fdf6f2] text-[#c9744e] text-xs font-bold">
                    {v.icon.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900">{v.title}</span>
                      {!v.is_active && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-400">Hidden</span>}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 line-clamp-2">{v.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => setEditingValue(v)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleValueDelete(v.id)} className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setEditingValue({ ...EMPTY_VALUE, sort_order: values.length + 1 })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-4 text-sm font-medium text-neutral-500 transition-colors hover:border-[#c9744e] hover:text-[#c9744e]"
            >
              <Plus className="h-4 w-4" /> Add Value
            </button>

            {/* Value form modal */}
            {editingValue && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900">{editingValue.id ? "Edit" : "Add"} Value</h3>
                    <button onClick={() => setEditingValue(null)}><X className="h-5 w-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Icon</label>
                        <select className={inputCls} value={editingValue.icon ?? "Heart"}
                          onChange={(e) => setEditingValue((p) => ({ ...p, icon: e.target.value }))}>
                          {ICON_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Sort Order</label>
                        <input type="number" className={inputCls} value={editingValue.sort_order ?? 0}
                          onChange={(e) => setEditingValue((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Title</label>
                      <input className={inputCls} value={editingValue.title ?? ""}
                        onChange={(e) => setEditingValue((p) => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea rows={3} className={inputCls} value={editingValue.description ?? ""}
                        onChange={(e) => setEditingValue((p) => ({ ...p, description: e.target.value }))} />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                      <input type="checkbox" checked={editingValue.is_active ?? true}
                        onChange={(e) => setEditingValue((p) => ({ ...p, is_active: e.target.checked }))} />
                      Visible on public page
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setEditingValue(null)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                      Cancel
                    </button>
                    <button onClick={handleValueSave} disabled={isPending}
                      className="flex items-center gap-2 rounded-lg bg-[#8a4a32] px-5 py-2 text-sm font-bold text-white hover:bg-[#7a3c10] disabled:opacity-60">
                      <Save className="h-4 w-4" /> Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
