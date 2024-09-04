'use client';

import Link from 'next/link';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'; // Usamos este hook para obtener la sesión
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

const Header = () => {
  const { user } = useSupabaseAuth(); // Usamos el hook personalizado para obtener el usuario
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut(); // Cerrar sesión
    setLoading(false);
  };

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <img src="/logo.ico" alt="Company Logo" className="h-12 w-auto" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              disabled={loading} // Desactivar botón si está en loading
            >
              {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          ) : (
            <>
              <Link href="/auth" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                Iniciar sesión
              </Link>
              <Link href="/register" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
