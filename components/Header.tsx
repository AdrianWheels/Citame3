'use client';

import Link from 'next/link';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'; // Usamos este hook para obtener la sesión
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

const Header = () => {
  const { user } = useSupabaseAuth(); // Usamos el hook personalizado para obtener el usuario
  const [loading, setLoading] = useState(false);
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Verificar si el usuario es super admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        if (user.email === superAdminEmail) {
          setIsAdmin(true);
        } else {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setIsAdmin(data.is_super_admin);
          }
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <header
      className={`fixed top-0 w-full p-4 bg-[#1a1a1a] text-white shadow-md transition-transform duration-300 ${
        isScrolledToTop ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">        
        <Link href="/">
          <h1 className="text-xl font-bold">Factony Style</h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Administrar
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                disabled={loading} // Desactivar botón si está en loading
              >
                {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </>
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
