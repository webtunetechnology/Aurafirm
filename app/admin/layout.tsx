import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin-login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single()
  if (!profile?.is_admin) redirect("/admin-login")

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("status", "pending")

  return (
    <div className="flex h-screen bg-[#faf8f6] overflow-hidden">
      <AdminSidebar pendingCount={count ?? 0} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar adminName={profile.full_name ?? "Admin User"} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
