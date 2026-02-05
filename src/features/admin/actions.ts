'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

type ActionState = { error?: string; success?: string } | null
type AdminClient = SupabaseClient

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

function parseDays(value: string | null) {
  if (!value) return 60
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

function parseExpiresAt(expiresAtRaw: string | null, daysRaw: string | null) {
  if (expiresAtRaw) {
    const date = new Date(expiresAtRaw)
    if (Number.isNaN(date.getTime())) return null
    return date
  }
  const days = parseDays(daysRaw)
  if (!days) return null
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

async function requireAdmin(): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    return { error: 'Admin access required' }
  }

  return {}
}

async function resolveUserIdByEmail(client: AdminClient, email: string) {
  const { data: profile, error } = await client
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (error || !profile) {
    return null
  }

  return profile.id
}

async function activateFirstLesson(client: AdminClient, userId: string) {
  const { data: firstUnit } = await client
    .from('units')
    .select('id')
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!firstUnit) return

  const { data: firstLesson } = await client
    .from('lessons')
    .select('id')
    .eq('unit_id', firstUnit.id)
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!firstLesson) return

  await client.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: firstLesson.id,
      status: 'active',
      stars: 0,
    },
    { onConflict: 'user_id, lesson_id' }
  )
}

async function getLessonIdsForUnit(client: AdminClient, unitId: string) {
  const { data, error } = await client
    .from('lessons')
    .select('id')
    .eq('unit_id', unitId)
    .order('order_index', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((lesson) => lesson.id)
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

async function unlockLessonsForUsers(
  client: AdminClient,
  userIds: string[],
  lessonIds: string[]
) {
  let unlockedCount = 0

  for (const userChunk of chunkArray(userIds, 100)) {
    const { data: existing } = await client
      .from('user_progress')
      .select('user_id, lesson_id, status, stars')
      .in('user_id', userChunk)
      .in('lesson_id', lessonIds)

    const existingMap = new Map(
      (existing ?? []).map((row) => [`${row.user_id}:${row.lesson_id}`, row])
    )

    const rows = []
    for (const userId of userChunk) {
      for (const lessonId of lessonIds) {
        const key = `${userId}:${lessonId}`
        const current = existingMap.get(key)
        if (current?.status === 'completed') {
          continue
        }
        rows.push({
          user_id: userId,
          lesson_id: lessonId,
          status: 'active',
          stars: current?.stars ?? 0,
        })
      }
    }

    if (rows.length > 0) {
      const { error } = await client
        .from('user_progress')
        .upsert(rows, { onConflict: 'user_id, lesson_id' })
      if (error) throw new Error(error.message)
      unlockedCount += rows.length
    }
  }

  return unlockedCount
}

export async function createStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminCheck = await requireAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const client = getServiceClient()
  if (!client) {
    return { error: 'Missing server role key.' }
  }

  const key = (formData.get('key') ?? '').toString().trim()
  const group = (formData.get('group') ?? '').toString().trim()
  const daysRaw = (formData.get('days') ?? '').toString().trim()
  const expiresAtRaw = (formData.get('expiresAt') ?? '').toString().trim()
  const activateFirst = formData.get('activateFirst') === 'on'

  if (!key) return { error: 'Student key is required.' }

  const expiresAt = parseExpiresAt(expiresAtRaw || null, daysRaw || null)
  if (!expiresAt) return { error: 'Invalid expiration date or days value.' }

  const email = `${key}@german-mastery.student`

  const { data: created, error: createError } =
    await client.auth.admin.createUser({
      email,
      password: key,
      email_confirm: true,
    })

  let userId = created?.user?.id

  if (createError) {
    const message = createError.message.toLowerCase()
    if (!message.includes('already') && !message.includes('exists')) {
      return { error: createError.message }
    }
  }

  if (!userId) {
    userId = await resolveUserIdByEmail(client, email)
  }

  if (!userId) return { error: 'Unable to locate user profile.' }

  const { error: upsertError } = await client.from('profiles').upsert(
    {
      id: userId,
      email,
      role: 'student',
      expires_at: expiresAt.toISOString(),
      class_group: group || null,
    },
    { onConflict: 'id' }
  )

  if (upsertError) return { error: upsertError.message }

  if (activateFirst) {
    await activateFirstLesson(client, userId)
  }

  return { success: `Student key provisioned for ${email}` }
}

export async function renewStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminCheck = await requireAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const client = getServiceClient()
  if (!client) {
    return { error: 'Missing server role key.' }
  }

  const key = (formData.get('key') ?? '').toString().trim()
  const daysRaw = (formData.get('days') ?? '').toString().trim()
  const expiresAtRaw = (formData.get('expiresAt') ?? '').toString().trim()

  if (!key) return { error: 'Student key is required.' }

  const expiresAt = parseExpiresAt(expiresAtRaw || null, daysRaw || null)
  if (!expiresAt) return { error: 'Invalid expiration date or days value.' }

  const email = `${key}@german-mastery.student`
  const userId = await resolveUserIdByEmail(client, email)
  if (!userId) return { error: 'Student not found for that key.' }

  const { error } = await client
    .from('profiles')
    .update({ expires_at: expiresAt.toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }

  return { success: `Access renewed for ${email}` }
}

export async function setGroupAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminCheck = await requireAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const client = getServiceClient()
  if (!client) {
    return { error: 'Missing server role key.' }
  }

  const key = (formData.get('key') ?? '').toString().trim()
  const group = (formData.get('group') ?? '').toString().trim()

  if (!key) return { error: 'Student key is required.' }

  const email = `${key}@german-mastery.student`
  const userId = await resolveUserIdByEmail(client, email)
  if (!userId) return { error: 'Student not found for that key.' }

  const { error } = await client
    .from('profiles')
    .update({ class_group: group || null })
    .eq('id', userId)

  if (error) return { error: error.message }

  return { success: `Group updated for ${email}` }
}

