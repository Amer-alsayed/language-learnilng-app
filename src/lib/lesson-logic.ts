import {
  Exercise,
  MultipleChoice,
  WordBank,
  Typing,
  Listening,
  MatchPairs,
} from '@/types/schemas'

export type ValidationResult = {
  isCorrect: boolean
  feedback?: string
  correctAnswerDisplay?: string
}

export function validateAnswer(
  exercise: Exercise,
  answer: unknown
): ValidationResult {
  switch (exercise.type) {
    case 'multiple_choice':
      return validateMultipleChoice(exercise, answer as number)
    case 'word_bank':
      return validateWordBank(exercise, answer as number[])
    case 'typing':
      return validateTyping(exercise, answer as string)
    case 'listening':
      return validateListening(exercise, answer as string)
    case 'match_pairs':
      return validateMatchPairs(exercise, answer as Record<string, string>)
    default:
      const exerciseType = (exercise as { type?: string }).type ?? 'unknown'
      throw new Error(`Unknown exercise type: ${exerciseType}`)
  }
}

function validateMultipleChoice(
  exercise: MultipleChoice,
  answer: number
): ValidationResult {
  const isCorrect = answer === exercise.correctOptionIndex
  return {
    isCorrect,
    correctAnswerDisplay: exercise.options[exercise.correctOptionIndex],
    feedback: isCorrect ? undefined : exercise.explanation,
  }
}

function validateWordBank(
  exercise: WordBank,
  answer: number[]
): ValidationResult {
  // The UI sends indices of the selected words, which we compare to `correctOrder`.

  const userAnswerIndices = answer

  if (userAnswerIndices.length !== exercise.correctOrder.length) {
    return { isCorrect: false, feedback: 'Sentence length is incorrect.' }
  }

  const isCorrect = userAnswerIndices.every(
    (val, idx) => val === exercise.correctOrder[idx]
  )

  // Construct correct sentence for display
  const correctSentence = exercise.correctOrder
    .map((idx) => exercise.sentenceParts[idx])
    .join(' ')

  return {
    isCorrect,
    correctAnswerDisplay: correctSentence,
  }
}

function validateTyping(exercise: Typing, answer: string): ValidationResult {
  const normalizedAnswer = answer.trim().toLowerCase()
  const normalizedCorrect = exercise.correctAnswer.trim().toLowerCase()

  if (normalizedAnswer === normalizedCorrect) {
    return { isCorrect: true }
  }

  if (exercise.acceptableAnswers) {
    const isAcceptable = exercise.acceptableAnswers.some(
      (alt) => alt.trim().toLowerCase() === normalizedAnswer
    )
    if (isAcceptable) return { isCorrect: true }
  }

  return {
    isCorrect: false,
    correctAnswerDisplay: exercise.correctAnswer,
  }
}

function validateListening(
  exercise: Listening,
  answer: string
): ValidationResult {
  // Similar to typing but maybe more lenient on punctuation?
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?;]/g, '')

  // Check main answer
  if (normalize(answer) === normalize(exercise.correctTranscript)) {
    return { isCorrect: true }
  }

  return {
    isCorrect: false,
    correctAnswerDisplay: exercise.correctTranscript,
  }
}

function validateMatchPairs(
  exercise: MatchPairs,
  answer: Record<string, string>
): ValidationResult {
  // Answer is a map of left -> right selections
  // Actually match pairs usually validates one pair at a time or the whole set?
  // Let's assume the question asks to match ALL of them.

  // We need to check if every key (left) maps to the correct value (right)
  // The exercise.pairs has {left, right} objects.

  const correctMap = new Map<string, string>()
  exercise.pairs.forEach((p: { left: string; right: string }) =>
    correctMap.set(p.left, p.right)
  )

  // Check size
  if (Object.keys(answer).length !== exercise.pairs.length) {
    return { isCorrect: false, correctAnswerDisplay: 'Match all pairs' }
  }

  for (const [left, right] of Object.entries(answer)) {
    if (correctMap.get(left) !== right) {
      return { isCorrect: false, correctAnswerDisplay: 'Incorrect matches' }
    }
  }

  return { isCorrect: true }
}
