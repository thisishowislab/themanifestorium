import './globals.css'

export const metadata = {
  title: 'The Manifestorium',
  description: 'Desert Art Tech Makerspace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
