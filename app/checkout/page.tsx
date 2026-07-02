import type { Metadata } from "next"
import CheckoutPageClient from "./CheckoutPageClient"

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your AURAFIRM order securely. Fast delivery, secure payment, and easy returns guaranteed.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return <CheckoutPageClient />
}
