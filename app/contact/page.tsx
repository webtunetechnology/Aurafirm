import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the AURAFIRM team. Questions about your order, ingredients, or skincare routine? We're here to help — reach out via email or our contact form.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact AURAFIRM",
    description:
      "Reach out to the AURAFIRM team for order support, skincare advice, or general enquiries.",
    url: "/contact",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Contact AURAFIRM" }],
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
