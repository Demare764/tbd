import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Focus Fade',
  description: 'Win by being irrelevant.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white antialiased">{children}</body>
    </html>
  )
}
