import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Little Orange — Asian Pantry Essentials',
  description: 'Shop specialty Asian sauces, pastes and pantry staples. Delivered to your door in NZ.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}