import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { formatDate, formatTimestamp } from "../lib/format";
import { supabase } from "../lib/supabase";
import type { TransferRequestWithDealerships } from "../types";
import StatusBadge from "../components/StatusBadge";

function RequesterHomePage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<TransferRequestWithDealerships[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userId = profile?.id;

  useEffect(() => {
    if (!userId) return;

    async function loadRequests(id: string) {
      const { data, error } = await supabase
        .from("transfer_requests")
        .select(
          `
          *,
          origin:dealerships!origin_dealership_id(name),
          destination:dealerships!destination_dealership_id(name)
        `,
        )
        .eq("requester_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        setErrorMessage("No se han podido cargar tus solicitudes.");
      } else {
        setRequests((data ?? []) as TransferRequestWithDealerships[]);
      }

      setIsLoading(false);
    }

    loadRequests(userId);
  }, [userId]);

  if (isLoading) {
    return <p>Cargando solicitudes...</p>;
  }

  return (
    <div>
      <h1>Mis solicitudes</h1>

      {errorMessage && (
        <p className="error" role="alert">
          {errorMessage}
        </p>
      )}

      {!errorMessage && requests.length === 0 && (
        <p>
          Todavía no has creado ninguna solicitud.{" "}
          <Link to="/requester/new">Crear una solicitud</Link>
        </p>
      )}

      {requests.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Origen</th>
              <th>Destino</th>
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
                <td>{formatDate(request.desired_date)}</td>
                <td>{<StatusBadge status={request.status} />}</td>
                <td>{formatTimestamp(request.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RequesterHomePage;
