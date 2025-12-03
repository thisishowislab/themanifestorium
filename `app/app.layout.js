```javascript
import './globals.css'

export const metadata = {
  title: 'The Manifestorium - Desert Art Tech Makerspace',
  description: 'Where off-grid tech, desert salvage, and handmade myth collide in Slab City',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```
