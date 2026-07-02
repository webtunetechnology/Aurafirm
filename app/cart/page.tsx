import type { Metadata } from "next"
import CartPageClient from "./CartPageClient"

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your AURAFIRM skincare and wellness selections before checkout. Free shipping available on all orders.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <CartPageClient />
}
