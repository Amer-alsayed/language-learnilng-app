import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'node:path'

function getArg(flag: string) {
  const index = process.argv.indexOf(flag)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

function hasFlag(flag: string) {
  return process.argv.includes(flag)
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
      'Usage: npm run admin:create -- --key <student-key> [--group <class-group>]'
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

  const activateFirst = !hasFlag('--no-activate-first')
  const email = `${key}@german-mastery.student`

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password: key,
      email_confirm: true,
    })

  let userId = created?.user?.id

  if (createError) {
    const message = createError.message.toLowerCase()
    if (!message.includes('already') && !message.includes('exists')) {
      throw new Error(createError.message)
    }
  }

  if (!userId) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      throw new Error('Could not resolve user id for existing key.')
    }
    userId = profile.id
  }

  const { error: profileUpsertError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      role: 'student',
      expires_at: expiresAt.toISOString(),
      ...(group ? { class_group: group } : {}),
    },
    { onConflict: 'id' }
  )

  if (profileUpsertError) {
    throw new Error(profileUpsertError.message)
  }

  if (activateFirst) {
    const { data: firstUnit } = await supabase
      .from('units')
      .select('id')
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (firstUnit) {
      const { data: firstLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('unit_id', firstUnit.id)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (firstLesson) {
        await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            lesson_id: firstLesson.id,
            status: 'active',
            stars: 0,
          },
          { onConflict: 'user_id, lesson_id' }
        )
      }
    }
  }

  console.log(`Student key provisioned for ${email}`)
  console.log(`Expires at: ${expiresAt.toISOString()}`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
