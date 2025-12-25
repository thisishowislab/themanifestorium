import './globals.css'

export const metadata = {
  title: 'For Magical Use Only',
  description: 'The Manifestorium - A Desert Art Tech Makerspace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
