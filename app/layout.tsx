import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import Navbar from '@/components/Navbar'
import { Toaster } from 'sonner'
import Script from 'next/script'

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
  verification: {
    google: 'moDJnNUMZ73uLtseB0ZoCXRi7tRqBaAxNoo3qSryiaA',
  },
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
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon-light-32x32.png',
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
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-W920LHV8T4"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-W920LHV8T4');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          <Navbar />
          {children}
          <Toaster
            position="bottom-right"
            duration={2200}
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#3f3f46',
                border: '1px solid #ecdcd3',
                borderRadius: '12px',
                padding: '14px 16px',
                boxShadow: '0 8px 24px rgba(201, 116, 78, 0.12)',
              },
              classNames: {
                title: 'text-sm font-medium',
                description: 'text-xs text-neutral-500',
              },
            }}
          />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CartProvider>
      </body>
    </html>
  )
}