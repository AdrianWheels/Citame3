import { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';

interface TimeSlot {
  time: string;
  status: 'available' | 'confirmed' | 'pending';
}

const CustomCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Ajustamos el tipo de 'date' para manejar Date | Date[]
  const handleDateChange = async (date: Date | Date[]) => {
    // Si es un array de fechas, tomamos la primera fecha
    const selected = Array.isArray(date) ? date[0] : date;
    setSelectedDate(selected);
    setLoading(true);

    // Simulando la carga de horarios
    setTimeout(() => {
      setTimeSlots([
        { time: '08:00', status: 'available' },
        { time: '09:00', status: 'confirmed' },
        { time: '10:00', status: 'available' },
        { time: '11:00', status: 'confirmed' },
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleBooking = async (time: string) => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    // Lógica para reservar una cita
    console.log(`Reserva confirmada para ${formattedDate} a las ${time}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Agenda tu cita</h2>
      <p className="text-gray-600 text-center mb-6">
        Selecciona una fecha para ver la disponibilidad de horarios
      </p>

      {/* Calendario de selección de fechas */}
      <div className="mb-8 flex justify-center">
        <Calendar
          onChange={handleDateChange} // Corregido para manejar Date o Date[]
          value={selectedDate}
          className="bg-white shadow-md rounded-lg p-4"
        />
      </div>

      {/* Mostrar horarios disponibles */}
      <div className="mt-6">
        {selectedDate && (
          <>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Horarios disponibles para {format(selectedDate, 'dd/MM/yyyy')}
            </h3>
            {loading ? (
              <p className="text-center text-gray-500">Cargando horarios...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
                  timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer p-4 rounded-lg text-center font-medium transition ${
                        slot.status === 'confirmed'
                          ? 'bg-red-500 text-white cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      onClick={() => slot.status === 'available' && handleBooking(slot.time)}
                      style={{ pointerEvents: slot.status === 'confirmed' ? 'none' : 'auto' }}
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
    </div>
  );
};

export default CustomCalendar;
