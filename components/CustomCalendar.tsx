import { useState } from 'react';
import { Calendar } from 'react-date-range';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import 'react-date-range/dist/styles.css'; // Importa los estilos CSS
import 'react-date-range/dist/theme/default.css'; // Importa el tema por defecto

interface TimeSlot {
  time: string;
  status: 'available' | 'confirmed' | 'pending';
}

const workingHours = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00'
];

interface Booking {
    date: string;
    hour: string;
    status: 'available' | 'confirmed' | 'pending';
    user_id: string;
  }
  

const CustomCalendar = () => {
  const { user } = useSupabaseAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setLoading(true);

    const formattedDate = format(date, 'yyyy-MM-dd', { locale: es });
    fetchBookings(formattedDate).finally(() => setLoading(false));
  };

  
const handleBooking = async (time: string) => {
    if (!selectedDate || !user) return;

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
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('date', formattedDate);

      if (error) throw error;

      const bookingsMap = new Map<string, 'available' | 'confirmed' | 'pending'>();

      data?.forEach((booking: Booking) => {
        const formattedHour = booking.hour.slice(0, 5);
        bookingsMap.set(formattedHour, booking.status as 'available' | 'confirmed' | 'pending');
      });

      const slots: TimeSlot[] = workingHours.map((hour) => ({
        time: hour,
        status: bookingsMap.get(hour) || 'available',
      }));

      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Agenda tu cita</h2>
      <p className="text-gray-600 mb-6 text-center">
        Selecciona una fecha para ver la disponibilidad de horarios
      </p>

      <div className="mb-6 flex justify-center">
        <Calendar
          date={selectedDate || undefined} // Pasamos undefined si selectedDate es null
          onChange={(item) => handleDateChange(item)}
          locale={es} // Localización en español
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
                    className={`p-4 rounded-lg text-center font-medium transition ${
                      slot.status === 'confirmed'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black border border-black hover:bg-gray-100'
                    }`}
                    onClick={() => slot.status === 'available' && handleBooking(slot.time)}
                    disabled={slot.status === 'confirmed'}
                  >
                    {slot.time} - {slot.status === 'confirmed' ? 'Ocupado' : 'Disponible'}
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
