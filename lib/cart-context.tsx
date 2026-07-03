"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

const STORAGE_KEY = "aurafirm_cart"

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

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage may be unavailable (private mode) — fail silently
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load persisted cart on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore malformed storage
    }
  }, [])

  // Every mutator computes the next state, writes it to localStorage, and returns it.
  // Persisting inside the updater (instead of a separate effect) avoids StrictMode /
  // hydration timing races that could drop writes.
  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id)
      const next = existing
        ? prev.map((i) => (i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...newItem, quantity: 1 }]
      persist(next)
      return next
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      persist(next)
      return next
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      persist(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    persist([])
    setItems([])
  }, [])

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
