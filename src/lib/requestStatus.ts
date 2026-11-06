import type { RequestStatus } from "../types";

// Text shown to the user for each status
export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pendiente",
  assigned: "Asignada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};
