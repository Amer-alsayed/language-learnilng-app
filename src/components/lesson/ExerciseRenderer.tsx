'use client'
import { Exercise } from '@/types/schemas'
import { MatchPairs } from './exercises/MatchPairs'
import { MultipleChoice } from './exercises/MultipleChoice'
import { Listening } from './exercises/Listening'
import { WordBank } from './exercises/WordBank'
import { Typing } from './exercises/Typing'

export function ExerciseRenderer({ exercise }: { exercise: Exercise }) {
  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoice key={exercise.id} exercise={exercise} />

    case 'word_bank':
      return <WordBank key={exercise.id} exercise={exercise} />
    case 'typing':
      return <Typing key={exercise.id} exercise={exercise} />
    case 'match_pairs':
      return <MatchPairs key={exercise.id} exercise={exercise} />
    case 'listening':
      return <Listening key={exercise.id} exercise={exercise} />

    default:
      return (
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          Unknown exercise type: {(exercise as { type: string }).type}
        </div>
      )
  }
}
