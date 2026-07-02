import type { Metadata } from "next"
import OrdersPageClient from "./OrdersPageClient"

export const metadata: Metadata = {
  title: "My Orders",
  description:
    "View and track all your AURAFIRM orders. Check order status, view details, and manage your purchases.",
  alternates: { canonical: "/account/orders" },
  robots: { index: false, follow: false },
}

export default function MyOrdersPage() {
  return <OrdersPageClient />
}
