import type { SupabaseClient } from '@supabase/supabase-js'
import { validateLessonContent } from './validate'
import type { LessonContent } from '../../types/schemas'

interface SeedParams {
  unitId: string
  items: {
    title: string
    orderIndex: number
    content: LessonContent
  }[]
  dryRun?: boolean
}

/**
 * Seeds lessons into the database.
 * NOTE: This should only be run by admin users or via a protected server script.
 */
export async function seedLessons(
  client: SupabaseClient,
  { unitId, items, dryRun = false }: SeedParams
) {
  console.log(
    `Starting seed process for unit ${unitId} (${items.length} lessons)`
  )

  // 1. Validation Phase
  console.log('Validating content...')
  for (const item of items) {
    try {
      validateLessonContent(item.content)
    } catch (error) {
      throw new Error(
        `Validation failed for lesson "${item.title}": ${(error as Error).message}`
      )
    }
  }
  console.log('All content is valid.')

  if (dryRun) {
    console.log('Dry run enabled. Skipping database write.')
    return
  }

  // 2. Database Write Phase
  console.log('Writing to database...')

  // Map to DB column names (snake_case)
  const records = items.map((item) => ({
    unit_id: unitId,
    title: item.title,
    order_index: item.orderIndex,
    content: item.content as unknown as Record<string, unknown>,
  }))

  const { error } = await client
    .from('lessons')
    .upsert(records, { onConflict: 'unit_id, order_index' })

  if (error) {
    console.error('Database error:', error)
    throw new Error('Failed to seed lessons: ' + error.message)
  }

  console.log('Seeding complete.')
}
