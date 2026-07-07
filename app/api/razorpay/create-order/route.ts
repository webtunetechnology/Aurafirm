import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "INR", receipt } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err: unknown) {
    // Surface the real Razorpay error (e.g. 401 bad credentials, amount issues)
    const razorpayErr = err as { statusCode?: number; error?: { description?: string } }
    const message = razorpayErr?.error?.description
      || (err instanceof Error ? err.message : "Failed to create Razorpay order")
    console.error("[v0] create-order error:", JSON.stringify(err))
    return NextResponse.json({ error: message }, { status: razorpayErr?.statusCode ?? 500 })
  }
}
