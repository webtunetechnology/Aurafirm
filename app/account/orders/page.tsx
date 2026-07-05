import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyOrders } from "@/lib/actions"
import OrdersPageClient from "./OrdersPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Orders",
  description:
    "View and track all your AURAFIRM orders. Check order status, view details, and manage your purchases.",
  alternates: { canonical: "/account/orders" },
  robots: { index: false, follow: false },
}

export default async function MyOrdersPage() {
  // Run auth + data fetch on the server where cookies are always available.
  // This eliminates the client-side auth race and hanging spinner entirely.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/account/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const orders = await getMyOrders()

  return (
    <OrdersPageClient
      initialOrders={orders}
      customerName={profile?.full_name ?? ""}
    />
  )
}
