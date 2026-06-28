"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface CartItem {
  id: string
  name: string
  subtitle: string
  price: number
  image: string
  quantity: number
  tags?: string[]
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

const defaultItems: CartItem[] = [
  {
    id: "gluta-tab",
    name: "Gluta Tab",
    subtitle: "Radiance & Glow Effervescent Tabs",
    price: 1199,
    image:
      "https://res.cloudinary.com/df01whs60/image/upload/v1782241602/ChatGPT_Image_Jun_19__2026__10_00_30_PM-removebg-preview_hsizp4.png",
    quantity: 1,
    tags: ["Vegan", "Dermatest Tested"],
  },
  {
    id: "premium-face-serum",
    name: "Premium Face Serum",
    subtitle: "With Niacinamide & Hyaluronic Acid",
    price: 1299,
    image:
      "https://res.cloudinary.com/df01whs60/image/upload/v1782241556/front-profile_page-0001-removebg-preview_syyqyk.png",
    quantity: 1,
    tags: ["Vegan", "Dermatest Tested"],
  },
]

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(defaultItems)

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id)
      if (existing) {
        return prev.map((i) => (i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
