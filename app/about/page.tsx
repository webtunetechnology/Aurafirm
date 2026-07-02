import { getOurStoryContent, getOurStoryMilestones, getOurStoryValues } from "@/lib/actions"
import OurStoryClient from "@/components/OurStoryClient"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Learn how AURAFIRM was born from a passion for science-backed, clean skincare. Discover the mission, values, and ingredient philosophy behind every product.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Our Story | AURAFIRM",
    description:
      "AURAFIRM was founded on the belief that skincare should be backed by science, not just trends. Read the story behind every formula.",
    url: "/about",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "AURAFIRM Our Story" }],
  },
}

export default async function AboutPage() {
  const [content, milestones, values] = await Promise.all([
    getOurStoryContent(),
    getOurStoryMilestones(),
    getOurStoryValues(),
  ])
  return <OurStoryClient content={content} milestones={milestones} values={values} />
}
