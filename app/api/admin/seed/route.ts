import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ONE-TIME route to bootstrap the first admin account.
// Call GET /api/admin/seed once, then the credentials will work on /admin-login.
// Credentials: admin@aurafirm.com / Aurafirm@2025
export async function GET() {
  const supabase = await createClient()

  const email = 'admin@aurafirm.com'
  const password = 'Aurafirm@2025'

  // Check if admin already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_admin', true)
    .limit(1)
    .single()

  if (existing) {
    return NextResponse.json({
      message: 'Admin already exists.',
      email,
      password,
    })
  }

  // Sign up the admin user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Admin User',
        phone: '',
        is_admin: true,
      },
    },
  })

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 500 })
  }

  const userId = signUpData?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'User created but no ID returned.' }, { status: 500 })
  }

  // The trigger auto-creates a profiles row, but we need to force is_admin = true
  // in case the trigger hasn't run yet or the user wasn't confirmed.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'Admin User',
      phone: '',
      is_admin: true,
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Admin account created successfully.',
    email,
    password,
  })
}
