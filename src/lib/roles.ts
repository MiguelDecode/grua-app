import type { Role } from "../types";

// Home path of each role
export const ROLE_HOME_PATH: Record<Role, string> = {
  requester: "/requester",
  driver: "/driver",
  admin: "/admin",
};

// Text shown to the user for each role
export const ROLE_LABEL: Record<Role, string> = {
  requester: "Solicitante",
  driver: "Gruista",
  admin: "Administrador",
};
