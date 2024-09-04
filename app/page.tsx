'use client';

import CustomCalendar from '@/components/CustomCalendar';
import Header from '@/components/Header'; // Importamos el Header

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between">
      {/* Añadimos el Header */}
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center py-6 px-4" style={{ paddingTop: '80px' }}>
        {/* Aquí ya no gestionamos la sesión */}
        <div className="w-full max-w-md bg-white rounded-lg p-4">
          <CustomCalendar />
        </div>
      </main>

      <footer className="w-full py-4 bg-gray-200 text-center text-gray-600">
        © {new Date().getFullYear()} Mi Servicio. Todos los derechos reservados.
      </footer>
    </div>
  );
}
