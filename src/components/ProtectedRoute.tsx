import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME_PATH } from "../lib/roles";
import type { Role } from "../types";

interface ProtectedRouteProps {
  // If omitted, any logged user can pass
  allowedRoles?: Role[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, profile, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  // Not logged in: go to the login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but without a profile: the role is unknown
  if (!profile) {
    return (
      <div>
        <p>No se ha podido cargar tu perfil. Contacta con el administrador.</p>
        <button onClick={signOut}>Cerrar sesión</button>
      </div>
    );
  }

  // Role not allowed here: send the user to their own home
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={ROLE_HOME_PATH[profile.role]} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
