import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Dealership } from "./types";

function App() {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDealerships() {
      const { data, error } = await supabase.from("dealerships").select("*");

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setDealerships(data ?? []);
    }

    loadDealerships();
  }, []);

  return (
    <div>
      <h1>Gestión de grúas</h1>
      <h2>Concesionarios (prueba de conexión)</h2>

      {errorMessage && <p>Error al cargar los datos: {errorMessage}</p>}

      <ul>
        {dealerships.map((dealership) => (
          <li key={dealership.id}>
            {dealership.name} - {dealership.city}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
