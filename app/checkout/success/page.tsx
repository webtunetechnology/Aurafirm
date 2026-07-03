import Link from "next/link"
import { Check } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/server"
import ClearCart from "./ClearCart"

export const metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderNumber } = await searchParams

  let email = ""
  let confirmedNumber = orderNumber ?? ""

  if (orderNumber) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("orders")
      .select("order_number, customer_email")
      .eq("order_number", orderNumber)
      .maybeSingle()
    if (data) {
      confirmedNumber = data.order_number as string
      email = (data.customer_email as string) ?? ""
    }
  }

  return (
    <div className="min-h-screen bg-[#faf5f3] font-sans text-neutral-800">
      {/* Payment succeeded — safe to empty the cart */}
      <ClearCart />

      <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#eef5eb]">
          <Check className="h-12 w-12 text-[#6b8f5e]" />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          Order <span className="text-[#c9744e]">Confirmed!</span>
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600">
          Thank you for shopping with AURAFIRM. Your payment was successful and your order has been
          placed. It will be shipped within 24 hours{email ? <>
            {" "}and a confirmation will be sent to <strong>{email}</strong></> : null}.
        </p>
        {confirmedNumber && (
          <p className="rounded-lg bg-[#f5ece6] px-4 py-2 text-xs font-mono text-neutral-700">
            Order Number: <strong>{confirmedNumber}</strong>
          </p>
        )}
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-700">
          Your account has been created. Login with your mobile number to track orders.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-[#8B4513] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7a3c10]"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="rounded-xl border border-[#c9744e] px-8 py-3 text-sm font-bold text-[#c9744e] transition-colors hover:bg-[#fdf6f2]"
          >
            Track Order
          </Link>
        </div>
      </main>
    </div>
  )
}
