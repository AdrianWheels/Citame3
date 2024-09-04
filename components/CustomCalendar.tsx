import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importamos la localización en español
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'; // Importa el hook para obtener el usuario

interface TimeSlot {
  time: string;
  status: 'available' | 'confirmed' | 'pending';
}

interface Booking {
  date: string;
  hour: string;
  status: string;
  user_id: string;
}

const workingHours = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00'
];

const CustomCalendar = () => {
  const { user } = useSupabaseAuth(); // Usamos el hook para obtener el usuario
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (date: Date | Date[]) => {
    const selected = Array.isArray(date) ? date[0] : date;

    if (selected) {
      setSelectedDate(selected);
      setLoading(true);

      const formattedDate = format(selected, 'yyyy-MM-dd', { locale: es });
      console.log('Fecha seleccionada:', formattedDate); // Imprimir la fecha seleccionada

      fetchBookings(formattedDate).finally(() => {
        setLoading(false);
      });
    }
  };

  const handleBooking = async (time: string) => {
    if (!selectedDate || !user) {
      console.log('No se ha seleccionado una fecha o no hay usuario disponible.');
      return; // Asegurarse de que el usuario esté disponible
    }

    console.log('Usuario actual:', user);

    const formattedDate = format(selectedDate, 'yyyy-MM-dd', { locale: es });
    const shopOwnerEmail = process.env.NEXT_PUBLIC_SHOP_OWNER_EMAIL;

    const userEmail = user?.email;

    if (!userEmail) {
      console.error('El usuario no tiene un email disponible.');
      return;
    }

    try {
      console.log('Preparando para enviar el correo de confirmación...');

      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [shopOwnerEmail, userEmail],
          subject: 'Confirmación de Cita',
          text: `Se ha reservado una cita para el ${formattedDate} a las ${time}.`,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el correo');
      }

      console.log('Correos enviados con éxito');

      const newBooking = {
        date: formattedDate,
        hour: time,
        status: 'confirmed',
        user_id: user.id,
      };

      console.log('Preparando para guardar la reserva en la base de datos...', newBooking);

      const { error } = await supabase.from('reservations').insert([newBooking]);

      if (error) {
        console.error('Error al reservar:', error);
      } else {
        console.log('Reserva guardada exitosamente en la base de datos.');
        alert(`Reserva confirmada para las ${time}`);

        await fetchBookings(formattedDate);
      }
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      alert('No se pudo realizar la reserva. Inténtalo nuevamente.');
    } finally {
      console.log('Proceso de reserva finalizado.');
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
        const formattedHour = booking.hour.slice(0, 5); // "HH:mm" formato
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
          onChange={(value: Date | Date[]) => handleDateChange(value)}
          value={selectedDate}
          locale="es-ES" // Localización en español para react-calendar
          className="bg-white shadow-md rounded-lg"
        />
      </div>

      {selectedDate && (
        <>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Horarios disponibles para {format(selectedDate, 'dd/MM/yyyy', { locale: es })} {/* Localización en español */}
          </h3>
          {loading ? (
            <p className="text-center text-gray-500">Cargando horarios...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-4 rounded-lg text-center font-medium transition ${
                      slot.status === 'confirmed'
                        ? 'bg-red-500 text-white cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    onClick={() => {
                      if (slot.status === 'available') {
                        handleBooking(slot.time);
                      }
                    }}
                  >
                    {slot.time} - {slot.status === 'confirmed' ? 'Ocupado' : 'Disponible'}
                  </div>
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
