import { adminGetProducts } from "@/lib/actions"
import AdminProductsClient from "@/components/admin/AdminProductsClient"

export default async function AdminProductsPage() {
  const products = await adminGetProducts()
  return <AdminProductsClient products={products} />
}
