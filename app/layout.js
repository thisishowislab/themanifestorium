// app/layout.js (or app/layout.jsx)
import "./globals.css";

export const metadata = {
  title: {
    default: "For Magical Use Only",
    template: "%s · For Magical Use Only",
  },
  description:
    "The Manifestorium - Desert Art Tech Makerspace. Off-grid art + fabrication. Desert salvage. Handmade myth.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/20 bg-black/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
            <a
              href="/"
              className="font-black tracking-tight text-lg md:text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            >
              For Magical Use Only
            </a>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a href="/" className="px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-cyan-500/30">
                Home
              </a>
              <a href="/#shop" className="px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-cyan-500/30">
                Shop
              </a>
              <a href="/#tours" className="px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-purple-500/30">
                Tours
              </a>
              <a href="/#donate" className="px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-purple-500/30">
                Donate
              </a>
              <a href="/community" className="px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-purple-500/30">
                Community
              </a>
            </nav>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
