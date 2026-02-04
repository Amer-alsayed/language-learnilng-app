import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeedbackSheet } from './feedback-sheet'
import { useState, type ComponentProps } from 'react'
import { Button } from './button'

const meta = {
  title: 'Game/Organisms/FeedbackSheet',
  component: FeedbackSheet,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeedbackSheet>

export default meta
type Story = StoryObj<typeof meta>

type StoryProps = Partial<ComponentProps<typeof FeedbackSheet>>

const Template = (args: StoryProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-10">
      <Button onClick={() => setIsOpen(true)}>Open Feedback Sheet</Button>
      <FeedbackSheet
        {...args}
        isCorrect={args.isCorrect ?? false}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onNext={() => setIsOpen(false)}
      />
    </div>
  )
}

export const CorrectResponse: Story = {
  render: Template,
  args: {
    isCorrect: true,
    explanation:
      "Correct! 'Maedchen' is neuter because all diminutives ending in -chen are neuter.",
    isOpen: false,
    onOpenChange: () => {},
    onNext: () => {},
  },
}

export const WrongResponse: Story = {
  render: Template,
  args: {
    isCorrect: false,
    correctAnswer: 'Das Maedchen',
    explanation:
      "Remember: 'Maedchen' ends in -chen, so it is always Das (Neuter), not Die.",
    isOpen: false,
    onOpenChange: () => {},
    onNext: () => {},
  },
}
