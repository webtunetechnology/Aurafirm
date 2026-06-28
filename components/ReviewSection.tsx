"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Star, Pencil, ThumbsUp, Lock, Check, X, ChevronDown } from "lucide-react"
import { submitReview, deleteMyReview } from "@/lib/actions"
import type { Review } from "@/lib/actions"

// ─── Star picker ─────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Review form ──────────────────────────────────────────────────────────────

function ReviewForm({
  productId,
  existing,
  onClose,
}: {
  productId: string
  existing: Review | null
  onClose: () => void
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [title, setTitle] = useState(existing?.title ?? "")
  const [comment, setComment] = useState(existing?.comment ?? "")
  const [serverError, setServerError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setServerError("Please select a star rating."); return }
    if (!comment.trim()) { setServerError("Please write your review."); return }
    setServerError("")
    startTransition(async () => {
      const res = await submitReview({ productId, rating, title, comment })
      if (res.error) { setServerError(res.error); return }
      setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-6 w-6 text-emerald-600" />
        </div>
        <p className="text-base font-semibold text-gray-900">Review submitted!</p>
        <p className="max-w-xs text-sm text-gray-500">
          Your review is under review and will appear once approved. Thank you for the feedback.
        </p>
        <button
          onClick={onClose}
          className="mt-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Rating */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">Your Rating *</label>
        <div className="flex items-center gap-3">
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="text-sm font-medium text-amber-600">{ratingLabels[rating]}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Review Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          maxLength={100}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20"
        />
      </div>

      {/* Comment */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Your Review *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience with the product — what you liked, how you used it, and results you noticed."
          rows={5}
          maxLength={1500}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/20"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/1500</p>
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-[#8B4513] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : existing ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  )
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review, currentUserId, onDelete }: {
  review: Review
  currentUserId: string | null
  onDelete: (id: string) => void
}) {
  const filledStars = Math.round(review.rating)
  const initials = review.customer_name
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8B4513]/10 text-sm font-bold text-[#8B4513]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{review.customer_name}</p>
            {review.is_verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <Check className="h-3 w-3" /> Verified Purchase
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i <= filledStars ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          {currentUserId === review.customer_id && (
            <button
              type="button"
              onClick={() => onDelete(review.id)}
              aria-label="Delete your review"
              className="ml-1 rounded-full p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {review.title && (
        <p className="mt-3 text-sm font-semibold text-gray-900">{review.title}</p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.comment}</p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
        <ThumbsUp className="h-3.5 w-3.5" />
        <span>Helpful</span>
      </div>
    </article>
  )
}

// ─── Rating distribution bar ─────────────────────────────────────────────────

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-10 shrink-0 items-center justify-end gap-1 text-sm text-gray-500">
        {stars}<Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs text-gray-400">{count}</span>
    </div>
  )
}

// ─── Main ReviewSection ───────────────────────────────────────────────────────

type Props = {
  productId: string
  initialReviews: Review[]
  isLoggedIn: boolean
  currentUserId: string | null
  existingReview: Review | null
  /** Avg rating and count from product record (used when no reviews yet) */
  productRating: number
  productReviewCount: number
}

export default function ReviewSection({
  productId,
  initialReviews,
  isLoggedIn,
  currentUserId,
  existingReview,
  productRating,
  productReviewCount,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [deleting, startDeleteTransition] = useTransition()

  // Compute live stats from loaded reviews; fall back to product-level data
  const avgRating =
    reviews.length > 0
      ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : productRating
  const reviewCount = reviews.length > 0 ? reviews.length : productReviewCount
  const filledStars = Math.round(avgRating)

  // Distribution from live reviews
  const dist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }))

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      await deleteMyReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    })
  }

  // Show all vs truncated
  const [showAll, setShowAll] = useState(false)
  const visibleReviews = showAll ? reviews : reviews.slice(0, 4)

  return (
    <section className="mt-6" id="reviews">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-balance text-2xl font-bold text-gray-900 md:text-3xl">Customer Reviews</h2>
        <p className="mt-1 text-sm text-gray-500">Real experiences from verified buyers</p>
      </div>

      {/* Summary row */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          {/* Left: score */}
          <div className="flex flex-col items-start">
            <span className="text-5xl font-bold leading-none text-gray-900">{avgRating}</span>
            <div className="mt-3 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-5 w-5 ${i <= filledStars ? "fill-amber-500 text-amber-500" : "fill-gray-200 text-gray-200"}`} />
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Based on <span className="font-semibold text-gray-900">{reviewCount}</span> review{reviewCount !== 1 ? "s" : ""}
            </p>

            {/* Write Review CTA */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#8B4513] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Pencil className="h-3.5 w-3.5" />
                {existingReview ? "Edit Your Review" : "Write a Review"}
              </button>
            ) : (
              <Link
                href={`/account/login?redirect=/product`}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Lock className="h-3.5 w-3.5" />
                Login to Write a Review
              </Link>
            )}
          </div>

          {/* Right: distribution */}
          <div className="flex flex-col gap-2.5">
            {dist.map((row) => (
              <RatingBar key={row.stars} stars={row.stars} count={row.count} total={reviewCount} />
            ))}
          </div>
        </div>

        {/* Inline form */}
        {showForm && isLoggedIn && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="mb-5 text-base font-bold text-gray-900">
              {existingReview ? "Edit Your Review" : "Write Your Review"}
            </h3>
            <ReviewForm
              productId={productId}
              existing={existingReview}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}
      </div>

      {/* Login prompt banner */}
      {!isLoggedIn && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#8B4513]/20 bg-[#fdf6f2] px-5 py-4">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 shrink-0 text-[#8B4513]" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Share your experience.</span> Login to write a review for this product.
            </p>
          </div>
          <Link
            href="/account/login"
            className="shrink-0 rounded-full bg-[#8B4513] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Login
          </Link>
        </div>
      )}

      {/* Review cards */}
      {reviews.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {visibleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          ))}

          {reviews.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              {showAll ? "Show Less" : `Show all ${reviews.length} reviews`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Star className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400">Be the first to share your experience with this product.</p>
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-1 rounded-full bg-[#8B4513] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Write the first review
            </button>
          )}
        </div>
      )}
    </section>
  )
}
