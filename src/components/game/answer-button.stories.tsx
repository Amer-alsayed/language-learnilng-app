import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AnswerButton } from './answer-button'

const meta = {
  title: 'Game/Molecules/AnswerButton',
  component: AnswerButton,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'light' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AnswerButton>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    text: 'Das Mädchen',
    status: 'idle',
    shortcutKey: '1',
  },
}

export const Selected: Story = {
  args: {
    text: 'Der Mann',
    status: 'selected',
    shortcutKey: '2',
  },
}

export const Correct: Story = {
  args: {
    text: 'Die Frau',
    status: 'correct',
    shortcutKey: '3',
  },
}

export const Wrong: Story = {
  args: {
    text: 'Das Auto',
    status: 'wrong',
    shortcutKey: '4',
  },
}
