import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { UnitFileSchema } from '../src/types/schemas'
import { seedLessons } from '../src/features/admin/seed'
import { ZodError } from 'zod'

// We'll use a simple recursive directory scan or just readdir if we don't have glob installed yet.
// Since we don't know if 'glob' is installed, let's use a simple helper.
async function getJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Recursive? The plan said content/units/*.json, likely flat.
      // But recursive is safer.
      files.push(...(await getJsonFiles(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  console.log(`🌱 Starting Seeder (Dry Run: ${isDryRun})`)

  // 1. Load Env
  loadEnv({ path: path.resolve(process.cwd(), '.env.local') })
  loadEnv({ path: path.resolve(process.cwd(), '.env') })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!isDryRun && (!supabaseUrl || !serviceRoleKey)) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const client =
    !isDryRun && supabaseUrl && serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : null

  // 2. Scan Files
  const contentDir = path.resolve(process.cwd(), 'content/units')
  try {
    await fs.access(contentDir)
  } catch {
    console.error(`❌ Content directory not found: ${contentDir}`)
    console.log('👉 Please create "content/units" and add some JSON files.')
    process.exit(1)
  }

  const files = await getJsonFiles(contentDir)
  if (files.length === 0) {
    console.warn('⚠️  No JSON files found in content/units')
    return
  }

  console.log(`Start processing ${files.length} files...`)

  // 3. Process Each Unit
  for (const file of files) {
    const relativeName = path.relative(process.cwd(), file)
    console.log(`\n📄 Processing: ${relativeName}`)

    try {
      const raw = await fs.readFile(file, 'utf-8')
      const json = JSON.parse(raw)

      // 4. Validate Schema
      const unit = UnitFileSchema.parse(json)
      console.log(
        `   ✅ Validated Unit: "${unit.title}" (${unit.lessons.length} lessons)`
      )

      // 5. Seed to DB
      // We reuse the existing logic in src/features/admin/seed.ts
      // But we need to adapt the unit.id.
      // Strategy: look up unit by 'order' or 'title' if ID is missing?
      // For Phase 2.5, let's assume we Upsert Unit by ID if present, or create new.
      // But `seedLessons` logic asks for a unitId.

      // Let's FIRST upsert the Unit itself to get an ID.
      let unitId = unit.id

      if (!isDryRun && client) {
        // Upsert Unit
        const { data, error } = await client
          .from('units')
          .upsert(
            {
              // If id is provided, use it. If not, maybe we should slugify title?
              // Or let DB generate? If DB generates, we can't idempotently seed easily without a stable key.
              // RECOMMENDATION: Use 'order_index' as a stable lookup or require ID.
              // Let's use order_index to find existing unit, else insert.
              title: unit.title,
              order_index: unit.order,
              description: unit.description,
              ...(unitId ? { id: unitId } : {}),
            },
            { onConflict: 'order_index' }
          ) // Assume order_index is unique
          .select()
          .single()

        if (error) throw new Error(`Failed to upsert unit: ${error.message}`)
        unitId = data.id
      } else {
        unitId = unitId || 'dry-run-unit-id'
      }

      // 6. Seed Lessons
      await seedLessons(client, {
        unitId: unitId!,
        items: unit.lessons.map((l) => ({
          title: l.title,
          orderIndex: l.order,
          content: l.content,
        })),
        dryRun: isDryRun,
      })
    } catch (err) {
      console.error(`   ❌ Error in ${relativeName}:`)
      if (err instanceof ZodError) {
        err.issues.forEach((i) =>
          console.error(`      - [${i.path.join('.')}] ${i.message}`)
        )
      } else if (err instanceof SyntaxError) {
        console.error(`      - Invalid JSON syntax`)
      } else {
        console.error(`      - ${(err as Error).message}`)
      }
      process.exit(1) // Fail strict
    }
  }

  console.log('\n✨ Seeding Complete!')
}

main().catch(console.error)
