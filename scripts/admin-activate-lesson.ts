import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'node:path'

function getArg(flag: string) {
  const index = process.argv.indexOf(flag)
  if (index === -1) return undefined
  return process.argv[index + 1]
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
  const lessonId = getArg('--lesson')
  if (!key || !lessonId) {
    throw new Error(
      'Usage: npm run admin:activate -- --key <student-key> --lesson <lesson-id>'
    )
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

  const { data: existing } = await supabase
    .from('user_progress')
    .select('status, stars')
    .eq('user_id', profile.id)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (existing?.status === 'completed') {
    console.log('Lesson already completed. Not downgrading status.')
    return
  }

  const { error: upsertError } = await supabase.from('user_progress').upsert(
    {
      user_id: profile.id,
      lesson_id: lessonId,
      status: 'active',
      stars: existing?.stars ?? 0,
    },
    { onConflict: 'user_id, lesson_id' }
  )

  if (upsertError) {
    throw new Error(upsertError.message)
  }

  console.log(`Lesson activated for ${email}`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
