"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ShieldCheck,
  Truck,
  Lock,
  Leaf,
  ChevronRight,
  Check,
  Camera,
  Share2,
  Play,
  ArrowLeft,
  Search,
  ShoppingCart,
  Heart,
  Tag,
  Building2,
  Package,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { createOrder, validateCoupon } from "@/lib/actions"
import UserMenu from "@/components/UserMenu"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
]

const navItems = ["Shop", "Our Story", "Why AURAFIRM", "Contact"]

const footerColumns = [
  { title: "Company", links: ["About Us", "Blogs", "Contact Us", "Careers"] },
  { title: "Customer Services", links: ["My Account", "Track Your Order", "Returns", "FAQ"] },
  { title: "Our Information", links: ["Privacy", "User Terms & Condition", "Return Policy"] },
  {
    title: "Contact Info",
    links: ["+1 (123) 456 - 789", "care@aurafirm.com", "B-902, Preston Rd.\nInglewood, Maine 96880"],
    isContact: true,
  },
]

const brandBar = [
  { label: "for Indian Skin", sub: "Formulated in India" },
  { label: "Vegan \u2022 100%", sub: "cruelty free & plant powered" },
  { label: "Dermatest Tested", sub: "Safe for sensitive skin" },
  { label: "for Indian Skin", sub: "Formulated in India" },
  { label: "Vegan \u2022 100%", sub: "cruelty free & plant powered" },
]

const trustBadges = [
  { icon: Truck, title: "Free Shipping", sub: "On orders above ₹999" },
  { icon: Lock, title: "Secure Payment", sub: "100% protected" },
  { icon: ShieldCheck, title: "Dermatest Tested", sub: "Safe for sensitive skin" },
  { icon: Leaf, title: "Vegan", sub: "Plant Powered" },
]

const DISCOUNT = 200
const SHIPPING_STANDARD = 0
const SHIPPING_EXPRESS = 149
const TAX_RATE = 0.18
const FREE_SHIPPING_THRESHOLD = 999

type PaymentMethod = "upi" | "card" | "netbanking" | "cod"

const inputCls =
  "w-full rounded-lg border border-[#e3c8bb] bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]/30"

const labelCls = "mb-1 block text-xs font-medium text-neutral-700"

