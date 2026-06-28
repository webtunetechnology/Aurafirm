import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

const BUCKET = "product-images"

// Ensure bucket exists (idempotent)
async function ensureBucket() {
  const supabase = createAdminClient()
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === BUCKET)
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string | null) ?? "misc"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    await ensureBucket()

    const supabase = createAdminClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
