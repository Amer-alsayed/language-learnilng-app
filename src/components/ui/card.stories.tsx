import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card } from './card'

const meta = {
  title: 'UI/Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="mb-2 text-lg font-bold">Card Title</h3>
        <p className="text-muted-foreground">
          This is a glass-panel styled card component.
        </p>
      </div>
    ),
  },
}

export const WithContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Lesson Progress</h3>
        <p className="text-muted-foreground text-sm">
          You have completed 5 out of 10 lessons.
        </p>
        <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
          <div className="bg-primary h-full w-1/2 rounded-full" />
        </div>
      </div>
    ),
  },
}
