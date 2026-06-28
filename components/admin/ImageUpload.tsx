"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, X, Loader2, ImageIcon, CheckCircle2 } from "lucide-react"

interface Props {
  /** Current public URL — shown as the preview */
  value: string
  /** Called with the new public URL after a successful upload */
  onChange: (url: string) => void
  /** Supabase storage folder path, e.g. "products/serum" */
  folder?: string
  /** Compact single-line version for gallery items */
  compact?: boolean
  /** Alt text for preview image */
  alt?: string
}

type UploadState = "idle" | "uploading" | "success" | "error"

export default function ImageUpload({ value, onChange, folder = "misc", compact = false, alt = "preview" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (JPG, PNG, WebP).")
      setState("error")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 10 MB.")
      setState("error")
      return
    }

    setState("uploading")
    setProgress(0)
    setErrorMsg("")

    // Fake progress ticks while we wait for the response
    const tick = setInterval(() => setProgress((p) => Math.min(p + 12, 85)), 120)

    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", folder)

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      clearInterval(tick)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Upload failed (${res.status})`)
      }

      const { url } = await res.json()
      setProgress(100)
      setState("success")
      onChange(url)
      // Reset to idle after short pause so the checkmark is visible
      setTimeout(() => setState("idle"), 1500)
    } catch (err) {
      clearInterval(tick)
      setErrorMsg(err instanceof Error ? err.message : "Upload failed")
      setState("error")
    }
  }, [folder, onChange])

  const handleFiles = useCallback((files: FileList | null) => {
    if (files?.[0]) upload(files[0])
  }, [upload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const clear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setState("idle")
    setErrorMsg("")
  }, [onChange])

  // ── Compact mode (used for gallery items) ──────────────────────────────
  if (compact) {
    return (
      <div className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 transition-colors hover:border-[#c9744e]">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {value ? (
          <>
            <img src={value} alt={alt} className="h-full w-full object-contain mix-blend-multiply" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-white/90 p-1.5 text-neutral-700 hover:bg-white"
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={clear}
                className="ml-1 rounded-full bg-white/90 p-1.5 text-red-500 hover:bg-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : state === "uploading" ? (
          <div className="flex flex-col items-center gap-1">
            <Loader2 className="h-5 w-5 animate-spin text-[#c9744e]" />
            <span className="text-[10px] text-[#c9744e]">{progress}%</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-neutral-300 hover:text-[#c9744e]"
          >
            <Upload className="h-5 w-5" />
            <span className="text-[9px] font-semibold uppercase tracking-wide">Upload</span>
          </button>
        )}
        {state === "uploading" && !value && null /* handled above */}
      </div>
    )
  }

  // ── Full mode ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        onClick={() => state !== "uploading" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed p-6 transition-all ${
          dragOver
            ? "border-[#c9744e] bg-[#fdf8f5]"
            : state === "error"
            ? "border-red-300 bg-red-50"
            : state === "success"
            ? "border-green-400 bg-green-50"
            : "border-neutral-200 bg-neutral-50 hover:border-[#c9744e] hover:bg-[#fdf8f5]"
        }`}
      >
        {/* Progress bar overlay */}
        {state === "uploading" && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-neutral-100">
            <div
              className="h-full bg-[#c9744e] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {state === "uploading" ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#c9744e]" />
            <p className="text-sm font-semibold text-[#c9744e]">Uploading… {progress}%</p>
          </div>
        ) : state === "success" ? (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm font-semibold text-green-600">Uploaded!</p>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf0e8]">
              <Upload className="h-5 w-5 text-[#c9744e]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-700">
                {dragOver ? "Drop to upload" : "Click or drag image here"}
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">JPG, PNG, WebP up to 10 MB</p>
            </div>
          </>
        )}
      </div>

      {/* Preview strip */}
      {value && state !== "uploading" && (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#fdf0e8]">
            <img src={value} alt={alt} className="h-full w-full object-contain mix-blend-multiply" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-neutral-500">{value.split("/").pop()}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-1 text-xs font-semibold text-[#c9744e] hover:underline"
            >
              Replace image
            </button>
          </div>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-lg p-1.5 text-neutral-300 hover:bg-red-50 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error message */}
      {state === "error" && errorMsg && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <X className="h-3.5 w-3.5 shrink-0" />
          {errorMsg}
        </p>
      )}
    </div>
  )
}
