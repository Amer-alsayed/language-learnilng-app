'use client'
import { LessonShell } from '@/components/lesson/LessonShell'
import { Exercise } from '@/types/schemas'

const DEMO_EXERCISES: Exercise[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    type: 'multiple_choice',
    prompt: 'Select the correct translation for "The apple"',
    options: ['Der Apfel', 'Die Banane', 'Das Brot', 'Die Milch'],
    correctOptionIndex: 0,
    explanation: '"Apfel" is a masculine noun, so it takes the article "Der".',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    type: 'multiple_choice',
    prompt: 'Which of these is "Good morning"?',
    options: ['Gute Nacht', 'Guten Morgen', 'Hallo', 'Auf Wiedersehen'],
    correctOptionIndex: 1,
    explanation: '"Morgen" is masculine here, so "Guten" is correct.',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    type: 'multiple_choice',
    prompt: 'Translate: "I am happy"',
    options: [
      'Ich bin traurig',
      'Ich habe Hunger',
      'Ich bin glücklich',
      'Mir geht es gut',
    ],
    correctOptionIndex: 2,
    explanation: '"glücklich" means happy.',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    type: 'word_bank',
    prompt: 'Construct the sentence: "I eat an apple"',
    sentenceParts: ['Ich', 'esse', 'einen', 'Apfel', 'der', 'Brot'],
    correctOrder: [0, 1, 2, 3],
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    type: 'typing',
    prompt: 'Type the German for "The mother" (Die Mutter)',
    correctAnswer: 'Die Mutter',
    acceptableAnswers: ['die mutter', 'mutter', 'Die Mutter'],
  },
]

export default function DemoLessonPage() {
  return (
    <LessonShell initialExercises={DEMO_EXERCISES} lessonId="demo-session" />
  )
}
