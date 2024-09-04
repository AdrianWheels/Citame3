'use client';

import Link from 'next/link';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'; // Usamos este hook para obtener la sesión
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import Image from 'next/image';


const Header = () => {
  const { user } = useSupabaseAuth(); // Usamos el hook personalizado para obtener el usuario
  const [loading, setLoading] = useState(false);
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut(); // Cerrar sesión
    setLoading(false);
  };

  // Manejar la visibilidad del header basado en el scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledToTop(window.scrollY === 0); // true si está al tope, false si se ha scrolleado
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 w-full p-4 bg-white shadow-md transition-transform duration-300 ${
        isScrolledToTop ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo.ico"
            alt="Company Logo"
            width={48}  // Ajusta el ancho según tus necesidades
            height={48} // Ajusta la altura según tus necesidades
            className="h-12 w-auto"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-secondary  text-white px-4 py-2 rounded hover:bg-red-600 transition"
              disabled={loading} // Desactivar botón si está en loading
            >
              {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          ) : (
            <>
              <Link
                href="/auth"
                className="bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
              >
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
