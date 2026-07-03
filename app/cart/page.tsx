import type { Metadata } from "next"
import CartPageClient from "./CartPageClient"
import { getProducts } from "@/lib/actions"

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your AURAFIRM skincare and wellness selections before checkout. Free shipping available on all orders.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
}

export default async function CartPage() {
  const products = await getProducts().catch(() => [])

  const suggestedProducts = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle ?? p.category ?? "",
    price: p.price,
    href: `/product/${p.slug ?? p.id}`,
    image: p.image_url ?? "",
    tags: (p.tags ?? []) as string[],
  }))

  return <CartPageClient suggestedProducts={suggestedProducts} />
}
