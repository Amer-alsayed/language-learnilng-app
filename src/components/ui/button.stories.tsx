import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'
import { ArrowRight } from 'lucide-react'

const meta = {
  title: 'UI/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'glass', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Start Learning',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Not Now',
    variant: 'secondary',
  },
}

export const Glass: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  args: {
    children: 'Glass Effect',
    variant: 'glass',
  },
}

export const WithIcons: Story = {
  args: {
    children: 'Continue',
    rightIcon: <ArrowRight className="h-4 w-4" />,
    variant: 'primary',
  },
}

export const Loading: Story = {
  args: {
    children: 'Please wait',
    isLoading: true,
  },
}
