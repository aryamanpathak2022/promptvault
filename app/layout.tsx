import type { Metadata } from 'next'
import { Inter, Caveat } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' })

export const metadata: Metadata = {
  title: 'PromptVault — Prompt Version Control for Developers',
  description: 'Track, version, and sync your AI prompts like code. Never lose a good prompt again.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${caveat.variable} ${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
