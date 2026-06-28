"use client"

import { useEffect, useState, useTransition } from "react"
import { Star, Check, X, Trash2, ExternalLink, Filter } from "lucide-react"
import Link from "next/link"
import { adminGetReviews, adminApproveReview, adminDeleteReview } from "@/lib/actions"
import type { Review } from "@/lib/actions"

type ReviewWithProduct = Review & {
  products: { name: string; slug: string | null; image_url: string | null } | null
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    adminGetReviews().then((data) => {
      setReviews(data as ReviewWithProduct[])
      setLoading(false)
    })
  }, [])

  function handleApprove(id: string, approve: boolean) {
    startTransition(async () => {
      await adminApproveReview(id, approve)
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: approve } : r))
      )
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await adminDeleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    })
  }

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved
    if (filter === "approved") return r.is_approved
    return true
  })

  const pendingCount = reviews.filter((r) => !r.is_approved).length
  const approvedCount = reviews.filter((r) => r.is_approved).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Customer Reviews</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Moderate and approve reviews before they appear on product pages.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500 shadow-sm">
          <Filter className="h-3.5 w-3.5" />
          <span className="font-medium">{reviews.length}</span> total
          <span className="mx-1 text-neutral-300">|</span>
          <span className="font-medium text-amber-600">{pendingCount}</span> pending
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length, color: "text-neutral-900" },
          { label: "Pending Approval", value: pendingCount, color: "text-amber-600" },
          { label: "Approved", value: approvedCount, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-neutral-400">{stat.label}</p>
            <p className={`mt-1 text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl border border-neutral-100 bg-neutral-50 p-1 w-fit">
        {(["all", "pending", "approved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors capitalize ${
              filter === tab
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            {tab}
            {tab === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-[#c9744e]" />
            <span className="ml-3 text-sm">Loading reviews…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <Star className="h-6 w-6 text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-500">
              {filter === "pending" ? "No reviews pending approval" : filter === "approved" ? "No approved reviews yet" : "No reviews yet"}
            </p>
            <p className="text-xs text-neutral-400">Reviews submitted by customers will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((review) => (
              <div key={review.id} className="flex items-start gap-4 px-5 py-4">
                {/* Product thumbnail */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-[#fdf8f5]">
                  {review.products?.image_url ? (
                    <img
                      src={review.products.image_url}
                      alt={review.products.name ?? ""}
                      className="h-full w-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <Star className="h-5 w-5 text-neutral-300" />
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-800 truncate">
                      {review.customer_name}
                    </span>
                    <StarRow rating={review.rating} />
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      review.is_approved
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {review.is_approved ? <><Check className="h-2.5 w-2.5" /> Approved</> : "Pending"}
                    </span>
                    {review.is_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        <Check className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Product link */}
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className="text-[11px] text-neutral-400">on</span>
                    {review.products?.slug ? (
                      <Link
                        href={`/product/${review.products.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#a0522d] hover:underline"
                      >
                        {review.products.name}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-neutral-500">{review.products?.name ?? "Unknown product"}</span>
                    )}
                    <span className="ml-2 text-[11px] text-neutral-300">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>

                  {review.title && (
                    <p className="mt-2 text-sm font-semibold text-neutral-800">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600 line-clamp-3">
                    {review.comment}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                  {!review.is_approved ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(review.id, true)}
                      disabled={isPending}
                      title="Approve review"
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApprove(review.id, false)}
                      disabled={isPending}
                      title="Unapprove review"
                      className="flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-200 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Unapprove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    disabled={isPending}
                    title="Delete review"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
