import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AnswerButton } from './answer-button'

const meta = {
  title: 'UI/Molecules/AnswerButton',
  component: AnswerButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'selected', 'correct', 'wrong'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnswerButton>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    children: 'Der Hund',
    shortcut: 'A',
    state: 'idle',
  },
}

export const Selected: Story = {
  args: {
    children: 'Die Katze',
    shortcut: 'B',
    state: 'selected',
  },
}

export const Correct: Story = {
  args: {
    children: 'Das Buch',
    shortcut: 'C',
    state: 'correct',
  },
}

export const Wrong: Story = {
  args: {
    children: 'Der Apfel',
    shortcut: 'D',
    state: 'wrong',
  },
}
