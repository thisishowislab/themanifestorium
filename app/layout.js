import './globals.css''
export const metadata = {
  title: {
    default: "For Magical Use Only",
    template: "%s · For Magical Use Only",
  },
  description: "The Manifestorium - Desert Art Tech Makerspace. Off-grid art + fabrication. Desert salvage. Handmade myth.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
