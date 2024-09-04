// components/Header.tsx
'use client'

import Link from 'next/link'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { supabase } from '@/lib/supabaseClient'

export default function Header() {
  const { user } = useSupabaseAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white shadow p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <img src="/logo.ico" alt="Company Logo" className="h-14 w-auto" />
        </Link>

        {/* Navegación */}
        <nav>
          {user ? (
            // Si el usuario está autenticado, mostrar el botón de logout
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 mx-4 rounded">
              Cerrar sesión
            </button>
          ) : (
            // Si no está autenticado, mostrar los links para login y registro
            <div className="space-x-4">
              <Link href="/auth">
                <span className="bg-blue-500 text-white px-4 py-2 rounded">Iniciar sesión</span>
              </Link>
              <Link href="/register">
                <span className="bg-green-500 text-white px-4 py-2 rounded">Crear cuenta</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
