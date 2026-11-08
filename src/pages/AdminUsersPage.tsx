import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABEL } from "../lib/roles";
import { supabase } from "../lib/supabase";
import type { Dealership, Profile, Role } from "../types";

const ROLES: Role[] = ["requester", "driver", "admin"];

function AdminUsersPage() {
  const { profile: currentProfile } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state. editingUser is null when nobody is being edited
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("requester");
  const [dealershipId, setDealershipId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [usersResult, dealershipsResult] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("dealerships").select("*").order("name"),
      ]);

      if (usersResult.error || dealershipsResult.error) {
        console.error(
          usersResult.error?.message ?? dealershipsResult.error?.message,
        );
        setErrorMessage("No se han podido cargar los datos.");
      } else {
        setUsers((usersResult.data ?? []) as Profile[]);
        setDealerships((dealershipsResult.data ?? []) as Dealership[]);
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  function resetForm() {
    setEditingUser(null);
    setFullName("");
    setRole("requester");
    setDealershipId("");
  }

  function startEditing(user: Profile) {
    setEditingUser(user);
    setFullName(user.full_name);
    setRole(user.role);
    setDealershipId(String(user.dealership_id ?? ""));
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!editingUser) {
      return;
    }

    const name = fullName.trim();

    if (!name) {
      setErrorMessage("El nombre es obligatorio.");
      return;
    }

    if (role === "requester" && !dealershipId) {
      setErrorMessage("Un solicitante debe tener un concesionario.");
      return;
    }

    setIsSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        role,
        dealership_id: dealershipId ? Number(dealershipId) : null,
      })
      .eq("id", editingUser.id)
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      console.error(error.message);
      setErrorMessage("No se ha podido guardar el usuario.");
      return;
    }

    const saved = data as Profile;

    setUsers((current) =>
      current.map((user) => (user.id === saved.id ? saved : user)),
    );

    resetForm();
  }

  function getDealershipName(id: number | null): string {
    if (id === null) {
      return "-";
    }

    return dealerships.find((dealership) => dealership.id === id)?.name ?? "-";
  }

  if (isLoading) {
    return <p>Cargando usuarios...</p>;
  }

  const isEditingOwnProfile = editingUser?.id === currentProfile?.id;

  return (
    <div>
      <h1>Usuarios</h1>

      {errorMessage && <p>{errorMessage}</p>}

      {editingUser && (
        <form onSubmit={handleSubmit}>
          <h2>Editar usuario: {editingUser.email ?? editingUser.id}</h2>

          <div>
            <label htmlFor="fullName">Nombre</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              disabled={isEditingOwnProfile}
            >
              {ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {ROLE_LABEL[roleOption]}
                </option>
              ))}
            </select>
            {isEditingOwnProfile && <p>No puedes cambiar tu propio rol.</p>}
          </div>

          <div>
            <label htmlFor="dealership">Concesionario</label>
            <select
              id="dealership"
              value={dealershipId}
              onChange={(event) => setDealershipId(event.target.value)}
            >
              <option value="">Sin concesionario</option>
              {dealerships.map((dealership) => (
                <option key={dealership.id} value={dealership.id}>
                  {dealership.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={resetForm}>
            Cancelar
          </button>
        </form>
      )}

      <h2>Listado</h2>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Correo</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Concesionario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email ?? "-"}</td>
                <td>{user.full_name}</td>
                <td>{ROLE_LABEL[user.role]}</td>
                <td>{getDealershipName(user.dealership_id)}</td>
                <td>
                  <button onClick={() => startEditing(user)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersPage;
