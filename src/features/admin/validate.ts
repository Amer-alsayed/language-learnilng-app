import { LessonContentSchema, type LessonContent } from '../../types/schemas'
import { ZodError } from 'zod'

/**
 * Validates a single lesson object against the strict Zod schema.
 * Throws a detailed error if validation fails.
 */
export function validateLessonContent(content: unknown): LessonContent {
  try {
    return LessonContentSchema.parse(content)
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation failed:')
      error.issues.forEach((issue) => {
        console.error(
          ` - Path: ${issue.path.join('.')} | Message: ${issue.message}`
        )
      })
      throw new Error(
        `Invalid lesson content: ${error.issues.length} errors found.`
      )
    }
    throw error
  }
}

/**
 * Validates an array of lessons (e.g., from a bulk import).
 */
export function validateBatchLessons(lessons: unknown[]): LessonContent[] {
  return lessons.map((lesson, index) => {
    try {
      return validateLessonContent(lesson)
    } catch (error) {
      throw new Error(
        `Error in lesson at index ${index}: ${(error as Error).message}`
      )
    }
  })
}
