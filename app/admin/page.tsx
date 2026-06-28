import { adminGetDashboardStats, adminGetTopProducts } from "@/lib/actions"
import AdminDashboardClient from "@/components/admin/AdminDashboardClient"

export default async function AdminDashboardPage() {
  const [stats, topProducts] = await Promise.all([
    adminGetDashboardStats(),
    adminGetTopProducts(),
  ])
  return <AdminDashboardClient stats={stats} topProducts={topProducts} />
}
