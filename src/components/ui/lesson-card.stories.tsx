import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LessonCard } from './lesson-card'

const meta = {
  title: 'UI/Molecules/LessonCard',
  component: LessonCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['locked', 'active', 'completed'],
    },
    stars: {
      control: { type: 'range', min: 0, max: 3, step: 1 },
    },
  },
} satisfies Meta<typeof LessonCard>

export default meta
type Story = StoryObj<typeof meta>

export const Locked: Story = {
  args: {
    title: 'Lesson 1: Greetings',
    description: 'Learn how to say hello',
    status: 'locked',
    index: 0,
  },
}

export const Active: Story = {
  args: {
    title: 'Lesson 2: Basic Nouns',
    description: 'Der, Die, Das - the articles',
    status: 'active',
    index: 0,
  },
}

export const Completed: Story = {
  args: {
    title: 'Lesson 3: Colors',
    description: 'Farben und Formen',
    status: 'completed',
    stars: 3,
    index: 0,
  },
}

export const CompletedWithTwoStars: Story = {
  args: {
    title: 'Lesson 4: Numbers',
    description: 'Zahlen von 1 bis 100',
    status: 'completed',
    stars: 2,
    index: 0,
  },
}
