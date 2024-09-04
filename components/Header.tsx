'use client';

import Link from 'next/link';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/lib/supabaseClient';

const Header = () => {
  const { user } = useSupabaseAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link href="/auth">
                <a className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  Iniciar sesión
                </a>
              </Link>
              <Link href="/register">
                <a className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                  Crear cuenta
                </a>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
