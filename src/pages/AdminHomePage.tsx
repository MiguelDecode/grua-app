import { useEffect, useState } from "react";
import { formatDate, formatTimestamp } from "../lib/format";
import { STATUS_LABEL } from "../lib/requestStatus";
import { supabase } from "../lib/supabase";
import type { TransferRequestWithDetails } from "../types";

function AdminHomePage() {
  const [requests, setRequests] = useState<TransferRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      const { data, error } = await supabase
        .from("transfer_requests")
        .select(
          `
          *,
          origin:dealerships!origin_dealership_id(name),
          destination:dealerships!destination_dealership_id(name),
          requester:profiles!requester_id(full_name),
          driver:profiles!driver_id(full_name)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        setErrorMessage("No se han podido cargar las solicitudes.");
      } else {
        setRequests((data ?? []) as TransferRequestWithDetails[]);
      }

      setIsLoading(false);
    }

    loadRequests();
  }, []);

  if (isLoading) {
    return <p>Cargando solicitudes...</p>;
  }

  return (
    <div>
      <h1>Panel de administración</h1>
      <h2>Todas las solicitudes</h2>

      {errorMessage && <p>{errorMessage}</p>}

      {!errorMessage && requests.length === 0 && (
        <p>Todavía no hay ninguna solicitud.</p>
      )}

      {requests.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Solicitante</th>
                <th>Gruista</th>
                <th>Fecha deseada</th>
                <th>Estado</th>
                <th>Creada el</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.vehicle_plate ?? request.vehicle_vin}</td>
                  <td>{request.origin?.name}</td>
                  <td>{request.destination?.name}</td>
                  <td>{request.requester?.full_name}</td>
                  <td>{request.driver?.full_name ?? "Sin asignar"}</td>
                  <td>{formatDate(request.desired_date)}</td>
                  <td>{STATUS_LABEL[request.status]}</td>
                  <td>{formatTimestamp(request.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminHomePage;
