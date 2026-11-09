import { STATUS_LABEL } from "../lib/requestStatus";
import type { RequestStatus } from "../types";

interface StatusBadgeProps {
  status: RequestStatus;
}

// Shows the status as a colored label
function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
  );
}

export default StatusBadge;
