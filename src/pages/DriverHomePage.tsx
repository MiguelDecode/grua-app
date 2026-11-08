import { useEffect, useState } from "react";
import DriverRequestsTable from "../components/DriverRequestsTable";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import type { TransferRequestWithDetails } from "../types";

function DriverHomePage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<TransferRequestWithDetails[]>([]);
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
          destination:dealerships!destination_dealership_id(name),
          requester:profiles!requester_id(full_name),
          driver:profiles!driver_id(full_name)
        `,
        )
        .eq("driver_id", id)
        .order("desired_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        setErrorMessage("No se han podido cargar tus traslados.");
      } else {
        setRequests((data ?? []) as TransferRequestWithDetails[]);
      }

      setIsLoading(false);
    }

    loadRequests(userId);
  }, [userId]);

  if (isLoading) {
    return <p>Cargando traslados...</p>;
  }

  const activeRequests = requests.filter(
    (request) =>
      request.status !== "completed" && request.status !== "cancelled",
  );
  const finishedRequests = requests.filter(
    (request) =>
      request.status === "completed" || request.status === "cancelled",
  );

  return (
    <div>
      <h1>Mis traslados</h1>

      {errorMessage && <p>{errorMessage}</p>}

      {!errorMessage && (
        <>
          <h2>Pendientes de realizar</h2>
          {activeRequests.length === 0 ? (
            <p>No tienes traslados pendientes.</p>
          ) : (
            <DriverRequestsTable requests={activeRequests} />
          )}

          <h2>Historial</h2>
          {finishedRequests.length === 0 ? (
            <p>Todavía no has completado ningún traslado.</p>
          ) : (
            <DriverRequestsTable requests={finishedRequests} />
          )}
        </>
      )}
    </div>
  );
}

export default DriverHomePage;
