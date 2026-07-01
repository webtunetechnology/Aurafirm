import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminLayoutClient from "@/components/admin/AdminLayoutClient"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin-login")

  const isAdmin = user.user_metadata?.is_admin === true
  if (!isAdmin) redirect("/admin-login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("status", "pending")

  return (
    <AdminLayoutClient
      adminName={profile?.full_name ?? user.user_metadata?.full_name ?? "Admin User"}
      pendingCount={count ?? 0}
    >
      {children}
    </AdminLayoutClient>
  )
}
