import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import SessionProvider from './SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Istana Group Dashboard',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  return (
    <html lang="id">
      <body className={inter.className}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  )
}