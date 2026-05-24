import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'WatchMarketplace — Premium Watch Marketplace',
  description: 'Buy and sell luxury watches. Rolex, Omega, Patek Philippe, Audemars Piguet and more.',
  keywords: ['watches', 'luxury watches', 'Rolex', 'Omega', 'Patek Philippe', 'marketplace'],
  openGraph: {
    title: 'WatchMarketplace',
    description: 'Premium Watch Marketplace',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
