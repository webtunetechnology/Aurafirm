'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
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

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getAllProductSlugs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('slug')
    .not('slug', 'is', null)
  return (data ?? []).map((r) => r.slug as string)
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
  // Always use service-role admin client — customer is not authenticated
  // at checkout time, so the anon client would be blocked by RLS on every table
  const adminSupabase = createAdminClient()

  // Normalize to exactly 10 digits — strip country code (91/+91) if present
  let digits = payload.customerPhone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0'))  digits = digits.slice(1)
  const fakeEmail = `${digits}@aurafirm.customer`
  const password = digits

  let customerId: string | null = null

  // Check if an account already exists for this phone number
  const { data: existingUser } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('phone', digits)
    .maybeSingle()

  if (existingUser?.id) {
    customerId = existingUser.id
  } else {
    // Create a pre-confirmed account — no email verification gate
    const { data: created, error: createErr } = await adminSupabase.auth.admin.createUser({
      email: fakeEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.customerName,
        phone: payload.customerPhone,
        is_admin: false,
      },
    })
    if (createErr) {
      console.error('[v0] createUser error:', createErr.message)
    }
    customerId = created?.user?.id ?? null
  }

  // Upsert profile row so customer name/phone is always up-to-date
  if (customerId) {
    await adminSupabase.from('profiles').upsert({
      id: customerId,
      full_name: payload.customerName,
      phone: digits,
      is_admin: false,
    }, { onConflict: 'id' })
  }

  // Generate order number — use admin client to bypass RLS
  const { data: orderNumData } = await adminSupabase.rpc('generate_order_number')
  const orderNumber = orderNumData as string

  // Insert order — use admin client: customer is not logged in at checkout time
  const { data: order, error: orderError } = await adminSupabase
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

  // Insert order items — admin client, same reason
  const orderItems = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId ?? null,
    product_name: item.productName,
    product_image: item.productImage ?? null,
    price: item.price,
    quantity: item.quantity,
    total: item.total,
  }))

  const { error: itemsError } = await adminSupabase.from('order_items').insert(orderItems)
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

// ─── Admin ───────────────────────────────────────────��─────────────────────────

export async function adminGetOrders(filters?: {
  status?: string
  paymentStatus?: string
  search?: string
}) {
  const supabase = createAdminClient()
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
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const extra: Record<string, string | null> = {}
  if (status === 'shipped')   extra.shipped_at   = now
  if (status === 'delivered') extra.delivered_at = now
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: now, ...extra })
    .eq('id', orderId)
  if (error) throw error
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
}

export async function adminUpdateOrderShipping(orderId: string, payload: {
  status: string
  carrier: string
  tracking_id: string
  tracking_url: string
  estimated_delivery: string   // ISO date string or ""
  notes: string
}) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const extra: Record<string, string | null> = {}
  if (payload.status === 'shipped')   extra.shipped_at   = now
  if (payload.status === 'delivered') extra.delivered_at = now
  const { error } = await supabase
    .from('orders')
    .update({
      status:             payload.status,
      carrier:            payload.carrier            || null,
      tracking_id:        payload.tracking_id        || null,
      tracking_url:       payload.tracking_url       || null,
      estimated_delivery: payload.estimated_delivery || null,
      notes:              payload.notes              || null,
      updated_at:         now,
      ...extra,
    })
    .eq('id', orderId)
  if (error) throw error
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
}

export async function adminGetProducts() {
  const supabase = createAdminClient()
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
    vip_price?: number
    category: string
    image_url?: string
    stock: number
    tags?: string[]
    is_active: boolean
    slug?: string
    size_label?: string
    rating?: number
    review_count?: number
    gallery_images?: string[]
    helps_with?: string[]
    suitable_for?: string[]
    hero_ingredients?: { image: string; title: string; description: string; benefits: string[] }[]
    how_to_use_steps?: { number: string; title: string; description: string }[]
    full_ingredients_text?: string
    manufacturing_info?: string
    faqs?: { question: string; answer: string }[]
  }
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').upsert({
    ...product,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
  revalidatePath('/admin/products')
  revalidatePath('/')
}

export async function adminDeleteProduct(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/products')
  revalidatePath('/')
}

