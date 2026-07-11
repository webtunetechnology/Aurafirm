import { adminGetPromoBanners } from "@/lib/actions"
import AdminBannersClient from "@/components/admin/AdminBannersClient"

export default async function AdminBannersPage() {
  const banners = await adminGetPromoBanners()
  return <AdminBannersClient banners={banners} />
}
