import { getOurStoryContent, getOurStoryMilestones, getOurStoryValues } from "@/lib/actions"
import OurStoryClient from "@/components/OurStoryClient"

export const metadata = {
  title: "Our Story | AURAFIRM",
  description: "Learn how AURAFIRM was born from a passion for science-backed, clean skincare.",
}

export default async function AboutPage() {
  const [content, milestones, values] = await Promise.all([
    getOurStoryContent(),
    getOurStoryMilestones(),
    getOurStoryValues(),
  ])
  return <OurStoryClient content={content} milestones={milestones} values={values} />
}
