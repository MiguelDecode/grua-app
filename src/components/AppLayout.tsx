import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABEL } from "../lib/roles";
import type { Role } from "../types";

interface NavItem {
  to: string;
  label: string;
}

// Menu entries of each role (more will be added in later steps)
const NAV_ITEMS: Record<Role, NavItem[]> = {
  requester: [
    { to: "/requester", label: "Mis solicitudes" },
    { to: "/requester/new", label: "Nueva solicitud" },
  ],
  driver: [{ to: "/driver", label: "Mis traslados" }],
  admin: [
    { to: "/admin", label: "Solicitudes" },
    { to: "/admin/dealerships", label: "Concesionarios" },
  ],
};

function AppLayout() {
  const { profile, signOut } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div>
      <header>
        <strong>Gestión de grúas</strong>

        <nav>
          {NAV_ITEMS[profile.role].map((item) => (
            <NavLink key={item.to} to={item.to} end>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <span>
          {profile.full_name} ({ROLE_LABEL[profile.role]})
        </span>
        <button onClick={signOut}>Cerrar sesión</button>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
