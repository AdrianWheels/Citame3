'use client';

import CustomCalendar from '@/components/CustomCalendar';
import Header from '@/components/Header';
import Image from 'next/image'; // Importa el componente de Next.js para optimizar las imágenes

export default function Home() {
  return (
    <div 
      className="min-h-screen w-full relative flex flex-col items-center justify-between" 
      style={{
        backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/c/c9/Barber_shop_Porto.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header />
      <main className="flex-grow flex items-center justify-end w-full">
        <div className="w-full h-full max-w-full lg:max-w-3xl lg:h-[900px] rounded-lg p-2 lg:p-6">
          <CustomCalendar />
        </div>
      </main>


      {/* Nuevo logo en la esquina inferior izquierda */}
      <div className="hidden lg:block absolute bottom-20 left-20">
        <Image 
          src="/logo.ico" // Ruta a la imagen que has subido
          alt="Logo" 
          width={150} // Tamaño del logo, puedes ajustar el ancho
          height={150}
          className="rounded-full"
        />
      </div>
      <footer className="w-full py-4 bg-[#1a1a1a] text-white text-center">
        © {new Date().getFullYear()} Mi Servicio. Todos los derechos reservados.
      </footer>
    </div>
  );
}
