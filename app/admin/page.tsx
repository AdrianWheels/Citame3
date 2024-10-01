"use client";

import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import DefaultHoursForm from "@/components/DefaultHoursForm";
import CloseDaysCalendar from "@/components/CloseDaysCalendar";
import { supabase } from "@/lib/supabaseClient"; 

const AdminPage = () => {
  const { user } = useSupabaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [shopOwnerData, setShopOwnerData] = useState(null); // Estado para almacenar los datos del dueño
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
      if (user && user.email === superAdminEmail) {
        setIsAdmin(true);

        // Fetch de los datos del dueño de la tienda
        const { data, error } = await supabase
          .from("shop_owners")
          .select("*")
          .eq("id", 2) // Asegúrate de que exista un registro con id = 1
          .single(); // Esto solo debe devolver una fila
        
        if (error) {
          console.error("Error fetching shop owner data:", error);
        } else if (data) {
          // Formatear correctamente los datos de tipo TIME para JavaScript
          setShopOwnerData({
            ...data,
            morning_opening_time: data.morning_opening_time  ,
            morning_closing_time: data.morning_closing_time ,
            afternoon_opening_time: data.afternoon_opening_time ,
            afternoon_closing_time: data.afternoon_closing_time ,
          });
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleGoogleCalendarSync = () => {  
    // Especifica la ruta de callback manualmente
    signIn("google", { callbackUrl: "http://localhost:3000/api/auth/callback/google" });
  };
  

  if (!isAdmin) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Sección para conectar Google Calendar */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Conectar con Google Calendar</h2>
        <button
          onClick={handleGoogleCalendarSync}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Conectar con Google Calendar
        </button>
      </section>

      {/* Sección para gestionar el horario habitual en dos columnas */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Horario Habitual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4">
            <h3 className="text-lg font-bold mb-4">Turno de Mañana</h3>
            {shopOwnerData && (
              <DefaultHoursForm 
                turno="mañana" 
                openingTime={shopOwnerData.morning_opening_time} 
                closingTime={shopOwnerData.morning_closing_time} 
              />
            )}
          </div>
          <div className="border p-4">
            <h3 className="text-lg font-bold mb-4">Turno de Tarde</h3>
            {shopOwnerData && (
              <DefaultHoursForm 
                turno="tarde" 
                openingTime={shopOwnerData.afternoon_opening_time} 
                closingTime={shopOwnerData.afternoon_closing_time} 
              />
            )}
          </div>
        </div>
      </section>

      {/* Sección para gestionar los días de cierre esporádicos */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Días Cerrados Esporádicos</h2>
        <CloseDaysCalendar />
      </section>
    </div>
  );
};

export default AdminPage;
