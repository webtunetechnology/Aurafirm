import { getWhyPillars } from "@/lib/actions"
import WhyAurafirmClient from "@/components/WhyAurafirmClient"

export const metadata = {
  title: "Why AURAFIRM | Premium Vegan Skincare",
  description:
    "Discover what makes AURAFIRM different — science-backed formulations, 100% vegan ingredients, dermatologist tested, and made for real results.",
}

export default async function WhyAurafirmPage() {
  const pillars = await getWhyPillars()
  return <WhyAurafirmClient pillars={pillars} />
}
