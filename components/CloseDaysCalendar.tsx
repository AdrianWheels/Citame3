import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; // Estilos predeterminados del calendario
import { supabase } from "@/lib/supabaseClient";

const CloseDaysCalendar = () => {
  const [closedDays, setClosedDays] = useState<Date[]>([]);

  const handleDayClick = async (date: Date) => {
    // Añadir día seleccionado a la base de datos como día de cierre
    const { data, error } = await supabase
      .from("shop_schedule")
      .insert({
        shop_owner_id: 1,  // Asegúrate de pasar el ID correcto del dueño de la tienda
        date: date.toISOString().split("T")[0],
        is_holiday: true,
      });

    if (error) {
      console.error("Error al agregar el día de cierre:", error);
    } else {
      setClosedDays([...closedDays, date]);
    }
  };

  return (
    <div>
      <Calendar
        onClickDay={handleDayClick}
        tileDisabled={({ date }) => closedDays.some((d) => d.getTime() === date.getTime())} // Deshabilita días ya seleccionados
      />
      <p className="mt-4">Haz clic en un día para marcarlo como cerrado.</p>
    </div>
  );
};

export default CloseDaysCalendar;
