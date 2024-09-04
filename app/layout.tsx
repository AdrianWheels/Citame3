// app/layout.tsx
import '@/app/globals.css'

export const metadata = {
  title: 'Citame',
  description: 'Una manera sencilla de obtener citas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>       
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
