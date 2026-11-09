import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import type { Dealership } from "../types";

function AdminDealershipsPage() {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state. editingId is null when a new dealership is being created
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadDealerships() {
      const { data, error } = await supabase
        .from("dealerships")
        .select("*")
        .order("name");

      if (error) {
        console.error(error.message);
        setErrorMessage("No se han podido cargar los concesionarios.");
      } else {
        setDealerships(data ?? []);
      }

      setIsLoading(false);
    }

    loadDealerships();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setCity("");
    setAddress("");
  }

  function startEditing(dealership: Dealership) {
    setEditingId(dealership.id);
    setName(dealership.name);
    setCity(dealership.city ?? "");
    setAddress(dealership.address ?? "");
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const values = {
      name: name.trim(),
      city: city.trim() || null,
      address: address.trim() || null,
    };

    if (!values.name) {
      setErrorMessage("El nombre es obligatorio.");
      return;
    }

    setIsSaving(true);

    // Create a new dealership or update the one being edited
    const { data, error } =
      editingId === null
        ? await supabase.from("dealerships").insert(values).select().single()
        : await supabase
            .from("dealerships")
            .update(values)
            .eq("id", editingId)
            .select()
            .single();

    setIsSaving(false);

    if (error) {
      console.error(error.message);

      // 23505 is the database code for "this value already exists"
      setErrorMessage(
        error.code === "23505"
          ? "Ya existe un concesionario con ese nombre."
          : "No se ha podido guardar el concesionario.",
      );
      return;
    }

    const saved = data as Dealership;

    // Replace the old version (if any) with the saved one and keep the order
    setDealerships((current) => {
      const others = current.filter((item) => item.id !== saved.id);
      return [...others, saved].sort((a, b) => a.name.localeCompare(b.name));
    });

    resetForm();
  }

  if (isLoading) {
    return <p>Cargando concesionarios...</p>;
  }

  return (
    <div>
      <h1>Concesionarios</h1>

      <h2>
        {editingId === null ? "Nuevo concesionario" : "Editar concesionario"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="city">Ciudad</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="address">Dirección</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>

        {errorMessage && <p className="error" role="alert">{errorMessage}</p>}

        <button type="submit" disabled={isSaving}>
          {isSaving
            ? "Guardando..."
            : editingId === null
              ? "Añadir concesionario"
              : "Guardar cambios"}
        </button>

        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Listado</h2>

      {dealerships.length === 0 ? (
        <p>Todavía no hay ningún concesionario.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dealerships.map((dealership) => (
              <tr key={dealership.id}>
                <td>{dealership.name}</td>
                <td>{dealership.city ?? "-"}</td>
                <td>{dealership.address ?? "-"}</td>
                <td>
                  <button onClick={() => startEditing(dealership)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDealershipsPage;
