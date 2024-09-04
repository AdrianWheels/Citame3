"use client"; // Indicamos que es un Client Component

import CustomCalendar from '@/components/CustomCalendar';
import { supabase } from '@/lib/supabaseClient'; // Revisa si es el path correcto
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js'; // Importa el tipo Session

export default function Home() {
  // Especificamos que el estado session puede ser del tipo Session o null
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error obteniendo la sesión", error);
      } else {
        setSession(data.session); // Aquí el tipo ya está correctamente inferido
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); // Tipo Session o null
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">      

      <main className="flex-grow flex flex-col items-center justify-center py-10 px-4">
        {session ? (
          <>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Bienvenido!</h1>
            <p className="text-gray-600 text-center max-w-xl mb-8">
              Agenda tus citas rápidamente utilizando nuestro calendario interactivo. Selecciona un día para ver la disponibilidad.
            </p>
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
              <CustomCalendar />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Inicia Sesión</h1>
            <p className="text-gray-600 text-center max-w-xl mb-8">
              Por favor, autentícate para poder acceder al calendario y gestionar tus citas.
            </p>            
          </>
        )}
      </main>

      <footer className="w-full py-4 bg-gray-200 text-center text-gray-600">
        © {new Date().getFullYear()} Mi Servicio. Todos los derechos reservados.
      </footer>
    </div>
  );
}