export default function CheckoutPage() {
  const { items, clearCart, itemCount } = useCart()

  // Billing
  const [billing, setBilling] = useState({
    fullName: "", email: "", phone: "", address: "", apt: "",
    city: "", state: "", pin: "", saveInfo: true,
  })

  // Shipping — ship to different address
  const [shipDifferent, setShipDifferent] = useState(false)
  const [shipping, setShipping] = useState({
    fullName: "", address: "", apt: "", city: "", state: "", pin: "",
  })

  // Delivery
  const [delivery, setDelivery] = useState<"standard" | "express">("standard")

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi")

  // Coupon
  const [coupon, setCoupon] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState("")

  // Order state
  const [placing, setPlacing] = useState(false)
  const [orderDone, setOrderDone] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [orderNumber, setOrderNumber] = useState("")

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shippingCost = delivery === "express" ? SHIPPING_EXPRESS : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_STANDARD)
  const discount = couponApplied ? couponDiscount : 0
  const tax = Math.round(subtotal * TAX_RATE)
  const grandTotal = subtotal - discount + shippingCost + tax

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    const result = await validateCoupon(coupon, subtotal)
    if (result.valid) {
      setCouponApplied(true)
      setCouponDiscount(result.discount ?? 0)
      setCouponMsg(result.message ?? "")
    } else {
      setCouponApplied(false)
      setCouponDiscount(0)
      setCouponMsg(result.message ?? "")
    }
  }

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return
    const script = document.createElement("script")
    script.id = "razorpay-script"
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  const updateBilling = (field: string, value: string | boolean) =>
    setBilling((p) => ({ ...p, [field]: value }))
  const updateShipping = (field: string, value: string) =>
    setShipping((p) => ({ ...p, [field]: value }))

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    setPlacing(true)

    try {
      // Create Razorpay order on server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grandTotal, currency: "INR" }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to create order")

      // Open Razorpay modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Aurafirm",
        description: "Skincare & Wellness Products",
        image: "https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif",
        order_id: data.orderId,
        prefill: {
          name: billing.fullName,
          email: billing.email,
          contact: billing.phone,
        },
        theme: { color: "#c9744e" },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
          try {
            const shippingAddr = shipDifferent ? shipping : {
              fullName: billing.fullName, address: billing.address,
              apt: billing.apt, city: billing.city, state: billing.state, pin: billing.pin,
            }
            const result = await createOrder({
              customerName: billing.fullName,
              customerEmail: billing.email,
              customerPhone: `+91${billing.phone}`,
              billingAddress: { address: billing.address, apt: billing.apt, city: billing.city, state: billing.state, pin: billing.pin },
              shippingAddress: shippingAddr as Record<string, string>,
              subtotal,
              discount,
              shippingCost,
              tax,
              grandTotal,
              couponCode: couponApplied ? coupon : undefined,
              paymentMethod: paymentMethod === "cod" ? "cod" : "razorpay",
              paymentStatus: "paid",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              deliveryMethod: delivery,
              items: items.map((i) => ({
                productName: i.name,
                productImage: i.image,
                price: i.price,
                quantity: i.quantity,
                total: i.price * i.quantity,
              })),
            })
            setOrderId(response.razorpay_payment_id)
            setOrderNumber(result.orderNumber)
          } catch (e) {
            console.error("[v0] createOrder error:", e)
          }
          clearCart()
          setOrderDone(true)
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      }

      if (paymentMethod === "cod") {
        // For COD, save order directly without Razorpay
        const shippingAddr = shipDifferent ? shipping : {
          fullName: billing.fullName, address: billing.address,
          apt: billing.apt, city: billing.city, state: billing.state, pin: billing.pin,
        }
        const result = await createOrder({
          customerName: billing.fullName,
          customerEmail: billing.email,
          customerPhone: `+91${billing.phone}`,
          billingAddress: { address: billing.address, apt: billing.apt, city: billing.city, state: billing.state, pin: billing.pin },
          shippingAddress: shippingAddr as Record<string, string>,
          subtotal, discount, shippingCost, tax, grandTotal,
          couponCode: couponApplied ? coupon : undefined,
          paymentMethod: "cod",
          paymentStatus: "pending",
          deliveryMethod: delivery,
          items: items.map((i) => ({
            productName: i.name, productImage: i.image,
            price: i.price, quantity: i.quantity, total: i.price * i.quantity,
          })),
        })
        setOrderNumber(result.orderNumber)
        clearCart()
        setOrderDone(true)
        setPlacing(false)
        return
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error("[v0] Razorpay error:", err)
      setPlacing(false)
    }
  }

  if (orderDone) {
    return (
      <div className="min-h-screen bg-[#faf5f3] font-sans text-neutral-800">
        <AnnouncementBar />
        <Navbar itemCount={itemCount} />
        <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-20 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#eef5eb]">
            <Check className="h-12 w-12 text-[#6b8f5e]" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900">
            Order <span className="text-[#c9744e]">Confirmed!</span>
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            Thank you for shopping with Aurafirm. Your order has been placed successfully and will be
            shipped within 24 hours. A confirmation will be sent to{" "}
            <strong>{billing.email || "your email"}</strong>.
          </p>
          {orderNumber && (
            <p className="rounded-lg bg-[#f5ece6] px-4 py-2 text-xs font-mono text-neutral-700">
              Order Number: <strong>{orderNumber}</strong>
            </p>
          )}
          <p className="rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-700">
            Your account has been created. Login with your mobile number to track orders.
          </p>
          <div className="flex gap-3">
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
        <BrandBar />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf5f3] font-sans text-neutral-800">
      <AnnouncementBar />
      <Navbar itemCount={itemCount} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Heading + breadcrumb */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Check<span className="text-[#c9744e]">out</span>
          </h1>
          <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/" className="hover:text-neutral-800">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/cart" className="hover:text-neutral-800">Cart</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-neutral-700">Checkout</span>
          </nav>
        </div>

        {/* 4-column + sidebar layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_1fr_320px] xl:grid-cols-[1fr_1fr_1fr_340px]">

          {/* ── Col 1: Billing Details ─────────────────────── */}
          <div className="rounded-2xl border border-[#f0d8c8] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B4513] text-xs font-bold text-white">1</span>
              <h2 className="text-sm font-extrabold text-neutral-900">Billing Details</h2>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Full Name <span className="text-[#c9744e]">*</span></label>
                <input
                  className={inputCls}
                  placeholder="Enter your full name"
                  value={billing.fullName}
                  onChange={(e) => updateBilling("fullName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Email Address <span className="text-[#c9744e]">*</span></label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="Enter your email"
                  value={billing.email}
                  onChange={(e) => updateBilling("email", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number <span className="text-[#c9744e]">*</span></label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 rounded-lg border border-[#e3c8bb] bg-white px-2 py-2 text-xs text-neutral-700">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="Enter your phone number"
                    value={billing.phone}
                    onChange={(e) => updateBilling("phone", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Address <span className="text-[#c9744e]">*</span></label>
                <input
                  className={inputCls}
                  placeholder="House number and street name"
                  value={billing.address}
                  onChange={(e) => updateBilling("address", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Apartment, suite, unit etc. (optional)</label>
                <input
                  className={inputCls}
                  placeholder="Enter apartment, suite, unit etc."
                  value={billing.apt}
                  onChange={(e) => updateBilling("apt", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>City <span className="text-[#c9744e]">*</span></label>
                  <input
                    className={inputCls}
                    placeholder="Enter your city"
                    value={billing.city}
                    onChange={(e) => updateBilling("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>State <span className="text-[#c9744e]">*</span></label>
                  <select
                    className={inputCls}
                    value={billing.state}
                    onChange={(e) => updateBilling("state", e.target.value)}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>PIN Code <span className="text-[#c9744e]">*</span></label>
                <input
                  className={inputCls}
                  placeholder="Enter PIN code"
                  value={billing.pin}
                  onChange={(e) => updateBilling("pin", e.target.value)}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={billing.saveInfo}
                  onChange={(e) => updateBilling("saveInfo", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#e3c8bb] accent-[#8B4513]"
                />
                <span className="text-xs text-neutral-600">Save this information for faster check-out</span>
              </label>
            </div>
          </div>

          {/* ── Col 2: Shipping Address + Delivery Method ──── */}
          <div className="flex flex-col gap-5">
            {/* Shipping Address */}
            <div className="rounded-2xl border border-[#f0d8c8] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B4513] text-xs font-bold text-white">2</span>
                <h2 className="text-sm font-extrabold text-neutral-900">Shipping Address</h2>
              </div>

              <label className="mb-4 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={shipDifferent}
                  onChange={(e) => setShipDifferent(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#e3c8bb] accent-[#8B4513]"
                />
                <span className="text-xs font-medium text-neutral-700">Ship to a different address</span>
              </label>

              {shipDifferent && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Full Name <span className="text-[#c9744e]">*</span></label>
                    <input
                      className={inputCls}
                      placeholder="Enter full name"
                      value={shipping.fullName}
                      onChange={(e) => updateShipping("fullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Address <span className="text-[#c9744e]">*</span></label>
                    <input
                      className={inputCls}
                      placeholder="House number and street name"
                      value={shipping.address}
                      onChange={(e) => updateShipping("address", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Apartment, suite, unit etc. (optional)</label>
                    <input
                      className={inputCls}
                      placeholder="Enter apartment, suite, unit etc."
                      value={shipping.apt}
                      onChange={(e) => updateShipping("apt", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>City <span className="text-[#c9744e]">*</span></label>
                      <input
                        className={inputCls}
                        placeholder="Enter your city"
                        value={shipping.city}
                        onChange={(e) => updateShipping("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>State <span className="text-[#c9744e]">*</span></label>
                      <select
                        className={inputCls}
                        value={shipping.state}
                        onChange={(e) => updateShipping("state", e.target.value)}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>PIN Code <span className="text-[#c9744e]">*</span></label>
                    <input
                      className={inputCls}
                      placeholder="Enter PIN code"
                      value={shipping.pin}
                      onChange={(e) => updateShipping("pin", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Method */}
            <div className="rounded-2xl border border-[#f0d8c8] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B4513] text-xs font-bold text-white">3</span>
                <h2 className="text-sm font-extrabold text-neutral-900">Delivery Method</h2>
              </div>

              <div className="flex flex-col gap-3">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    delivery === "standard"
                      ? "border-[#8B4513] bg-[#fdf6f2]"
                      : "border-[#e3c8bb] hover:border-[#c9744e]/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        delivery === "standard" ? "border-[#8B4513]" : "border-[#d4b5a5]"
                      }`}
                    >
                      {delivery === "standard" && (
                        <div className="h-2 w-2 rounded-full bg-[#8B4513]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800">Standard Shipping</p>
                      <p className="text-[11px] text-neutral-500">Delivered in 3-5 business days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#c9744e]">FREE</p>
                    <p className="text-[10px] text-neutral-500">On orders above ₹{FREE_SHIPPING_THRESHOLD}</p>
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={delivery === "standard"}
                    onChange={() => setDelivery("standard")}
                    className="sr-only"
                  />
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    delivery === "express"
                      ? "border-[#8B4513] bg-[#fdf6f2]"
                      : "border-[#e3c8bb] hover:border-[#c9744e]/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        delivery === "express" ? "border-[#8B4513]" : "border-[#d4b5a5]"
                      }`}
                    >
                      {delivery === "express" && (
                        <div className="h-2 w-2 rounded-full bg-[#8B4513]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800">Express Shipping</p>
                      <p className="text-[11px] text-neutral-500">Delivered in 1-2 business days</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-neutral-700">₹{SHIPPING_EXPRESS}</p>
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={delivery === "express"}
                    onChange={() => setDelivery("express")}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── Col 3: Payment Method ─────────────────────── */}
          <div className="rounded-2xl border border-[#f0d8c8] bg-white p-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B4513] text-xs font-bold text-white">4</span>
              <h2 className="text-sm font-extrabold text-neutral-900">Payment Method</h2>
            </div>
            <p className="mb-4 text-[11px] text-neutral-500">All transactions are secure and encrypted.</p>

            <div className="flex flex-col gap-3">
              {/* UPI / Net Banking / Wallets */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  paymentMethod === "upi" ? "border-[#8B4513] bg-[#fdf6f2]" : "border-[#e3c8bb]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioDot active={paymentMethod === "upi"} />
                  <span className="text-xs font-semibold text-neutral-800">UPI / Net Banking / Wallets</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 w-auto" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-3 w-auto" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" alt="GPay" className="h-4 w-auto" />
                </div>
                <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="sr-only" />
              </label>

              {/* Credit / Debit Card */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  paymentMethod === "card" ? "border-[#8B4513] bg-[#fdf6f2]" : "border-[#e3c8bb]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioDot active={paymentMethod === "card"} />
                  <span className="text-xs font-semibold text-neutral-800">Credit / Debit Card</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 w-auto" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/2560px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 w-auto" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay.svg/2560px-RuPay.svg.png" alt="RuPay" className="h-4 w-auto" />
                </div>
                <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="sr-only" />
              </label>

              {/* Net Banking */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  paymentMethod === "netbanking" ? "border-[#8B4513] bg-[#fdf6f2]" : "border-[#e3c8bb]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioDot active={paymentMethod === "netbanking"} />
                  <span className="text-xs font-semibold text-neutral-800">Net Banking</span>
                </div>
                <Building2 className="h-5 w-5 text-neutral-400" />
                <input type="radio" name="payment" value="netbanking" checked={paymentMethod === "netbanking"} onChange={() => setPaymentMethod("netbanking")} className="sr-only" />
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  paymentMethod === "cod" ? "border-[#8B4513] bg-[#fdf6f2]" : "border-[#e3c8bb]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioDot active={paymentMethod === "cod"} />
                  <span className="text-xs font-semibold text-neutral-800">Cash on Delivery</span>
                </div>
                <Package className="h-5 w-5 text-neutral-400" />
                <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="sr-only" />
              </label>
            </div>

            {/* Secure payments note */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#f0d8c8] bg-[#fdf6f2] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0d8c8]">
                <ShieldCheck className="h-5 w-5 text-[#8B4513]" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">Secure Payments</p>
                <p className="text-[11px] text-neutral-500">Your payment information is 100% safe and secure.</p>
              </div>
            </div>
          </div>

          {/* ── Col 4: Order Summary (sidebar) ────────────���── */}
          <div className="flex flex-col gap-4">
            {/* Secure badge */}
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c9744e] text-[#c9744e]">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              100% Secure Checkout
            </div>

            <div className="rounded-2xl border border-[#f0d8c8] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-extrabold text-neutral-900">Order Summary</h2>

              {/* Item list */}
              <div className="flex flex-col gap-3 border-b border-[#f0d8c8] pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md bg-[#fbede5]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={56}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-xs font-bold text-neutral-800 leading-tight">{item.name}</p>
                      <p className="text-[11px] text-neutral-500">{item.subtitle}</p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-neutral-800">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-neutral-400">No items in cart.</p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Discount</span>
                  <span className="font-semibold text-[#c9744e]">-₹{discount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className={`font-semibold ${shippingCost === 0 ? "text-[#6b8f5e]" : "text-neutral-800"}`}>
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax (18%)</span>
                  <span className="font-semibold">₹{tax}</span>
                </div>
                <div className="flex justify-between border-t border-[#f0d8c8] pt-3">
                  <span className="text-base font-extrabold text-neutral-900">Grand Total</span>
                  <span className="text-base font-extrabold text-[#c9744e]">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">Inclusive of all taxes</p>
              </div>

              {/* Coupon */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <input
                      className="w-full rounded-lg border border-[#e3c8bb] bg-[#faf5f3] py-2.5 pl-8 pr-3 text-sm placeholder-neutral-400 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]/30"
                      placeholder="Coupon Code"
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value); setCouponApplied(false); setCouponMsg("") }}
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="rounded-lg bg-[#8B4513] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#7a3c10]"
                  >
                    {couponApplied ? <Check className="h-4 w-4" /> : "Apply"}
                  </button>
                </div>
                {couponMsg && (
                  <p className={`mt-1 text-xs ${couponApplied ? "text-green-600" : "text-red-500"}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Place Order button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B4513] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#7a3c10] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {placing ? "Processing..." : "Place Order"}
              </button>

              <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                By placing this order, you agree to our{" "}
                <a href="#" className="text-[#c9744e] underline-offset-2 hover:underline">Terms & Conditions</a>
                {" "}and{" "}
                <a href="#" className="text-[#c9744e] underline-offset-2 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustBadges.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5e8de] text-[#8B4513]">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800">{title}</p>
                <p className="text-[11px] text-neutral-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BrandBar />
      <Footer />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function RadioDot({ active }: { active: boolean }) {
  return (
    <div
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
        active ? "border-[#8B4513]" : "border-[#d4b5a5]"
      }`}
    >
      {active && <div className="h-2 w-2 rounded-full bg-[#8B4513]" />}
    </div>
  )
}

function AnnouncementBar() {
  return (
    <div className="bg-[#8B4513] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-6">
        <span className="hidden flex-1 md:block" />
        <p className="flex-1 text-center text-[10px] sm:text-xs">
          {"♡ Vegan \u2022 100% cruelty free & plant powered | "}
          <span className="font-semibold">Dermatest Tested</span>
          {" \u2013 Safe for sensitive skin \uD83C\uDF31"}
        </p>
        <div className="flex flex-1 items-center justify-end gap-3 text-white/90">
          <a href="#" aria-label="Photos"><Camera className="h-3.5 w-3.5" /></a>
          <a href="#" aria-label="Share"><Share2 className="h-3.5 w-3.5" /></a>
          <a href="#" aria-label="Video"><Play className="h-3.5 w-3.5" /></a>
          <a href="#" aria-label="Sign out"><ArrowLeft className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </div>
  )
}

function Navbar({ itemCount }: { itemCount: number }) {
  return (
    <header className="border-b border-[#f0d8c8] bg-[#faf5f3]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8">
        <Link href="/" aria-label="AURAFIRM home">
          <Image
            src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
            alt="AURAFIRM logo"
            width={160}
            height={56}
            className="h-14 w-auto object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Primary">
          {navItems.map((item, i) => (
            <a
              key={item}
              href="#"
              className={`transition-colors hover:text-[#b86244] ${
                i === 0
                  ? "border-b-2 border-[#b86244] pb-0.5 font-semibold text-[#b86244]"
                  : "text-neutral-700"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-neutral-700">
          <button aria-label="Search" className="transition-colors hover:text-[#b86244]">
            <Search className="h-4 w-4" />
          </button>
          <Link href="/cart" aria-label="Cart" className="relative transition-colors hover:text-[#b86244]">
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9744e] text-[9px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button aria-label="Wishlist" className="transition-colors hover:text-[#b86244]">
            <Heart className="h-4 w-4" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

function BrandBar() {
  return (
    <div className="bg-[#8B4513]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/20 px-4 py-0 sm:grid-cols-5">
        {brandBar.map((b, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40">
              <Leaf className="h-3.5 w-3.5 text-white/80" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{b.label}</p>
              <p className="text-[10px] text-white/70">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-[#faf5f3]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          {/* Brand col */}
          <div>
            <Link href="/">
              <Image
                src="https://res.cloudinary.com/df01whs60/image/upload/v1782242359/AURAFIRM_logo_PNG_160x_drciiz.avif"
                alt="Aurafirm"
                width={140}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              Where science meets self-care. We create high-quality, safe, and effective skincare
              and wellness solutions built on purity, innovation, and care.
            </p>
            <div className="mt-4 flex gap-3">
              {["instagram", "facebook", "tiktok", "youtube", "pinterest"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors hover:border-[#c9744e] hover:text-[#c9744e]"
                >
                  <span className="sr-only">{s}</span>
                  <span className="text-[10px] font-bold capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          {/* Link cols */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-800">{col.title}</h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="whitespace-pre-line text-xs text-neutral-600 transition-colors hover:text-[#c9744e]">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#f0d8c8] pt-6 sm:flex-row">
          <p className="text-[11px] text-neutral-500">
            Copyright &copy; 2025{" "}
            <a href="#" className="text-[#c9744e]">Aurafirm</a>. All Rights Reserved.
          </p>
          <div className="flex gap-4">
            <select className="rounded border border-[#e3c8bb] bg-white px-2 py-1 text-xs text-neutral-600 outline-none">
              <option>English</option>
            </select>
            <select className="rounded border border-[#e3c8bb] bg-white px-2 py-1 text-xs text-neutral-600 outline-none">
              <option>INR</option>
              <option>USD</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}
