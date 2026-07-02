import type { Metadata } from "next"
import LoginPageClient from "./LoginPageClient"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your AURAFIRM account to track orders, manage your profile, and access exclusive member benefits.",
  alternates: { canonical: "/account/login" },
  robots: { index: false, follow: false },
}

export default function CustomerLoginPage() {
  return <LoginPageClient />
}
