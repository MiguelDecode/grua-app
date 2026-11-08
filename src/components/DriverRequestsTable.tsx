import { formatDate } from "../lib/format";
import { STATUS_LABEL } from "../lib/requestStatus";
import type { TransferRequestWithDetails } from "../types";

interface DriverRequestsTableProps {
  requests: TransferRequestWithDetails[];
}

function DriverRequestsTable({ requests }: DriverRequestsTableProps) {
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
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.vehicle_plate ?? request.vehicle_vin}</td>
              <td>{request.origin?.name}</td>
              <td>{request.destination?.name}</td>
              <td>{request.requester?.full_name}</td>
              <td>{formatDate(request.desired_date)}</td>
              <td>{request.notes ?? "-"}</td>
              <td>{STATUS_LABEL[request.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DriverRequestsTable;
