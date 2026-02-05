'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type LoginState = { error?: string } | null

export async function loginWithKey(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const key = formData.get('accessKey') as string

  if (!key) {
    return { error: 'Access Key is required' }
  }

  const supabase = await createClient()
  const email = `${key}@german-mastery.student`
  const password = key

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // We return a generic error to not leak if key exists or not (security best practice),
    // though for this specific app 'Invalid Access Key' is fine.
    return { error: 'Invalid Access Key. Please check your key and try again.' }
  }

  const userId = data.user?.id
  if (!userId) {
    return { error: 'Unable to sign in. Please try again.' }
  }

  // Enforce expiration (manual keys by admin)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('expires_at')
    .eq('id', userId)
    .single()

  if (profileError) {
    return { error: 'Unable to validate access. Please try again.' }
  }

  if (profile?.expires_at && new Date(profile.expires_at) < new Date()) {
    await supabase.auth.signOut()
    return {
      error: 'Your access has expired. Please renew with your instructor.',
    }
  }

  redirect('/dashboard')
}
