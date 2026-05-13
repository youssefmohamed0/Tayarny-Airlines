import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/navbar'
import NextAuthProvider from '@/components/layout/SessionProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Tayarny-Airlines — Premium Flight Booking',
  description: 'Search, book and manage flights with Tayarny-Airlines. Premium travel experience.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <NextAuthProvider>
          <Navbar>{children}</Navbar>
        </NextAuthProvider>
      </body>
    </html>
  )
}