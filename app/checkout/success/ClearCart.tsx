"use client"

import { useEffect } from "react"
import { useCart } from "@/lib/cart-context"

// Clears the cart once the order is confirmed. Runs on the success page after
// the Razorpay redirect, since the original checkout page (and its state) is
// gone by the time the browser lands here.
export default function ClearCart() {
  const { clearCart } = useCart()
  useEffect(() => {
    clearCart()
  }, [clearCart])
  return null
}
