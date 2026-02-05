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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateAnswer(
  exercise: Exercise,
  answer: any
): ValidationResult {
  switch (exercise.type) {
    case 'multiple_choice':
      return validateMultipleChoice(exercise, answer)
    case 'word_bank':
      return validateWordBank(exercise, answer)
    case 'typing':
      return validateTyping(exercise, answer)
    case 'listening':
      return validateListening(exercise, answer)
    case 'match_pairs':
      return validateMatchPairs(exercise, answer)
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unknown exercise type: ${(exercise as any).type}`)
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
  }
}

function validateWordBank(
  exercise: WordBank,
  answer: string[]
): ValidationResult {
  // Answer is an array of strings (the words)
  // But wait, the schema says `correctOrder` is indices.
  // The actual Game will likely deal with indices or the constructed string.
  // Let's assume the UI sends the constructed sentence or the array of words chosen.
  // If we reconstruct the sentence from indices:

  // Actually, simpler: The user answer should be the array of *indices* they selected,
  // OR the array of strings they built.
  // If we compare strings, it's robust against equivalent words if unique.
  // But `correctOrder` is indices. So let's compare indices if possible, or string.

  // Let's assume the store holds the "current constructed sentence" as an array of definitions?
  // Let's stick strictly to what the schema gives us: `correctOrder` (indices).
  // So the answer should be `number[]`.

  const userAnswerIndices = answer as unknown as number[]

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
