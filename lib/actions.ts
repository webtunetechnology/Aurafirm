'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function validateCoupon(code: string, orderTotal: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !data) return { valid: false, message: 'Invalid coupon code' }
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return { valid: false, message: 'Coupon has expired' }
  if (data.max_uses && data.used_count >= data.max_uses)
    return { valid: false, message: 'Coupon usage limit reached' }
  if (orderTotal < data.min_order_value)
    return { valid: false, message: `Minimum order value ₹${data.min_order_value} required` }

  return {
    valid: true,
    discount: data.discount_type === 'percentage'
      ? Math.round((orderTotal * data.discount_value) / 100)
      : data.discount_value,
    message: `Coupon applied! ₹${data.discount_type === 'percentage'
      ? Math.round((orderTotal * data.discount_value) / 100)
      : data.discount_value} off`,
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  customerName: string
  customerEmail: string
  customerPhone: string
  billingAddress: Record<string, string>
  shippingAddress: Record<string, string>
  subtotal: number
  discount: number
  shippingCost: number
  tax: number
  grandTotal: number
  couponCode?: string
  paymentMethod: string
  paymentStatus: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  deliveryMethod: string
  items: {
    productId?: string
    productName: string
    productImage?: string
    price: number
    quantity: number
    total: number
  }[]
}

export async function createOrder(payload: CreateOrderPayload) {
  const supabase = await createClient()

  // Auto sign-up customer using phone as email identifier
  const fakeEmail = `${payload.customerPhone.replace(/\D/g, '')}@aurafirm.customer`
  const password = payload.customerPhone.replace(/\D/g, '')

  let customerId: string | null = null

  // Try to sign in first, if not found sign up
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: fakeEmail,
    password,
  })

  if (signInData?.user) {
    customerId = signInData.user.id
  } else {
    const { data: signUpData } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          full_name: payload.customerName,
          phone: payload.customerPhone,
          is_admin: false,
        },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
      },
    })
    customerId = signUpData?.user?.id ?? null
  }

  // Generate order number
  const { data: orderNumData } = await supabase.rpc('generate_order_number')
  const orderNumber = orderNumData as string

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      billing_address: payload.billingAddress,
      shipping_address: payload.shippingAddress,
      subtotal: payload.subtotal,
      discount: payload.discount,
      shipping_cost: payload.shippingCost,
      tax: payload.tax,
      grand_total: payload.grandTotal,
      coupon_code: payload.couponCode ?? null,
      payment_method: payload.paymentMethod,
      payment_status: payload.paymentStatus,
      razorpay_order_id: payload.razorpayOrderId ?? null,
      razorpay_payment_id: payload.razorpayPaymentId ?? null,
      delivery_method: payload.deliveryMethod,
      status: payload.paymentMethod === 'cod' ? 'pending' : 'processing',
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Insert order items
  const orderItems = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId ?? null,
    product_name: item.productName,
    product_image: item.productImage ?? null,
    price: item.price,
    quantity: item.quantity,
    total: item.total,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError

  revalidatePath('/account/orders')
  return { orderId: order.id, orderNumber, customerId }
}

// ─── Customer orders ───────────────────────────────────────────────────────────

export async function getMyOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export async function adminGetOrders(filters?: {
  status?: string
  paymentStatus?: string
  search?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus)
  }
  if (filters?.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function adminUpdateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) throw error
  revalidatePath('/admin/orders')
}

export async function adminGetProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function adminUpsertProduct(
  product: {
    id?: string
    name: string
    subtitle?: string
    description?: string
    price: number
    original_price?: number
    category: string
    image_url?: string
    stock: number
    tags?: string[]
    is_active: boolean
  }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').upsert({
    ...product,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
  revalidatePath('/admin/products')
  revalidatePath('/')
}

export async function adminDeleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/products')
  revalidatePath('/')
}

export async function adminGetDashboardStats() {
  const supabase = await createClient()

  const [ordersRes, customersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('id, order_number, customer_name, grand_total, status, created_at'),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('is_admin', false),
    supabase.from('products').select('id, name, stock', { count: 'exact' }),
  ])

  const orders = ordersRes.data ?? []
  const totalRevenue = orders.reduce((s, o) => s + (o.grand_total ?? 0), 0)
  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === 'delivered').length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalCustomers = customersRes.count ?? 0
  const lowStockProducts = (productsRes.data ?? []).filter((p) => p.stock < 20).length

  // Build last 7 days sales chart data
  const now = new Date()
  const chartData: { date: string; sales: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const dayOrders = orders.filter((o) => {
      const od = new Date(o.created_at)
      return od.toDateString() === d.toDateString()
    })
    chartData.push({ date: dateStr, sales: dayOrders.reduce((s, o) => s + o.grand_total, 0) })
  }

  return {
    totalOrders,
    totalRevenue,
    totalCustomers,
    grossProfit: Math.round(totalRevenue * 0.42),
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    completedOrders,
    pendingOrders,
    lowStockProducts,
    chartData,
    recentOrders: (ordersRes.data ?? []).slice(0, 5),
  }
}

export async function adminGetCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