export async function activateLessonAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminCheck = await requireAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const client = getServiceClient()
  if (!client) {
    return { error: 'Missing server role key.' }
  }

  const key = (formData.get('key') ?? '').toString().trim()
  const lessonId = (formData.get('lessonId') ?? '').toString().trim()

  if (!key || !lessonId) {
    return { error: 'Student key and lesson id are required.' }
  }

  const email = `${key}@german-mastery.student`
  const userId = await resolveUserIdByEmail(client, email)
  if (!userId) return { error: 'Student not found for that key.' }

  const { data: existing } = await client
    .from('user_progress')
    .select('status, stars')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (existing?.status === 'completed') {
    return { success: 'Lesson already completed. No change applied.' }
  }

  const { error } = await client.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      status: 'active',
      stars: existing?.stars ?? 0,
    },
    { onConflict: 'user_id, lesson_id' }
  )

  if (error) return { error: error.message }

  return { success: `Lesson activated for ${email}` }
}

export async function unlockUnitForStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminCheck = await requireAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const client = getServiceClient()
  if (!client) {
    return { error: 'Missing server role key.' }
  }

  const key = (formData.get('key') ?? '').toString().trim()
  const unitId = (formData.get('unitId') ?? '').toString().trim()

  if (!key || !unitId) {
    return { error: 'Student key and unit id are required.' }
  }

  const email = `${key}@german-mastery.student`
  const userId = await resolveUserIdByEmail(client, email)
  if (!userId) return { error: 'Student not found for that key.' }

  const lessonIds = await getLessonIdsForUnit(client, unitId)
  if (lessonIds.length === 0) {
    return { error: 'No lessons found for that unit.' }
  }

  const unlockedCount = await unlockLessonsForUsers(client, [userId], lessonIds)

  return { success: `Unlocked ${unlockedCount} lessons for ${email}` }
}

export async function unlockUnitForGroupAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminCheck = await requireAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const client = getServiceClient()
  if (!client) {
    return { error: 'Missing server role key.' }
  }

  const group = (formData.get('group') ?? '').toString().trim()
  const unitId = (formData.get('unitId') ?? '').toString().trim()

  if (!group || !unitId) {
    return { error: 'Group name and unit id are required.' }
  }

  const { data: profiles, error } = await client
    .from('profiles')
    .select('id')
    .eq('class_group', group)
    .eq('role', 'student')

  if (error) return { error: error.message }

  const userIds = (profiles ?? []).map((profile) => profile.id)
  if (userIds.length === 0) {
    return { error: 'No students found for that group.' }
  }

  const lessonIds = await getLessonIdsForUnit(client, unitId)
  if (lessonIds.length === 0) {
    return { error: 'No lessons found for that unit.' }
  }

  const unlockedCount = await unlockLessonsForUsers(client, userIds, lessonIds)

  return {
    success: `Unlocked ${unlockedCount} lessons for group ${group}`,
  }
}

export async function unlockLessonForGroupAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminCheck = await requireAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const client = getServiceClient()
  if (!client) {
    return { error: 'Missing server role key.' }
  }

  const group = (formData.get('group') ?? '').toString().trim()
  const lessonId = (formData.get('lessonId') ?? '').toString().trim()

  if (!group || !lessonId) {
    return { error: 'Group name and lesson id are required.' }
  }

  const { data: profiles, error } = await client
    .from('profiles')
    .select('id')
    .eq('class_group', group)
    .eq('role', 'student')

  if (error) return { error: error.message }

  const userIds = (profiles ?? []).map((profile) => profile.id)
  if (userIds.length === 0) {
    return { error: 'No students found for that group.' }
  }

  const unlockedCount = await unlockLessonsForUsers(client, userIds, [lessonId])

  return {
    success: `Unlocked ${unlockedCount} lessons for group ${group}`,
  }
}
