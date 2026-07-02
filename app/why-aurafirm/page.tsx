import { getWhyPillars } from "@/lib/actions"
import WhyAurafirmClient from "@/components/WhyAurafirmClient"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Why AURAFIRM",
  description:
    "Discover what sets AURAFIRM apart — science-backed formulations, 100% vegan ingredients, dermatologist-tested, and made for real, visible results on Indian skin.",
  alternates: { canonical: "/why-aurafirm" },
  openGraph: {
    title: "Why AURAFIRM | Vegan Science-Backed Skincare",
    description:
      "Science-backed. Vegan. Dermatologist-tested. Discover why AURAFIRM is trusted by thousands for real skincare results.",
    url: "/why-aurafirm",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Why AURAFIRM" }],
  },
}

export default async function WhyAurafirmPage() {
  const pillars = await getWhyPillars()
  return <WhyAurafirmClient pillars={pillars} />
}
