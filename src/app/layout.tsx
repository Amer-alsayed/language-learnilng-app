import type { Metadata } from 'next'
import { Nunito, Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'German Mastery | Learn German the Smart Way',
  description:
    'A gamified German learning platform that syncs with your classroom lessons. Master vocabulary, grammar, and pronunciation through addictive, quiz-style exercises.',
  keywords: [
    'German',
    'language learning',
    'education',
    'gamification',
    'vocabulary',
  ],
  authors: [{ name: 'German Mastery' }],
  openGraph: {
    title: 'German Mastery',
    description: 'Master German through gamified learning',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${inter.variable} font-body antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
