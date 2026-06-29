"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare,
} from "lucide-react"
import { submitContactMessage } from "@/lib/actions"

const SUBJECTS = [
  "Order Query",
  "Product Information",
  "Return & Refund",
  "Shipping Issue",
  "Payment Problem",
  "Feedback",
  "Other",
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const isValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.subject !== "" &&
    form.message.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    setError("")
    try {
      await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject,
        message: form.message.trim(),
      })
      setDone(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf5f3] font-sans">
      <Navbar />


      {/* Hero */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf0e8]">
            <MessageSquare className="h-7 w-7 text-[#c9744e]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Get in Touch</h1>
          <p className="mt-2 text-neutral-500">We typically respond within 24 hours on business days.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Info Cards */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: Phone,
                label: "Phone Support",
                lines: ["+91 98765 43210", "Mon – Sat, 10am – 6pm"],
              },
              {
                icon: Mail,
                label: "Email Us",
                lines: ["support@aurafirm.in", "We reply within 24 hours"],
              },
              {
                icon: MapPin,
                label: "Our Office",
                lines: ["Aurafirm Wellness Pvt. Ltd.", "Mumbai, Maharashtra, India"],
              },
              {
                icon: Clock,
                label: "Business Hours",
                lines: ["Monday – Saturday", "10:00 AM – 6:00 PM IST"],
              },
            ].map(({ icon: Icon, label, lines }) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-[#f0e0d6] bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fdf0e8]">
                  <Icon className="h-5 w-5 text-[#c9744e]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{label}</p>
                  {lines.map((l) => (
                    <p key={l} className="mt-0.5 text-xs text-neutral-500">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-[#f0e0d6] bg-white p-8 shadow-sm lg:col-span-2">
            {done ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Message Sent!</h2>
                <p className="max-w-sm text-sm text-neutral-500">
                  Thanks for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setDone(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }) }}
                  className="mt-2 rounded-xl border border-[#e3c8bb] px-5 py-2 text-sm font-semibold text-[#c9744e] hover:bg-[#fdf6f2]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Send us a Message</h2>
                  <p className="mt-1 text-sm text-neutral-500">Fill in the form and we will get back to you.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Doe"
                      className="rounded-xl border border-[#e3c8bb] bg-[#faf5f3] px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#c9744e] focus:ring-2 focus:ring-[#c9744e]/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="rounded-xl border border-[#e3c8bb] bg-[#faf5f3] px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#c9744e] focus:ring-2 focus:ring-[#c9744e]/20"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Phone Number <span className="text-neutral-400 font-normal">(optional)</span></label>
                    <div className="flex overflow-hidden rounded-xl border border-[#e3c8bb] bg-[#faf5f3] focus-within:border-[#c9744e] focus-within:ring-2 focus-within:ring-[#c9744e]/20">
                      <span className="flex items-center border-r border-[#e3c8bb] px-3 text-sm text-neutral-500">+91</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="98765 43210"
                        className="w-full bg-transparent px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Subject <span className="text-red-500">*</span></label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      className="rounded-xl border border-[#e3c8bb] bg-[#faf5f3] px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-[#c9744e] focus:ring-2 focus:ring-[#c9744e]/20"
                    >
                      <option value="">Select a subject...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Message <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={5}
                    placeholder="Describe your query in detail..."
                    className="resize-none rounded-xl border border-[#e3c8bb] bg-[#faf5f3] px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#c9744e] focus:ring-2 focus:ring-[#c9744e]/20"
                  />
                  <p className="text-right text-[11px] text-neutral-400">{form.message.length} / 1000</p>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#c9744e] py-3 text-sm font-bold text-white transition-colors hover:bg-[#b86244] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
