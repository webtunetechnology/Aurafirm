import { notFound } from "next/navigation"
import { getProductBySlug, getProductReviews, getMyReview } from "@/lib/actions"
import { createClient } from "@/lib/supabase/server"
import ProductPageClient from "@/components/ProductPageClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product not found" }
  return {
    title: `${product.name} | AuraFirm`,
    description: product.description,
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
