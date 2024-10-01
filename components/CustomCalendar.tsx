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

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

const CustomCalendar = () => {
  const { user } = useSupabaseAuth();
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [shopHours, setShopHours] = useState({ opening: '08:00', closing: '20:00' });

  useEffect(() => {
    // Obtener los horarios por defecto de la tienda
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

  const handleDateChange = async (date: CalendarValue) => {
    if (!date || Array.isArray(date)) {
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
      return;
    } else {
      if (scheduleData?.opening_time && scheduleData?.closing_time) {
        setShopHours({
          opening: scheduleData.opening_time,
          closing: scheduleData.closing_time,
        });
      }
    }

    await fetchBookings(formattedDate).finally(() => setLoading(false));
  };

  const handleBooking = async (time: string) => {
    if (!selectedDate || !user || Array.isArray(selectedDate)) return;
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

      data?.forEach((booking) => {
        const formattedHour = booking.hour.slice(0, 5);
        bookingsMap.set(formattedHour, booking.status as 'available' | 'confirmed' | 'pending');
      });

      const slots: TimeSlot[] = generateTimeSlots(shopHours.opening, shopHours.closing, bookingsMap);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  // Función para deshabilitar fechas anteriores a hoy
  const isTileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setear la hora a 00:00 para comparar solo fechas
    return date < today;
  };

  return (
    <div className="p-6 max-w-screen-xl w-4/5 mx-auto bg-black shadow-lg rounded-xl">
      <h2 className="text-4xl font-semibold text-white mb-8 text-center">Agenda tu cita</h2>
      <div className="mb-10 flex justify-center">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          locale="es"
          className="custom-calendar"
          tileDisabled={isTileDisabled} // Deshabilitar fechas anteriores a hoy
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
                    className={`w-[100px] h-[80px] rounded-lg text-center font-medium transition ${
                      slot.status === 'confirmed'
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white border border-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => slot.status === 'available' && handleBooking(slot.time)}
                    disabled={slot.status === 'confirmed'}
                  >
                    {slot.time} <br />
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
