import { z } from 'zod'

/**
 * -----------------------------------------------------------------------------
 * GERMAN MASTERY - TYPE DEFINITIONS (v1.1)
 * -----------------------------------------------------------------------------
 * This file serves as the Application Logic Source of Truth.
 * While the DB holds the data, this file defines how we interact with it.
 *
 * CORE PRINCIPLES:
 * 1. Zod First: We define runtime validation schemas first.
 * 2. Inference: We infer TypeScript types from Zod to prevent mismatch.
 * 3. Strictness: No 'any'. No 'optional' unless effectively optional.
 * -----------------------------------------------------------------------------
 */

// =============================================================================
// 1. EXERCISE PRIMITIVES
// =============================================================================

// Enum for UI rendering logic
export const ExerciseTypeEnum = z.enum([
  'multiple_choice',
  'word_bank',
  'typing',
  'match_pairs',
  'listening',
])

// Shared properties every exercise MUST have
const BaseExerciseSchema = z.object({
  id: z.string().uuid({ message: 'Exercise ID must be a valid UUID' }),
  prompt: z.string().min(1, { message: 'Prompt cannot be empty' }),
  audioUrl: z.string().url().optional(), // Optional: Voiceover for the question
})

// =============================================================================
// 2. EXERCISE VARIANTS
// =============================================================================

/**
 * Variant: Multiple Choice
 * The classic "Pick A, B, C, or D".
 */
export const MultipleChoiceSchema = BaseExerciseSchema.extend({
  type: z.literal('multiple_choice'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'Must have at least 2 options'),
  correctOptionIndex: z.number().int().min(0),
  explanation: z.string().optional(), // Shown in BottomSheet on failure
}).superRefine((value, ctx) => {
  if (value.correctOptionIndex >= value.options.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['correctOptionIndex'],
      message: 'Correct option index is out of range',
    })
  }
})

/**
 * Variant: Word Bank (Sentence Construction)
 * Drag and drop words to form a valid German sentence.
 * Great for teaching TeKaMoLo rule.
 */
export const WordBankSchema = BaseExerciseSchema.extend({
  type: z.literal('word_bank'),
  sentenceParts: z
    .array(z.string().min(1, 'Sentence part cannot be empty'))
    .min(2, 'Sentence must contain at least 2 parts'), // The master list of words
  correctOrder: z.array(z.number().int().min(0)).min(1), // The indices that form the correct sentence
  distractors: z
    .array(z.string().min(1, 'Distractor cannot be empty'))
    .optional(), // Extra words that don't fit
}).superRefine((value, ctx) => {
  const maxIndex = value.sentenceParts.length - 1
  const seen = new Set<number>()

  value.correctOrder.forEach((index, position) => {
    if (index < 0 || index > maxIndex) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctOrder', position],
        message: 'Correct order index is out of range',
      })
    }
    if (seen.has(index)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctOrder', position],
        message: 'Correct order cannot contain duplicate indices',
      })
    }
    seen.add(index)
  })

  if (value.correctOrder.length !== value.sentenceParts.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['correctOrder'],
      message: 'Correct order must include every sentence part exactly once',
    })
  }
})

/**
 * Variant: Typing
 * Strict input validation.
 */
export const TypingSchema = BaseExerciseSchema.extend({
  type: z.literal('typing'),
  correctAnswer: z.string().min(1, 'Correct answer cannot be empty'), // The exact string to match
  acceptableAnswers: z
    .array(z.string().min(1, 'Acceptable answer cannot be empty'))
    .optional(), // Synonyms or slight variations
})

// =============================================================================
// 3. THE MASTER UNION
// =============================================================================

/**
 * Variant: Match Pairs
 * Connect left items to right items.
 */
export const MatchPairsSchema = BaseExerciseSchema.extend({
  type: z.literal('match_pairs'),
  pairs: z
    .array(
      z.object({
        left: z.string().min(1, 'Left value cannot be empty'),
        right: z.string().min(1, 'Right value cannot be empty'),
      })
    )
    .min(2, 'Must have at least 2 pairs'),
})

/**
 * Variant: Listening
 * Type what you hear.
 */
export const ListeningSchema = BaseExerciseSchema.extend({
  type: z.literal('listening'),
  correctTranscript: z.string().min(1, 'Transcript cannot be empty'),
  // Optional: use browser TTS so we don't need audio files.
  // If omitted, UI can still use correctTranscript as the TTS source.
  ttsText: z.string().min(1).optional(),
})

// =============================================================================
// 3. THE MASTER UNION
// =============================================================================

export const ExerciseSchema = z.union([
  MultipleChoiceSchema,
  WordBankSchema,
  TypingSchema,
  MatchPairsSchema,
  ListeningSchema,
])

// =============================================================================
// 4. LESSON CONTENT STRUCTURE
// =============================================================================

/**
 * The Shape of the JSONB column in the `lessons` table.
 * This is what the Frontend consumes to render the Game Arena.
 */
export const LessonContentSchema = z.object({
  introVideoUrl: z.string().url().optional(), // Optional Loom/YouTube explainer
  exercises: z
    .array(ExerciseSchema)
    .min(1, 'A lesson must have at least one exercise'),
  passingScore: z.number().min(0).max(1).default(0.8), // Threshold to unlock next node
})

// =============================================================================
// 5. INFERRED TYPES
// =============================================================================

export type ExerciseType = z.infer<typeof ExerciseTypeEnum>
export type MultipleChoice = z.infer<typeof MultipleChoiceSchema>
export type WordBank = z.infer<typeof WordBankSchema>
export type Typing = z.infer<typeof TypingSchema>
export type MatchPairs = z.infer<typeof MatchPairsSchema>
export type Listening = z.infer<typeof ListeningSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type LessonContent = z.infer<typeof LessonContentSchema>

// =============================================================================
// 6. DB DOMAIN MODELS
// =============================================================================
// Note: Once we run `supabase gen types`, we will likely replace these
// with the auto-generated ones + strict Pick/Omit utilities.

export interface Profile {
  id: string // UUID from Auth
  email: string
  role: 'student' | 'admin'
  class_group?: string | null
  xp: number
  streak: number
  last_active_at: string // ISO Date String
  expires_at?: string // ISO Date String
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  order_index: number
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  unit_id: string
  order_index: number
  title: string
  content: LessonContent // The Strict JSON type
  created_at: string
  updated_at: string
}

export interface UserProgress {
  user_id: string
  lesson_id: string
  status: 'locked' | 'active' | 'completed'
  stars: number
  completed_at: string | null
  updated_at: string
}

// =============================================================================
// 7. FILE SYSTEM SCHEMAS (For Seeding)
// =============================================================================

/**
 * The structure of a "Lesson" inside the JSON file.
 * It combines the DB metadata (title, order) with the content.
 */
export const LessonFileSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  order: z.number().int().min(1, 'Lesson order must be >= 1'),
  content: LessonContentSchema,
})

/**
 * The structure of a "Unit" content file (e.g. content/units/01_basics.json).
 */
export const UnitFileSchema = z.object({
  $schema: z.string().optional(), // For JSON Schema binding
  id: z.string().uuid().optional(), // Optional: If you want to force a specific UUID
  title: z.string().min(1, 'Unit title is required'),
  description: z.string().optional(),
  order: z.number().int().min(1, 'Unit order must be >= 1'),
  lessons: z
    .array(LessonFileSchema)
    .min(1, 'A unit must have at least one lesson'),
})

export type UnitFile = z.infer<typeof UnitFileSchema>