export async function adminGetDashboardStats() {
  const supabase = createAdminClient()

  const now = new Date()
  const startCurrent = new Date(now); startCurrent.setDate(startCurrent.getDate() - 6); startCurrent.setHours(0, 0, 0, 0)
  const startPrev    = new Date(now); startPrev.setDate(startPrev.getDate() - 13);     startPrev.setHours(0, 0, 0, 0)
  const endPrev      = new Date(startCurrent)

  const [allOrdersRes, prevOrdersRes, customersRes, prevCustomersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('id, order_number, customer_name, grand_total, status, created_at').gte('created_at', startCurrent.toISOString()),
    supabase.from('orders').select('grand_total, status, created_at').gte('created_at', startPrev.toISOString()).lt('created_at', endPrev.toISOString()),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('is_admin', false).gte('created_at', startCurrent.toISOString()),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('is_admin', false).gte('created_at', startPrev.toISOString()).lt('created_at', endPrev.toISOString()),
    supabase.from('products').select('id, name, stock'),
  ])

  // All-time totals for total counters
  const [allTimeOrdersRes, allTimeCustomersRes] = await Promise.all([
    supabase.from('orders').select('id, order_number, customer_name, grand_total, status, created_at'),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('is_admin', false),
  ])

  const currentOrders  = allOrdersRes.data ?? []
  const prevOrders     = prevOrdersRes.data ?? []
  const allOrders      = allTimeOrdersRes.data ?? []

  const currentRevenue = currentOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0)
  const prevRevenue    = prevOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0)

  const pctChange = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? '+100%' : '0%'
    const diff = ((current - prev) / prev) * 100
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  }

  const totalRevenue    = allOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0)
  const totalOrders     = allOrders.length
  const totalCustomers  = allTimeCustomersRes.count ?? 0
  const completedOrders = allOrders.filter((o) => o.status === 'delivered').length
  const pendingOrders   = allOrders.filter((o) => o.status === 'pending').length
  const lowStockProducts = (productsRes.data ?? []).filter((p) => p.stock < 20).length

  const currentAvg = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0
  const prevAvg    = prevOrders.length > 0 ? prevRevenue / prevOrders.length : 0

  // Build last 7 days sales chart data
  const chartData: { date: string; sales: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const dayOrders = allOrders.filter((o) => new Date(o.created_at).toDateString() === d.toDateString())
    chartData.push({ date: dateStr, sales: dayOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0) })
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
    recentOrders: allOrders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    changes: {
      orders:   pctChange(currentOrders.length, prevOrders.length),
      revenue:  pctChange(currentRevenue, prevRevenue),
      customers: pctChange(customersRes.count ?? 0, prevCustomersRes.count ?? 0),
      profit:   pctChange(Math.round(currentRevenue * 0.42), Math.round(prevRevenue * 0.42)),
      avg:      pctChange(currentAvg, prevAvg),
    },
  }
}

// ─── Contact Messages ─────────────────────────────────────────────────────────

export async function submitContactMessage(payload: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    subject: payload.subject,
    message: payload.message,
  })
  if (error) throw error
  return { success: true }
}

export async function adminGetContactMessages() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminUpdateContactStatus(id: string, status: 'read' | 'replied') {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/contacts')
}

// ─── Our Story ───────────────────────────────────────────────────────────────

export async function getOurStoryContent() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('our_story_content')
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getOurStoryMilestones() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('our_story_milestones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getOurStoryValues() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('our_story_values')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function adminGetOurStoryData() {
  const supabase = createAdminClient()
  const [{ data: content }, { data: milestones }, { data: values }] = await Promise.all([
    supabase.from('our_story_content').select('*').single(),
    supabase.from('our_story_milestones').select('*').order('sort_order'),
    supabase.from('our_story_values').select('*').order('sort_order'),
  ])
  return { content, milestones: milestones ?? [], values: values ?? [] }
}

export async function adminUpdateOurStoryContent(patch: Record<string, string>) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('our_story_content')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', '00000000-0000-0000-0000-000000000001')
  if (error) throw error
  revalidatePath('/about')
  revalidatePath('/admin/our-story')
}

