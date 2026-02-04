import { supabase } from '@/lib/supabase'
import { validateLessonContent } from './validate'
import type { LessonContent } from '@/types/schemas'

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
 * NOTE: This should only be run by admin users or via a protected API route.
 */
export async function seedLessons({
  unitId,
  items,
  dryRun = false,
}: SeedParams) {
  console.log(
    `🌱 Starting seed process for Unit: ${unitId} (${items.length} items)`
  )

  // 1. Validation Phase
  console.log('🔍 Validating content...')
  for (const item of items) {
    try {
      validateLessonContent(item.content)
    } catch (error) {
      throw new Error(
        `Validation failed for lesson "${item.title}": ${(error as Error).message}`
      )
    }
  }
  console.log('✅ All content is valid.')

  if (dryRun) {
    console.log('🛑 Dry run enabled. Skipping database write.')
    return
  }

  // 2. Database Write Phase
  console.log('💾 Writing to database...')

  // We map to the DB column names (snake_case)
  const records = items.map((item) => ({
    unit_id: unitId,
    title: item.title,
    order_index: item.orderIndex,
    content: item.content as unknown as object, // Casth to object for JSONB
  }))

  const { error } = await supabase
    .from('lessons')
    .upsert(records, { onConflict: 'unit_id, order_index' })

  if (error) {
    console.error('❌ Database Error:', error)
    throw new Error('Failed to seed lessons: ' + error.message)
  }

  console.log('🎉 Seeding complete!')
}
