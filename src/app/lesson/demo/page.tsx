'use client'
import { LessonShell } from '@/components/lesson/LessonShell'
import { Exercise } from '@/types/schemas'

const DEMO_EXERCISES: Exercise[] = [
  {
    id: 'demo-1',
    type: 'multiple_choice',
    prompt: 'Select the correct translation for "The Apple"',
    options: ['Der Apfel', 'Die Banane', 'Das Brot', 'Die Milch'],
    correctOptionIndex: 0, // Der Apfel
    explanation: '"Apfel" is a masculine noun, so it takes the article "Der".',
  },
  {
    id: 'demo-2',
    type: 'multiple_choice',
    prompt: 'Which of these is "Good Morning"?',
    options: ['Gute Nacht', 'Guten Morgen', 'Hallo', 'Auf Wiedersehen'],
    correctOptionIndex: 1,
    explanation: 'Morgen (Morning) is masculine accusative here, so "Guten".',
  },
  {
    id: 'demo-3',
    type: 'multiple_choice',
    prompt: 'Translate: "I am happy"',
    options: [
      'Ich bin traurig',
      'Ich habe Hunger',
      'Ich bin glücklich',
      'Mir geht es gut',
    ],
    correctOptionIndex: 2,
    explanation: '"Glücklich" means happy.',
  },
  {
    id: 'demo-4',
    type: 'word_bank',
    prompt: 'Construct the sentence: "I eat an apple"',
    sentenceParts: ['esse', 'Ich', 'einen', 'Apfel', 'der', 'Brot'],
    correctOrder: [1, 0, 2, 3], // Ich esse einen Apfel
    audioUrl: undefined,
  },
  {
    id: 'demo-5',
    type: 'typing',
    prompt: 'Type the German word for "The Mother" (Die Mutter)',
    correctAnswer: 'Die Mutter',
    acceptableAnswers: ['mutter', 'Die Mutter', 'die mutter'],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any // Cast to avoid strict union issues if my mock is slightly off

export default function DemoLessonPage() {
  return (
    <LessonShell initialExercises={DEMO_EXERCISES} lessonId="demo-session" />
  )
}
