import { adminGetOurStoryData } from "@/lib/actions"
import AdminOurStoryClient from "@/components/admin/AdminOurStoryClient"

export default async function AdminOurStoryPage() {
  const data = await adminGetOurStoryData()
  return <AdminOurStoryClient {...data} />
}
