import type { Metadata, Viewport } from 'next'
import { Nunito, Inter, Fredoka } from 'next/font/google'
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

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming for native app feel
}

export const metadata: Metadata = {
  title: {
    template: '%s | German Mastery',
    default: 'German Mastery',
  },
  description:
    'A gamified German learning platform that syncs with your classroom lessons. Master vocabulary, grammar, and pronunciation through addictive, quiz-style exercises.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/apple-touch-icon.png',
  },
  keywords: [
    'German',
    'language learning',
    'education',
    'gamification',
    'vocabulary',
  ],
  authors: [{ name: 'German Mastery Team' }],
  openGraph: {
    title: 'German Mastery',
    description: 'Master German through gamified learning',
    url: 'https://german-mastery.vercel.app', // Placeholder
    siteName: 'German Mastery',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'German Mastery',
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
        className={`${nunito.variable} ${inter.variable} ${fredoka.variable} bg-background text-foreground font-body overflow-x-hidden antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
