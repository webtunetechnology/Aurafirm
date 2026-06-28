import { createClient } from '@/lib/supabase/server'
import HomepageClient from '@/components/HomepageClient'

export default async function Home() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  return <HomepageClient products={products ?? []} />
}
