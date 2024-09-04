import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleDateChange = (date: Date | Date[]) => {
    const selected = Array.isArray(date) ? date[0] : date;
    
    if (selected) {
      setSelectedDate(selected);
      setLoading(true);
      
      const formattedDate = format(selected, 'yyyy-MM-dd');
      
      // Llamar a fetchBookings sin esperar a la resolución aquí
      fetchBookings(formattedDate).finally(() => {
        setLoading(false);
      });
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
          className="bg-white shadow-md rounded-lg"
        />
      </div>

      {selectedDate && (
        <>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Horarios disponibles para {format(selectedDate, 'dd/MM/yyyy')}
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
                    onClick={() => slot.status === 'available' && alert(`Reserva confirmada para las ${slot.time}`)}
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
