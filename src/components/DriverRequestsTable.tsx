import { formatDate } from "../lib/format";
import { DRIVER_NEXT_ACTION, STATUS_LABEL } from "../lib/requestStatus";
import type { RequestStatus, TransferRequestWithDetails } from "../types";

interface DriverRequestsTableProps {
  requests: TransferRequestWithDetails[];
  // Id of the request being saved right now (null if none)
  updatingId: number | null;
  onStatusChange: (requestId: number, newStatus: RequestStatus) => void;
}

function DriverRequestsTable({
  requests,
  updatingId,
  onStatusChange,
}: DriverRequestsTableProps) {
  function handleClick(requestId: number, newStatus: RequestStatus) {
    // Completing a transfer cannot be undone from this screen, so we ask first
    if (
      newStatus === "completed" &&
      !window.confirm(
        "¿Seguro que quieres marcar este traslado como completado?",
      )
    ) {
      return;
    }

    onStatusChange(requestId, newStatus);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Vehículo</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Solicitante</th>
            <th>Fecha deseada</th>
            <th>Notas</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const action = DRIVER_NEXT_ACTION[request.status];

            return (
              <tr key={request.id}>
                <td>{request.vehicle_plate ?? request.vehicle_vin}</td>
                <td>{request.origin?.name}</td>
                <td>{request.destination?.name}</td>
                <td>{request.requester?.full_name}</td>
                <td>{formatDate(request.desired_date)}</td>
                <td>{request.notes ?? "-"}</td>
                <td>{STATUS_LABEL[request.status]}</td>
                <td>
                  {action ? (
                    <button
                      onClick={() => handleClick(request.id, action.nextStatus)}
                      disabled={updatingId === request.id}
                    >
                      {updatingId === request.id
                        ? "Guardando..."
                        : action.label}
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DriverRequestsTable;
