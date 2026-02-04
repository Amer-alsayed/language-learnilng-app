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
  options: z.array(z.string()).min(2, 'Must have at least 2 options'),
  correctOptionIndex: z.number().int().min(0),
  explanation: z.string().optional(), // Shown in BottomSheet on failure
})

/**
 * Variant: Word Bank (Sentence Construction)
 * Drag and drop words to form a valid German sentence.
 * Great for teaching TeKaMoLo rule.
 */
export const WordBankSchema = BaseExerciseSchema.extend({
  type: z.literal('word_bank'),
  sentenceParts: z.array(z.string()), // The master list of words
  correctOrder: z.array(z.number()), // The indices that form the correct sentence
  distractors: z.array(z.string()).optional(), // Extra words that don't fit
})

/**
 * Variant: Typing
 * Strict input validation.
 */
export const TypingSchema = BaseExerciseSchema.extend({
  type: z.literal('typing'),
  correctAnswer: z.string(), // The exact string to match
  acceptableAnswers: z.array(z.string()).optional(), // Synonyms or slight variations
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
        left: z.string(),
        right: z.string(),
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
  correctTranscript: z.string(),
})

// =============================================================================
// 3. THE MASTER UNION
// =============================================================================

export const ExerciseSchema = z.discriminatedUnion('type', [
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
  xp: number
  streak: number
  last_active_at: string // ISO Date String
  subscription_expires_at?: string // ISO Date String
  created_at: string
}

export interface Unit {
  id: string
  order_index: number
  title: string
  description: string | null
}

export interface Lesson {
  id: string
  unit_id: string
  order_index: number
  title: string
  content: LessonContent // The Strict JSON type
}

export interface UserProgress {
  user_id: string
  lesson_id: string
  status: 'locked' | 'active' | 'completed'
  stars: number
}
