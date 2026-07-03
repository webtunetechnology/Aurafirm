"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/Navbar"

export default function ChangePasswordPageClient() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [checking, setChecking] = useState(true)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Auth guard — only logged-in customers can change their password
  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/account/login")
        return
      }
      setEmail(user.email ?? "")
      setChecking(false)
    }
    check()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("Your new password must be at least 6 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.")
      return
    }
    if (newPassword === currentPassword) {
      setError("Your new password must be different from your current password.")
      return
    }

    setSaving(true)
    const supabase = createClient()

    // Re-verify the current password before allowing a change
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })
    if (verifyErr) {
      setSaving(false)
      setError("Your current password is incorrect.")
      return
    }

    // Update to the new password
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (updateErr) {
      setError("Something went wrong. Please try again.")
      return
    }

    setSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#fdf6f2" }}>
      <Navbar />

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <h1 className="mb-1 text-3xl font-bold text-neutral-900">
          Change <span className="text-[#c9744e]">Password</span>
        </h1>
        <p className="mb-2 text-sm text-neutral-500">Update the password you use to sign in to your account</p>
        <div className="mb-8 h-0.5 w-12 rounded bg-[#c9744e]" />

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
          {checking ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9744e] border-t-transparent" />
            </div>
          ) : success ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-neutral-800">Password Updated</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Your password has been changed successfully. Please use it the next time you sign in.
              </p>
              <Link
                href="/account/orders"
                className="mt-6 rounded-xl bg-[#a0522d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#8b4513]"
              >
                Back to My Orders
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-center text-xl font-bold text-neutral-800">
                Account <span className="text-[#c9744e]">Security</span>
              </h2>
              <p className="mb-6 text-center text-xs text-neutral-500">
                Enter your current password and choose a new one
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-10 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    If you never changed it, your current password is your 10-digit mobile number.
                  </p>
                </div>

                {/* New password */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">New Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-10 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Confirm New Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:ring-1 focus:ring-[#c9744e]/30"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a0522d] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8b4513] disabled:opacity-60"
                >
                  <Lock className="h-4 w-4" />
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#fdf6f2] py-4 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} AURAFIRM. All Rights Reserved.
      </footer>
    </div>
  )
}
