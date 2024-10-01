import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface DefaultHoursFormProps {
  turno: "mañana" | "tarde";
  openingTime: string;
  closingTime: string;
}

const DefaultHoursForm: React.FC<DefaultHoursFormProps> = ({ turno, openingTime, closingTime }) => {
  const [localOpeningTime, setLocalOpeningTime] = useState<string>(openingTime);
  const [localClosingTime, setLocalClosingTime] = useState<string>(closingTime);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLocalOpeningTime(openingTime);
    setLocalClosingTime(closingTime);
  }, [openingTime, closingTime]);

  const handleSaveHours = async () => {
    setLoading(true);

    const updateField =
      turno === "mañana"
        ? {
            morning_opening_time: localOpeningTime,
            morning_closing_time: localClosingTime,
          }
        : {
            afternoon_opening_time: localOpeningTime,
            afternoon_closing_time: localClosingTime,
          };

    const { data, error } = await supabase
      .from("shop_owners")
      .update(updateField)
      .eq("id", 2); // Asegúrate de pasar el ID correcto del dueño de la tienda

    if (error) {
      console.error("Error al actualizar el horario:", error);
    } else {
      alert("Horario actualizado exitosamente");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-2">Hora de Apertura ({turno === "mañana" ? "Mañana" : "Tarde"}):</label>
          <input
            type="time"
            value={localOpeningTime}
            onChange={(e) => setLocalOpeningTime(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2">Hora de Cierre ({turno === "mañana" ? "Mañana" : "Tarde"}):</label>
          <input
            type="time"
            value={localClosingTime}
            onChange={(e) => setLocalClosingTime(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={handleSaveHours}
          className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Horario"}
        </button>
      </div>
    </div>
  );
};

export default DefaultHoursForm;
