import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LessonCard } from './lesson-card'

const meta = {
  title: 'Game/Molecules/LessonCard',
  component: LessonCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LessonCard>

export default meta
type Story = StoryObj<typeof meta>

export const Locked: Story = {
  args: {
    title: 'The Basics I',
    description: 'Learn how to say hello and introduce yourself.',
    status: 'locked',
    progress: 0,
    index: 0,
    onClick: () => {},
  },
}

export const Active: Story = {
  args: {
    title: 'Food & Drinks',
    description: 'Order a coffee like a local Berliner.',
    status: 'active',
    progress: 45,
    index: 0,
    onClick: () => alert('Clicked Active Lesson!'),
  },
}

export const Completed: Story = {
  args: {
    title: 'Numbers & Dates',
    description: 'Count from 1 to 100 perfectly.',
    status: 'completed',
    progress: 100,
    index: 0,
    onClick: () => alert('Replaying Lesson'),
  },
}
