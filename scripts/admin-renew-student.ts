import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'node:path'

function getArg(flag: string) {
  const index = process.argv.indexOf(flag)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

function parseDays(value: string | undefined) {
  if (!value) return 60
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid --days value. Use a positive number.')
  }
  return parsed
}

async function main() {
  loadEnv({ path: path.resolve(process.cwd(), '.env.local') })
  loadEnv({ path: path.resolve(process.cwd(), '.env') })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  const key = getArg('--key')
  if (!key) {
    throw new Error(
      'Usage: npm run admin:renew -- --key <student-key> [--group <class-group>]'
    )
  }

  const group = getArg('--group')
  const expiresAtArg = getArg('--expires-at')
  const days = parseDays(getArg('--days'))
  const expiresAt = expiresAtArg
    ? new Date(expiresAtArg)
    : new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  if (Number.isNaN(expiresAt.getTime())) {
    throw new Error('Invalid --expires-at value. Use ISO date string.')
  }

  const email = `${key}@german-mastery.student`
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (profileError || !profile) {
    throw new Error('Student not found for provided key.')
  }

  const updates: { expires_at: string; class_group?: string | null } = {
    expires_at: expiresAt.toISOString(),
  }

  if (group !== undefined) {
    updates.class_group = group || null
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profile.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  console.log(`Student access renewed for ${email}`)
  console.log(`Expires at: ${expiresAt.toISOString()}`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
