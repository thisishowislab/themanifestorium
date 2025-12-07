import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  title: 'The Manifestorium',
  description: 'Desert Art Tech Makerspace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