export async function adminUpsertOurStoryMilestone(row: {
  id?: string; sort_order: number; year: string; title: string; description: string; is_active: boolean
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('our_story_milestones').upsert(row)
  if (error) throw error
  revalidatePath('/about')
  revalidatePath('/admin/our-story')
}

export async function adminDeleteOurStoryMilestone(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('our_story_milestones').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/about')
  revalidatePath('/admin/our-story')
}

export async function adminUpsertOurStoryValue(row: {
  id?: string; sort_order: number; icon: string; title: string; description: string; is_active: boolean
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('our_story_values').upsert(row)
  if (error) throw error
  revalidatePath('/about')
  revalidatePath('/admin/our-story')
}

export async function adminDeleteOurStoryValue(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('our_story_values').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/about')
  revalidatePath('/admin/our-story')
}

// ─── Why AURAFIRM Pillars ─────────────────────────────────────────────────────

export async function getWhyPillars() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('why_aurafirm_pillars')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function adminGetAllWhyPillars() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('why_aurafirm_pillars')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function adminUpsertWhyPillar(pillar: {
  id?: string
  sort_order: number
  icon: string
  title: string
  subtitle: string
  description: string
  stat_value: string
  stat_label: string
  is_active: boolean
}) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('why_aurafirm_pillars')
    .upsert({ ...pillar, updated_at: new Date().toISOString() })
  if (error) throw error
  revalidatePath('/why-aurafirm')
  revalidatePath('/admin/why-aurafirm')
}

export async function adminDeleteWhyPillar(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('why_aurafirm_pillars')
    .delete()
    .eq('id', id)
  if (error) throw error
  revalidatePath('/why-aurafirm')
  revalidatePath('/admin/why-aurafirm')
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function adminGetCustomers() {
  const supabase = createAdminClient()
  // Join profiles with orders to get order count and total spend
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })
  if (error) throw error

  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, grand_total, status')

  return (profiles ?? []).map((p) => {
    const customerOrders = (orders ?? []).filter((o) => o.customer_id === p.id)
    return {
      ...p,
      order_count: customerOrders.length,
      total_spend: customerOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0),
    }
  })
}

// ─── Coupons ───────────────────────────────────────────���────────────────────────

export async function adminGetCoupons() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function adminUpsertCoupon(coupon: {
  id?: string
  code: string
  discount_type: 'fixed' | 'percentage'
  discount_value: number
  min_order_value: number
  max_uses?: number | null
  expires_at?: string | null
  is_active: boolean
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('coupons').upsert({
    ...coupon,
    code: coupon.code.toUpperCase().trim(),
  })
  if (error) throw error
  revalidatePath('/admin/coupons')
}

export async function adminDeleteCoupon(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/coupons')
}

export async function adminToggleCoupon(id: string, is_active: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/coupons')
}

// ─── Inventory ──────────────────────────────────────────��───────────────────────

export async function adminUpdateStock(productId: string, stock: number) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ stock, updated_at: new Date().toISOString() })
    .eq('id', productId)
  if (error) throw error
  revalidatePath('/admin/inventory')
  revalidatePath('/admin/products')
}

// ─── Sales & Analytics ──────────────────────────────────────────────────────────

export async function adminGetSalesData() {
  const supabase = createAdminClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, grand_total, subtotal, discount, status, payment_method, created_at, order_items(*)')
    .order('created_at', { ascending: true })
  if (error) throw error

  const allOrders = orders ?? []

  // Monthly breakdown for last 12 months
  const now = new Date()
  const monthly: { month: string; revenue: number; orders: number; profit: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    const monthOrders = allOrders.filter((o) => {
      const od = new Date(o.created_at)
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth()
    })
    const revenue = monthOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0)
    monthly.push({ month: label, revenue, orders: monthOrders.length, profit: Math.round(revenue * 0.42) })
  }

  // Payment method breakdown
  const paymentBreakdown = ['razorpay', 'cod', 'upi'].map((method) => {
    const methodOrders = allOrders.filter((o) => o.payment_method === method)
    return {
      method: method === 'razorpay' ? 'Razorpay' : method === 'cod' ? 'COD' : 'UPI',
      count: methodOrders.length,
      revenue: methodOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0),
    }
  }).filter((m) => m.count > 0)

  // Status breakdown
  const statusBreakdown = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => ({
    status,
    count: allOrders.filter((o) => o.status === status).length,
  }))

  const totalRevenue = allOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0)
  const totalDiscount = allOrders.reduce((s, o) => s + (o.discount ?? 0), 0)

  return {
    monthly,
    paymentBreakdown,
    statusBreakdown,
    totalRevenue,
    totalDiscount,
    totalOrders: allOrders.length,
    avgOrderValue: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0,
    grossProfit: Math.round(totalRevenue * 0.42),
  }
}

