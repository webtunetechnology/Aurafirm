"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { adminUpsertPromoBanner, adminDeletePromoBanner } from "@/lib/actions"
import { Plus, Trash2, ToggleLeft, ToggleRight, Upload, ExternalLink, GripVertical } from "lucide-react"

type Banner = {
  id: string
  sort_order: number
  image_url: string
  alt_text: string
  link_url?: string | null
  is_active: boolean
}

type AdminBannersClientProps = {
  banners: Banner[]
}

const EMPTY: Omit<Banner, "id"> = {
  sort_order: 0,
  image_url: "",
  alt_text: "",
  link_url: "",
  is_active: true,
}

export default function AdminBannersClient({ banners: initial }: AdminBannersClientProps) {
  const [banners, setBanners] = useState<Banner[]>(initial)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState<Omit<Banner, "id">>(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState("")

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  function openNew() {
    setEditing({ id: "", ...EMPTY, sort_order: banners.length + 1 })
    setForm({ ...EMPTY, sort_order: banners.length + 1 })
  }

  function openEdit(b: Banner) {
    setEditing(b)
    setForm({ sort_order: b.sort_order, image_url: b.image_url, alt_text: b.alt_text, link_url: b.link_url ?? "", is_active: b.is_active })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()
      const path = `banners/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from("owner").upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from("owner").getPublicUrl(path)
      setForm((f) => ({ ...f, image_url: data.publicUrl }))
      showToast("Image uploaded successfully.")
    } catch (err) {
      showToast("Upload failed. Please try again.")
      console.error("[v0] banner upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!form.image_url) { showToast("Please upload or enter an image URL."); return }
    startTransition(async () => {
      try {
        await adminUpsertPromoBanner({ ...(editing?.id ? { id: editing.id } : {}), ...form })
        showToast(editing?.id ? "Banner updated." : "Banner added.")
        setEditing(null)
        // Refresh list from server
        window.location.reload()
      } catch {
        showToast("Save failed. Please try again.")
      }
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return
    startTransition(async () => {
      try {
        await adminDeletePromoBanner(id)
        setBanners((prev) => prev.filter((b) => b.id !== id))
        showToast("Banner deleted.")
      } catch {
        showToast("Delete failed.")
      }
    })
  }

  async function handleToggle(banner: Banner) {
    startTransition(async () => {
      try {
        await adminUpsertPromoBanner({ ...banner, is_active: !banner.is_active })
        setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      } catch {
        showToast("Update failed.")
      }
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Promo Banners</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage the two promotional banners on the homepage.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-[#c9744e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b86244] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 rounded-xl bg-[#fdf0e8] border border-[#e8c4a8] px-4 py-3 text-sm text-[#8a4a32] font-medium">
          {toast}
        </div>
      )}

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-16 text-center text-neutral-400">
          <Upload className="mx-auto h-8 w-8 mb-3 opacity-40" />
          <p className="text-sm font-medium">No banners yet. Add your first banner.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-opacity ${!banner.is_active ? "opacity-50" : ""}`}
            >
              <GripVertical className="h-4 w-4 text-neutral-300 shrink-0" />

              {/* Preview */}
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                <Image
                  src={banner.image_url}
                  alt={banner.alt_text || "Banner"}
                  width={128}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-800 truncate">{banner.alt_text || "Untitled banner"}</p>
                {banner.link_url && (
                  <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#c9744e] mt-0.5 truncate hover:underline">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {banner.link_url}
                  </a>
                )}
                <p className="text-xs text-neutral-400 mt-1">Order: {banner.sort_order}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(banner)}
                  title={banner.is_active ? "Deactivate" : "Activate"}
                  className="text-neutral-400 hover:text-[#c9744e] transition-colors"
                >
                  {banner.is_active
                    ? <ToggleRight className="h-5 w-5 text-[#c9744e]" />
                    : <ToggleLeft className="h-5 w-5" />
                  }
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="rounded-lg border border-red-100 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
            <h2 className="text-lg font-bold text-neutral-800 mb-5">
              {editing.id ? "Edit Banner" : "Add Banner"}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Banner Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-[#c9744e] px-4 py-2.5 text-sm font-medium text-[#c9744e] hover:bg-[#fdf0e8] transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <span className="text-xs text-neutral-400">or paste URL below</span>
                </div>
                {form.image_url && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
                    <Image src={form.image_url} alt="Preview" width={600} height={300} className="h-36 w-full object-contain" />
                  </div>
                )}
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]"
                />
              </div>

              {/* Alt text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Alt Text</label>
                <input
                  type="text"
                  placeholder="e.g. Special skincare offer 50% off"
                  value={form.alt_text}
                  onChange={(e) => setForm((f) => ({ ...f, alt_text: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Link URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://aurafirm.com/shop"
                  value={form.link_url ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]"
                />
              </div>

              {/* Sort order + Active */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]"
                  />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="h-4 w-4 accent-[#c9744e]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">Active</label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || uploading}
                className="rounded-xl bg-[#c9744e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#b86244] disabled:opacity-60 transition-colors"
              >
                {isPending ? "Saving..." : "Save Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
