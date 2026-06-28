import { redirect } from "next/navigation"

// Legacy /product route — redirects to the hero product.
// All individual products are served at /product/[slug].
export default function ProductIndexPage() {
  redirect("/product/fusion-4x1-face-serum")
}
