import { adminGetContactMessages } from "@/lib/actions"
import AdminContactsClient from "@/components/admin/AdminContactsClient"

export default async function AdminContactsPage() {
  const messages = await adminGetContactMessages()
  return <AdminContactsClient messages={messages} />
}
