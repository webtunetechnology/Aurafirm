import { adminGetAllWhyPillars } from "@/lib/actions"
import AdminWhyAurafirmClient from "@/components/admin/AdminWhyAurafirmClient"

export default async function AdminWhyAurafirmPage() {
  const pillars = await adminGetAllWhyPillars()
  return <AdminWhyAurafirmClient pillars={pillars} />
}
