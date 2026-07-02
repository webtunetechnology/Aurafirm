"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Lock, Mail, Leaf, ShieldCheck, Sparkles, FlaskConical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const brandValues = [
  { icon: Leaf, title: "Vegan", sub: "100% Plant Powered" },
  { icon: ShieldCheck, title: "Dermatest Tested", sub: "Safe for Sensitive Skin" },
  { icon: Sparkles, title: "Premium Quality", sub: "Clinically Proven Ingredients" },
  { icon: FlaskConical, title: "Science-Backed", sub: "Research Driven Formulations" },
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err || !data.user) {
      setError("Invalid email or password.")
      setLoading(false)
      return
    }
    // Verify admin flag from user_metadata (avoids RLS timing issue on fresh login)
    const isAdmin = data.user.user_metadata?.is_admin === true
    if (!isAdmin) {
      await supabase.auth.signOut()
      setError("You do not have admin access.")
      setLoading(false)
      return
    }
    router.push("/admin")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#fdf6f2" }}>
      {/* Decorative circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full border border-[#e8cabb]/60" />
        <div className="absolute -left-16 top-32 h-52 w-52 rounded-full bg-[#f5e0d3]/40" />
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
        <h1 className="mb-1 text-center text-3xl font-bold text-neutral-900">
          Welcome Back, <span className="text-[#c9744e]">Admin</span>
        </h1>
        <p className="mb-2 text-sm text-neutral-500">Sign in to your admin account to continue</p>
        <div className="mb-8 h-0.5 w-12 rounded bg-[#c9744e]" />

        {/* First-time setup notice */}
        <div className="mb-4 w-full max-w-md rounded-xl border border-[#e8cabb] bg-[#fdf1eb] px-4 py-3 text-xs text-neutral-700">
          <p className="font-semibold text-[#a0522d]">First time setup?</p>
          <p className="mt-0.5">
            Visit{" "}
            <a
              href="/api/admin/seed"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#c9744e] underline underline-offset-2"
            >
              /api/admin/seed
            </a>{" "}
            once to create the admin account, then log in with:
          </p>
          <p className="mt-1 font-mono text-[11px] text-neutral-600">
            Email: admin@aurafirm.com &nbsp;|&nbsp; Password: Aurafirm@2025
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-1 text-center text-xl font-bold text-neutral-800">
            Admin <span className="text-[#c9744e]">Login</span>
          </h2>
          <p className="mb-6 text-center text-xs text-neutral-500">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-10 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a0522d] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8b4513] disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              {loading ? "Signing in..." : "Login to Dashboard"}
            </button>
          </form>
        </div>

        {/* Product prop image */}
        <div className="pointer-events-none absolute bottom-16 right-8 hidden opacity-80 lg:block">
          <Image
            src="https://res.cloudinary.com/df01whs60/image/upload/v1782241556/front-profile_page-0001-removebg-preview_syyqyk.png"
            alt="Aurafirm product"
            width={160}
            height={220}
            className="object-contain drop-shadow-xl"
          />
        </div>
      </main>

      {/* Brand bar */}
      <div className="flex items-center justify-center gap-12 bg-[#7d3c1f] px-8 py-5 flex-wrap">
        {brandValues.map((b) => (
          <div key={b.title} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30">
              <b.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{b.title}</p>
              <p className="text-[10px] text-white/70">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#fdf6f2] py-3 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} AURAFIRM. All Rights Reserved.
      </div>
    </div>
  )
}
