import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { ZodError } from 'zod'
import { LessonContentSchema, type LessonContent } from '../src/types/schemas'
import { seedLessons } from '../src/features/admin/seed'

type CsvRow = Record<string, string>

interface LessonSeed {
  orderIndex: number
  title: string
  introVideoUrl?: string
  passingScore?: number
  exercises: LessonContent['exercises']
}

interface SeedOptions {
  filePath: string
  unitId?: string
  dryRun: boolean
}

const DEFAULT_FILE = 'content/lessons.csv'

function printUsage() {
  console.log('Usage:')
  console.log('  npm run seed -- --file content/lessons.csv --unit <unit-uuid>')
  console.log('  npm run seed:dry -- --file content/lessons.csv')
  console.log('')
  console.log('Notes:')
  console.log('  - If your CSV includes a unit_id column, --unit is optional.')
  console.log('  - Use --dry-run to validate without writing to the database.')
}

function parseArgs(args: string[]): SeedOptions & { help: boolean } {
  const options: SeedOptions & { help: boolean } = {
    filePath: DEFAULT_FILE,
    unitId: undefined,
    dryRun: false,
    help: false,
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--file') {
      const value = args[i + 1]
      if (!value) {
        throw new Error('Missing value for --file')
      }
      options.filePath = value
      i += 1
      continue
    }
    if (arg === '--unit') {
      const value = args[i + 1]
      if (!value) {
        throw new Error('Missing value for --unit')
      }
      options.unitId = value
      i += 1
      continue
    }
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function splitList(value: string) {
  if (!value) return []
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitNumberList(value: string, label: string, line: number) {
  return splitList(value).map((item) => {
    const parsed = Number.parseInt(item, 10)
    if (Number.isNaN(parsed)) {
      throw new Error(`Line ${line}: invalid number in ${label}`)
    }
    return parsed
  })
}

function requireValue(value: string, label: string, line: number) {
  if (!value) {
    throw new Error(`Line ${line}: missing ${label}`)
  }
  return value
}

function parseFloatValue(value: string, label: string, line: number) {
  if (!value) return undefined
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Line ${line}: invalid ${label}`)
  }
  return parsed
}

function parseExercise(
  row: CsvRow,
  line: number
): LessonContent['exercises'][0] {
  const type = normalize(row.exercise_type)
  const id = normalize(row.exercise_id) || randomUUID()
  const prompt = requireValue(normalize(row.prompt), 'prompt', line)
  const audioUrl = normalize(row.audio_url)

  const base = {
    id,
    prompt,
    ...(audioUrl ? { audioUrl } : {}),
  }

  switch (type) {
    case 'multiple_choice': {
      const options = splitList(normalize(row.options))
      const correctIndexValue = normalize(row.correct_option_index)
      const correctOptionIndex = Number.parseInt(correctIndexValue, 10)
      if (options.length < 2) {
        throw new Error(
          `Line ${line}: multiple_choice needs at least 2 options`
        )
      }
      if (Number.isNaN(correctOptionIndex)) {
        throw new Error(`Line ${line}: invalid correct_option_index`)
      }
      if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
        throw new Error(`Line ${line}: correct_option_index is out of range`)
      }
      const explanation = normalize(row.explanation)
      return {
        ...base,
        type: 'multiple_choice',
        options,
        correctOptionIndex,
        ...(explanation ? { explanation } : {}),
      }
    }
    case 'word_bank': {
      const sentenceParts = splitList(normalize(row.sentence_parts))
      const correctOrder = splitNumberList(
        normalize(row.correct_order),
        'correct_order',
        line
      )
      const distractors = splitList(normalize(row.distractors))
      if (sentenceParts.length < 2) {
        throw new Error(`Line ${line}: word_bank needs at least 2 parts`)
      }
      if (correctOrder.length < 1) {
        throw new Error(`Line ${line}: word_bank needs a correct_order`)
      }
      if (correctOrder.length !== sentenceParts.length) {
        throw new Error(
          `Line ${line}: correct_order must include each sentence part once`
        )
      }
      if (
        correctOrder.some((index) => index < 0 || index >= sentenceParts.length)
      ) {
        throw new Error(`Line ${line}: correct_order index is out of range`)
      }
      if (new Set(correctOrder).size !== correctOrder.length) {
        throw new Error(`Line ${line}: correct_order contains duplicates`)
      }
      return {
        ...base,
        type: 'word_bank',
        sentenceParts,
        correctOrder,
        ...(distractors.length ? { distractors } : {}),
      }
    }
    case 'typing': {
      const correctAnswer = requireValue(
        normalize(row.correct_answer),
        'correct_answer',
        line
      )
      const acceptableAnswers = splitList(normalize(row.acceptable_answers))
      return {
        ...base,
        type: 'typing',
        correctAnswer,
        ...(acceptableAnswers.length ? { acceptableAnswers } : {}),
      }
    }
    case 'match_pairs': {
      const pairsRaw = splitList(normalize(row.pairs))
      if (pairsRaw.length < 2) {
        throw new Error(`Line ${line}: match_pairs needs at least 2 pairs`)
      }
      const pairs = pairsRaw.map((pair) => {
        const [left, right] = pair.split(':').map((value) => value.trim())
        if (!left || !right) {
          throw new Error(`Line ${line}: invalid pair format "${pair}"`)
        }
        return { left, right }
      })
      return {
        ...base,
        type: 'match_pairs',
        pairs,
      }
    }
    case 'listening': {
      const correctTranscript = requireValue(
        normalize(row.correct_transcript),
        'correct_transcript',
        line
      )
      return {
        ...base,
        type: 'listening',
        correctTranscript,
      }
    }
    default:
      throw new Error(`Line ${line}: unknown exercise_type "${type}"`)
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    printUsage()
    return
  }

  loadEnv({ path: path.resolve(process.cwd(), '.env.local') })
  loadEnv({ path: path.resolve(process.cwd(), '.env') })

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const resolvedPath = path.resolve(process.cwd(), options.filePath)
  const csv = await fs.readFile(resolvedPath, 'utf8')
  const cleaned = csv.replace(/^\uFEFF/, '')
  const rows = parse(cleaned, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[]

  if (rows.length === 0) {
    throw new Error('CSV contains no rows')
  }

  const units = new Map<string, Map<number, LessonSeed>>()

  rows.forEach((row, index) => {
    const line = index + 2
    const unitId = normalize(row.unit_id) || options.unitId
    if (!unitId) {
      throw new Error(`Line ${line}: missing unit_id or --unit flag`)
    }

    const lessonOrderValue = normalize(row.lesson_order)
    const orderIndex = Number.parseInt(lessonOrderValue, 10)
    if (Number.isNaN(orderIndex)) {
      throw new Error(`Line ${line}: invalid lesson_order`)
    }

    const title = requireValue(
      normalize(row.lesson_title),
      'lesson_title',
      line
    )
    const introVideoUrl = normalize(row.intro_video_url)
    const passingScore = parseFloatValue(
      normalize(row.passing_score),
      'passing_score',
      line
    )

    let unitLessons = units.get(unitId)
    if (!unitLessons) {
      unitLessons = new Map<number, LessonSeed>()
      units.set(unitId, unitLessons)
    }

    let lesson = unitLessons.get(orderIndex)
    if (!lesson) {
      lesson = {
        orderIndex,
        title,
        introVideoUrl: introVideoUrl || undefined,
        passingScore,
        exercises: [],
      }
      unitLessons.set(orderIndex, lesson)
    } else {
      if (lesson.title !== title) {
        throw new Error(
          `Line ${line}: lesson_title mismatch for order ${orderIndex}`
        )
      }
      if (introVideoUrl) {
        if (lesson.introVideoUrl && lesson.introVideoUrl !== introVideoUrl) {
          throw new Error(
            `Line ${line}: intro_video_url mismatch for order ${orderIndex}`
          )
        }
        if (!lesson.introVideoUrl) {
          lesson.introVideoUrl = introVideoUrl
        }
      }
      if (
        passingScore !== undefined &&
        lesson.passingScore !== undefined &&
        passingScore !== lesson.passingScore
      ) {
        throw new Error(
          `Line ${line}: passing_score mismatch for order ${orderIndex}`
        )
      }
      if (lesson.passingScore === undefined) {
        lesson.passingScore = passingScore
      }
    }

    const exercise = parseExercise(row, line)
    lesson.exercises.push(exercise)
  })

  for (const [unitId, lessonMap] of units) {
    const items = Array.from(lessonMap.values())
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((lesson) => {
        const input = {
          introVideoUrl: lesson.introVideoUrl,
          exercises: lesson.exercises,
          passingScore: lesson.passingScore,
        }

        let content: LessonContent
        try {
          content = LessonContentSchema.parse(input)
        } catch (error) {
          if (error instanceof ZodError) {
            const details = error.issues
              .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
              .join(' | ')
            throw new Error(
              `Lesson ${lesson.orderIndex} (${lesson.title}) failed validation: ${details}`
            )
          }
          throw error
        }

        return {
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          content,
        }
      })

    await seedLessons(client, {
      unitId,
      items,
      dryRun: options.dryRun,
    })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