export async function adminGetAnalyticsData() {
  const supabase = createAdminClient()

  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('id, grand_total, status, created_at, order_items(product_name, quantity, total)'),
    supabase.from('products').select('id, name, category, price, stock'),
  ])

  const orders = ordersRes.data ?? []
  const products = productsRes.data ?? []

  // Top products by revenue
  const productRevMap: Record<string, { name: string; revenue: number; units: number }> = {}
  for (const order of orders) {
    for (const item of (order.order_items as { product_name: string; quantity: number; total: number }[])) {
      if (!productRevMap[item.product_name]) {
        productRevMap[item.product_name] = { name: item.product_name, revenue: 0, units: 0 }
      }
      productRevMap[item.product_name].revenue += item.total ?? 0
      productRevMap[item.product_name].units += item.quantity ?? 0
    }
  }
  const topProducts = Object.values(productRevMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  // Category breakdown
  const catMap: Record<string, number> = {}
  for (const p of products) {
    catMap[p.category] = (catMap[p.category] ?? 0) + 1
  }
  const categoryBreakdown = Object.entries(catMap).map(([cat, count]) => ({ cat, count }))

  // Daily orders last 30 days
  const daily: { day: string; orders: number; revenue: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const dayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === d.toDateString())
    daily.push({
      day: label,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + (o.grand_total ?? 0), 0),
    })
  }

  return { topProducts, categoryBreakdown, daily }
}

export async function adminGetTopProducts() {
  const supabase = createAdminClient()

  const [{ data: items, error }, { data: products }] = await Promise.all([
    supabase.from('order_items').select('product_id, product_name, product_image, total, quantity'),
    supabase.from('products').select('id, name, image_url'),
  ])
  if (error) return []

  // Build a lookup from product id and name → image_url for missing images
  const imageById: Record<string, string>   = {}
  const imageByName: Record<string, string> = {}
  for (const p of products ?? []) {
    if (p.image_url) {
      imageById[p.id]       = p.image_url
      imageByName[p.name?.toLowerCase()] = p.image_url
    }
  }

  const map: Record<string, { id: string; name: string; image: string | null; revenue: number; units: number }> = {}
  for (const item of items ?? []) {
    const key = item.product_id ?? item.product_name
    if (!map[key]) {
      // Resolve image: prefer snapshot on order_item, fall back to live product
      const image =
        item.product_image ||
        (item.product_id ? imageById[item.product_id] : null) ||
        imageByName[item.product_name?.toLowerCase()] ||
        null
      map[key] = { id: key, name: item.product_name, image, revenue: 0, units: 0 }
    }
    map[key].revenue += item.total ?? 0
    map[key].units   += item.quantity ?? 0
  }
  return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export type Review = {
  id: string
  product_id: string
  customer_id: string
  customer_name: string
  rating: number
  title: string | null
  comment: string
  is_approved: boolean
  is_verified: boolean
  created_at: string
}

/** Get all approved reviews for a product (public). */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Get the currently logged-in user's review for a product (if any). */
export async function getMyReview(productId: string): Promise<Review | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('customer_id', user.id)
    .single()
  return data ?? null
}

/** Submit or update a review. Returns an error string on failure. */
export async function submitReview(payload: {
  productId: string
  rating: number
  title: string
  comment: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to write a review.' }

  // Fetch customer name from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
  const customerName = profile?.full_name ?? 'Customer'

  const { error } = await supabase.from('reviews').upsert({
    product_id: payload.productId,
    customer_id: user.id,
    customer_name: customerName,
    rating: payload.rating,
    title: payload.title || null,
    comment: payload.comment,
    is_approved: false, // requires admin approval
    updated_at: new Date().toISOString(),
  }, { onConflict: 'product_id,customer_id' })

  if (error) return { error: error.message }
  revalidatePath(`/product`)
  return {}
}

/** Delete the current user's own review. */
export async function deleteMyReview(reviewId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('reviews').delete().eq('id', reviewId).eq('customer_id', user.id)
  revalidatePath('/product')
}

// ─── Admin Reviews ─────────────────────────────────────────────────────────────

export async function adminGetReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, products(name, slug, image_url)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as (Review & { products: { name: string; slug: string | null; image_url: string | null } | null })[]
}

export async function adminApproveReview(id: string, is_approved: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('reviews')
    .update({ is_approved, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/reviews')
  revalidatePath('/product')
}

export async function adminDeleteReview(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/reviews')
  revalidatePath('/product')
}
