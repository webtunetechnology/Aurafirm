import { NextRequest, NextResponse } from "next/server"
import { createOrder, finalizeRazorpayOrder } from "@/lib/actions"

// Razorpay redirect-mode callback.
// The order payload is passed as base64 JSON in the `d` query param so we
// ONLY create the order after the payment signature is verified — a failed or
// dismissed payment never creates a DB record.
export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin

  try {
    const form = await req.formData()
    const razorpayPaymentId = String(form.get("razorpay_payment_id") ?? "")
    const razorpayOrderId   = String(form.get("razorpay_order_id")   ?? "")
    const razorpaySignature = String(form.get("razorpay_signature")  ?? "")

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.redirect(`${origin}/checkout?payment=failed`, 303)
    }

    // Decode order payload from callback_url query param
    const rawPayload = req.nextUrl.searchParams.get("d")
    if (!rawPayload) {
      console.error("[v0] callback: missing order payload")
      return NextResponse.redirect(`${origin}/checkout?payment=failed`, 303)
    }

    let orderData: Record<string, unknown>
    try {
      orderData = JSON.parse(new TextDecoder().decode(Buffer.from(decodeURIComponent(rawPayload), "base64")))
    } catch {
      console.error("[v0] callback: invalid order payload")
      return NextResponse.redirect(`${origin}/checkout?payment=failed`, 303)
    }

    // 1. Create the order (payment_status=pending, will be updated below)
    const created = await createOrder({
      ...(orderData as unknown as Parameters<typeof createOrder>[0]),
      paymentStatus:  "pending",
      razorpayOrderId,
    })

    // 2. Verify signature + mark paid — if this fails, order stays pending
    //    (admin can investigate) but the customer is not double-charged
    const result = await finalizeRazorpayOrder({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })

    if (!result.ok) {
      console.error("[v0] callback: signature invalid for order", created.orderNumber)
      return NextResponse.redirect(`${origin}/checkout?payment=failed`, 303)
    }

    return NextResponse.redirect(
      `${origin}/checkout/success?order=${encodeURIComponent(result.orderNumber ?? "")}`,
      303,
    )
  } catch (err) {
    console.error("[v0] razorpay callback error:", err)
    return NextResponse.redirect(`${origin}/checkout?payment=failed`, 303)
  }
}

// Stray GET requests (browser back-button, link previews) → back to checkout
export async function GET(req: NextRequest) {
  return NextResponse.redirect(`${req.nextUrl.origin}/checkout`, 303)
}
