import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/actions"
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
  return <ProductPageClient product={product} />
}
