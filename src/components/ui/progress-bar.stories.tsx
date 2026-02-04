import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressBar } from './progress-bar'

const meta = {
  title: 'UI/Atoms/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
    },
    color: {
      control: 'select',
      options: ['default', 'masc', 'fem', 'neut'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 60,
    max: 100,
    color: 'default',
  },
}

export const Masculine: Story = {
  args: {
    value: 75,
    max: 100,
    color: 'masc',
  },
}

export const Feminine: Story = {
  args: {
    value: 50,
    max: 100,
    color: 'fem',
  },
}

export const Neuter: Story = {
  args: {
    value: 30,
    max: 100,
    color: 'neut',
  },
}

export const Full: Story = {
  args: {
    value: 100,
    max: 100,
    color: 'default',
  },
}

export const Empty: Story = {
  args: {
    value: 0,
    max: 100,
    color: 'default',
  },
}
