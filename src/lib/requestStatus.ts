import type { RequestStatus } from "../types";

// Text shown to the user for each status
export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pendiente",
  assigned: "Asignada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

// What a driver can do with a request, depending on its current status
export const DRIVER_NEXT_ACTION: Partial<
  Record<RequestStatus, { nextStatus: RequestStatus; label: string }>
> = {
  assigned: { nextStatus: "in_progress", label: "Iniciar traslado" },
  in_progress: { nextStatus: "completed", label: "Marcar como completado" },
};
