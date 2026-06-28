import { Star, MessageSquare } from "lucide-react"

export default function AdminReviewsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Reviews</h1>
        <p className="mt-0.5 text-xs text-neutral-500">Customer reviews and ratings for your products.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-24 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf0e8]">
          <Star className="h-7 w-7 text-[#c9744e]" />
        </div>
        <h2 className="text-base font-bold text-neutral-800">Reviews Coming Soon</h2>
        <p className="mt-2 max-w-xs text-xs text-neutral-400">
          Once customers submit reviews on product pages, they will appear here for moderation and approval.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-500">
          <MessageSquare className="h-3.5 w-3.5" />
          No reviews yet — be the first to collect feedback!
        </div>
      </div>
    </div>
  )
}
