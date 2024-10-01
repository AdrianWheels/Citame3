import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import 'react-calendar/dist/Calendar.css';
import '@/components/calendaryStyles.css';

interface TimeSlot {
  time: string;
  status: 'available' | 'confirmed' | 'pending';
}

// Definir el tipo que acepta el valor de react-calendar
type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

const CustomCalendar = () => {
  const { user } = useSupabaseAuth();
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date());  // Cambiado el tipo del estado
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [shopHours, setShopHours] = useState({ opening: '08:00', closing: '20:00' });

  useEffect(() => {
    // Obtener los horarios por defecto de la tienda al cargar el componente
    const fetchShopHours = async () => {
      const { data, error } = await supabase.from('shop_owners').select('default_opening_time, default_closing_time').single();
      if (error) {
        console.error('Error fetching shop hours:', error);
      } else {
        setShopHours({
          opening: data.default_opening_time,
          closing: data.default_closing_time,
        });
      }
    };
    fetchShopHours();
  }, []);

  const handleDateChange = async (date: CalendarValue) => {  // Cambiado el tipo del parámetro
    if (!date || Array.isArray(date)) {
      // Si no se selecciona una fecha válida o si es un rango (que no estás manejando)
      setSelectedDate(null);
      setTimeSlots([]);
      return;
    }

    setSelectedDate(date);
    setLoading(true);
    const formattedDate = format(date, 'yyyy-MM-dd', { locale: es });

    // Verificar si el día seleccionado es festivo o tiene ajustes de horario
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('shop_schedule')
      .select('is_holiday, opening_time, closing_time')
      .eq('date', formattedDate)
      .single();

    if (scheduleError) {
      console.error('Error fetching shop schedule:', scheduleError);
    } else if (scheduleData?.is_holiday) {
      setTimeSlots([]);
      setLoading(false);
      return; // Si es festivo, no mostrar horarios
    } else {
      // Si hay ajustes de horario, usarlos en lugar de los horarios por defecto
      if (scheduleData?.opening_time && scheduleData?.closing_time) {
        setShopHours({
          opening: scheduleData.opening_time,
          closing: scheduleData.closing_time,
        });
      }
    }

    // Llamada para obtener las reservas
    await fetchBookings(formattedDate).finally(() => setLoading(false));
  };

  const handleBooking = async (time: string) => {
    if (!selectedDate || !user || Array.isArray(selectedDate)) return;  // Asegurarse de que no es un rango
    const formattedDate = format(selectedDate, 'yyyy-MM-dd', { locale: es });
    const shopOwnerEmail = process.env.NEXT_PUBLIC_SHOP_OWNER_EMAIL;
    const userEmail = user?.email;

    if (!userEmail) return;

    try {
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [shopOwnerEmail, userEmail],
          subject: 'Confirmación de Cita',
          text: `Se ha reservado una cita para el ${formattedDate} a las ${time}.`,
        }),
      });

      if (!response.ok) throw new Error('Error al enviar el correo');

      const newBooking = {
        date: formattedDate,
        hour: time,
        status: 'confirmed',
        user_id: user.id,
      };

      const { error } = await supabase.from('reservations').insert([newBooking]);

      if (error) {
        console.error('Error al reservar:', error);
      } else {
        alert(`Reserva confirmada para las ${time}`);
        await fetchBookings(formattedDate);
      }
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      alert('No se pudo realizar la reserva. Inténtalo nuevamente.');
    }
  };

  const fetchBookings = async (formattedDate: string) => {
    try {
      // Realizar la consulta a ambas tablas: `shop_schedule` y `reservations`
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('shop_schedule')
        .select('is_holiday, opening_time, closing_time')
        .eq('date', formattedDate)
        .maybeSingle();  // Usamos maybeSingle para manejar casos sin filas
  
      if (scheduleError) {
        throw scheduleError;
      }
  
      // Verificar si es fin de semana
      const isWeekend = (date: string) => {
        const dayOfWeek = new Date(date).getDay(); // 0 = Domingo, 6 = Sábado
        return dayOfWeek === 0 || dayOfWeek === 6;
      };
  
      if (scheduleData?.is_holiday || isWeekend(formattedDate)) {
        // Si es festivo o fin de semana, no hay horas disponibles
        setTimeSlots([]);
        return;
      }
  
      // Si no hay horarios especiales, usamos los horarios por defecto
      const shopOpeningTime = scheduleData?.opening_time || shopHours.opening;
      const shopClosingTime = scheduleData?.closing_time || shopHours.closing;
  
      // Obtener las reservas para ese día
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('date', formattedDate);
  
      if (reservationsError) {
        throw reservationsError;
      }
  
      // Mapear las reservas existentes
      const bookingsMap = new Map<string, 'available' | 'confirmed' | 'pending'>();
  
      reservationsData?.forEach((booking) => {
        const formattedHour = booking.hour.slice(0, 5);
        bookingsMap.set(formattedHour, booking.status as 'available' | 'confirmed' | 'pending');
      });
  
      // Generar los horarios disponibles con base en los horarios de la tienda
      const slots: TimeSlot[] = generateTimeSlots(shopOpeningTime, shopClosingTime, bookingsMap);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // En caso de error, podemos devolver los horarios por defecto de la tienda
      const slots: TimeSlot[] = generateTimeSlots(shopHours.opening, shopHours.closing, new Map());
      setTimeSlots(slots);
    }
  };
  
  

  const generateTimeSlots = (
    openingTime: string,
    closingTime: string,
    bookingsMap: Map<string, 'available' | 'confirmed' | 'pending'>
  ): TimeSlot[] => {
    const startHour = parseInt(openingTime.split(':')[0]);
    const endHour = parseInt(closingTime.split(':')[0]);
    const slots: TimeSlot[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time,
        status: bookingsMap.get(time) || 'available',
      });
    }

    return slots;
  };

  return (
    <div className="p-6 max-w-screen-xl w-4/5 mx-auto bg-black shadow-lg rounded-xl">
    
  
    <div className="mb-10 flex justify-center">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        locale="es"
        className="custom-calendar"
      />
    </div>
  
    {selectedDate && (
      <>
        {loading ? (
          <p className="text-center text-gray-500">Cargando horarios...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {timeSlots.length > 0 ? (
              timeSlots.map((slot, index) => (
                <button
                  key={index}
                  className={`w-[100px] h-[80px] rounded-lg text-center font-medium transition ${slot.status === 'confirmed'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white border border-gray-600 hover:bg-gray-700'
                  }`}
                  onClick={() => slot.status === 'available' && handleBooking(slot.time)}
                  disabled={slot.status === 'confirmed'}
                >
                  {slot.time} <br />{' '}
                  <span className={`${slot.status === 'confirmed' ? 'text-red-500' : 'text-green-500'}`}>
                    {slot.status === 'confirmed' ? 'Ocupado' : 'Disponible'}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay horarios disponibles.</p>
            )}
          </div>
        )}
      </>
    )}
  </div>
  );
};

export default CustomCalendar;
