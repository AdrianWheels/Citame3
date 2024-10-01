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
    <html lang="es">
      <body className="min-h-screen w-full"> {/* Asegura que ocupe todo el alto de la pantalla */}
        <main className="min-h-screen w-full"> {/* Ocupa el 100% del viewport */}
          {children}
        </main>
      </body>
    </html>
  )
}

