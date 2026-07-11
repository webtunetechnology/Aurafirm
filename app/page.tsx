import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HomepageClient from '@/components/HomepageClient'
import { getPromoBanners } from '@/lib/actions'

export const metadata: Metadata = {
  title: 'AURAFIRM — Where Science Meets Self-Care',
  description:
    'Discover AURAFIRM\'s science-backed skincare and wellness supplements — formulated for Indian skin, dermatologist-trusted, vegan, and cruelty-free. Shop now.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AURAFIRM — Where Science Meets Self-Care',
    description:
      'Science-backed skincare and wellness supplements for Indian skin. Dermatologist-trusted, vegan & cruelty-free.',
    url: '/',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AURAFIRM Products' }],
  },
}

export default async function Home() {
  const supabase = await createClient()
  const [productsResult, banners] = await Promise.all([
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: true }),
    getPromoBanners(),
  ])

  return <HomepageClient products={productsResult.data ?? []} promoBanners={banners} />
}
