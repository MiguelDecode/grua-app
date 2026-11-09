import { useEffect, useState } from "react";
import AssignDriverForm from "../components/AssignDriverForm";
import { formatDate, formatTimestamp } from "../lib/format";
import { supabase } from "../lib/supabase";
import type { Profile, TransferRequestWithDetails } from "../types";
import StatusBadge from "../components/StatusBadge";

function AdminHomePage() {
  const [requests, setRequests] = useState<TransferRequestWithDetails[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      // Both requests are sent at the same time
      const [requestsResult, driversResult] = await Promise.all([
        supabase
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
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("*")
          .eq("role", "driver")
          .order("full_name"),
      ]);

      if (requestsResult.error || driversResult.error) {
        console.error(
          requestsResult.error?.message ?? driversResult.error?.message,
        );
        setErrorMessage("No se han podido cargar los datos.");
      } else {
        setRequests(
          (requestsResult.data ?? []) as TransferRequestWithDetails[],
        );
        setDrivers((driversResult.data ?? []) as Profile[]);
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  // Updates the list on screen after a driver has been assigned
  function handleAssigned(requestId: number, driver: Profile) {
    setRequests((current) =>
      current.map((request): TransferRequestWithDetails =>
        request.id === requestId
          ? {
              ...request,
              driver_id: driver.id,
              status: "assigned",
              driver: { full_name: driver.full_name },
            }
          : request,
      ),
    );
  }

  if (isLoading) {
    return <p>Cargando solicitudes...</p>;
  }

  return (
    <div>
      <h1>Panel de administración</h1>
      <h2>Todas las solicitudes</h2>

      {errorMessage && (
        <p className="error" role="alert">
          {errorMessage}
        </p>
      )}

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
                <th>Asignar gruista</th>
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
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>{formatTimestamp(request.created_at)}</td>
                  <td>
                    {request.status === "pending" ||
                    request.status === "assigned" ? (
                      <AssignDriverForm
                        request={request}
                        drivers={drivers}
                        onAssigned={handleAssigned}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
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
