import { notFound } from "next/navigation"
import { getProductBySlug, getProductReviews, getMyReview } from "@/lib/actions"
import { createClient } from "@/lib/supabase/server"
import ProductPageClient from "@/components/ProductPageClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<import("next").Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product Not Found" }

  const title = product.name
  const description = product.subtitle
    ? `${product.subtitle}. ${product.description?.slice(0, 120)}…`
    : product.description?.slice(0, 155) ?? ""
  const image = product.image_url || "/og-image.jpg"
  const url = `/product/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} | AURAFIRM`,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | AURAFIRM`,
      description,
      images: [image],
    },
  }
}

export default async function ProductSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  // Fetch auth state + reviews in parallel
  const supabase = await createClient()
  const [{ data: { user } }, reviews, existingReview] = await Promise.all([
    supabase.auth.getUser(),
    getProductReviews(product.id),
    getMyReview(product.id),
  ])

  return (
    <ProductPageClient
      product={product}
      initialReviews={reviews}
      isLoggedIn={!!user}
      currentUserId={user?.id ?? null}
      existingReview={existingReview}
    />
  )
}
