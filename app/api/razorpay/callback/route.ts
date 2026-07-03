import { NextRequest, NextResponse } from "next/server"
import { finalizeRazorpayOrder } from "@/lib/actions"

// Razorpay redirect-mode callback. When the merchant account uses redirect
// mode (or a callback_url is supplied), Razorpay submits a form POST to this
// URL after payment instead of calling the client-side handler. We verify the
// signature server-side, mark the pending order as paid, then 303-redirect the
// browser to the success page. This is what prevents the post-payment 404 /
// "This page couldn't load" screen.
export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin

  try {
    const form = await req.formData()
    const razorpayPaymentId = String(form.get("razorpay_payment_id") ?? "")
    const razorpayOrderId = String(form.get("razorpay_order_id") ?? "")
    const razorpaySignature = String(form.get("razorpay_signature") ?? "")

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.redirect(`${origin}/checkout?payment=failed`, 303)
    }

    const result = await finalizeRazorpayOrder({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })

    if (!result.ok) {
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

// If Razorpay (or a user) hits this URL with GET, send them somewhere sane
// instead of a 404.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(`${req.nextUrl.origin}/checkout`, 303)
}
