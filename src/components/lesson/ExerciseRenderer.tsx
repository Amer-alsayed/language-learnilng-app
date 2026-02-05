'use client'
import { Exercise } from '@/types/schemas'
import { MultipleChoice } from './exercises/MultipleChoice'
import { WordBank } from './exercises/WordBank'
import { Typing } from './exercises/Typing'

export function ExerciseRenderer({ exercise }: { exercise: Exercise }) {
  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoice exercise={exercise} />

    case 'word_bank':
      return <WordBank exercise={exercise} />
    case 'typing':
      return <Typing exercise={exercise} />
    case 'match_pairs':
      return <div className="p-8 text-center">Match Pairs - Coming Soon</div>
    case 'listening':
      return <div className="p-8 text-center">Listening - Coming Soon</div>

    default:
      return (
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          Unknown exercise type: {(exercise as any).type}
        </div>
      )
  }
}
