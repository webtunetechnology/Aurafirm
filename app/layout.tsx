import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const BASE_URL = 'https://aurafirm.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AURAFIRM — Where Science Meets Self-Care',
    template: '%s | AURAFIRM',
  },
  description:
    'AURAFIRM creates high-quality, science-backed skincare and wellness supplements formulated for Indian skin — clean, effective, and dermatologist-trusted.',
  keywords: [
    'AURAFIRM', 'skincare India', 'science-backed skincare', 'Indian skincare brand',
    'clean beauty India', 'wellness supplements India', 'L-Glutathione', 'effervescent tablets',
    'dermatologist tested skincare', 'vegan skincare', 'cruelty-free skincare India',
  ],
  authors: [{ name: 'AURAFIRM', url: BASE_URL }],
  creator: 'AURAFIRM',
  publisher: 'AURAFIRM',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'AURAFIRM',
    title: 'AURAFIRM — Where Science Meets Self-Care',
    description:
      'Science-backed skincare and wellness supplements formulated for Indian skin. Clean, effective, and dermatologist-trusted.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AURAFIRM — Where Science Meets Self-Care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AURAFIRM — Where Science Meets Self-Care',
    description:
      'Science-backed skincare and wellness supplements formulated for Indian skin.',
    images: ['/og-image.jpg'],
    creator: '@aurafirm_',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#8a4a32',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CartProvider>
      </body>
    </html>
  )
}
