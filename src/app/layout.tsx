import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'CRM Pro - Internal Tracker',
  description: 'Multi-stage workflow CRM',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased h-screen flex overflow-hidden bg-surface`}>
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
