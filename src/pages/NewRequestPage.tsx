import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Dealership, NewTransferRequest } from "../types";

function NewRequestPage() {
  const { profile } = useAuth();

  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  // The origin starts as the dealership of the logged user (if it has one)
  const [originId, setOriginId] = useState(
    String(profile?.dealership_id ?? ""),
  );
  const [destinationId, setDestinationId] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load the dealerships to fill the two dropdowns
  useEffect(() => {
    async function loadDealerships() {
      const { data, error } = await supabase
        .from("dealerships")
        .select("*")
        .order("name");

      if (error) {
        console.error(error.message);
        setErrorMessage("No se han podido cargar los concesionarios.");
        return;
      }

      setDealerships(data ?? []);
    }

    loadDealerships();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!profile) {
      return;
    }

    const plate = vehiclePlate.trim();
    const vin = vehicleVin.trim();

    if (!plate && !vin) {
      setErrorMessage(
        "Indica la matrícula o el número de bastidor del vehículo.",
      );
      return;
    }

    if (!originId || !destinationId) {
      setErrorMessage("Selecciona el concesionario de origen y el de destino.");
      return;
    }

    if (originId === destinationId) {
      setErrorMessage(
        "El origen y el destino deben ser concesionarios distintos.",
      );
      return;
    }

    // Empty optional fields are sent as null, not as empty text
    const newRequest: NewTransferRequest = {
      vehicle_plate: plate || null,
      vehicle_vin: vin || null,
      origin_dealership_id: Number(originId),
      destination_dealership_id: Number(destinationId),
      requester_id: profile.id,
      desired_date: desiredDate || null,
      notes: notes.trim() || null,
    };

    setIsSubmitting(true);
    const { error } = await supabase
      .from("transfer_requests")
      .insert(newRequest);
    setIsSubmitting(false);

    if (error) {
      console.error(error.message);
      setErrorMessage(
        "No se ha podido guardar la solicitud. Inténtalo de nuevo.",
      );
      return;
    }

    // Clear the form (the origin stays as it was)
    setVehiclePlate("");
    setVehicleVin("");
    setDestinationId("");
    setDesiredDate("");
    setNotes("");
    setSuccessMessage("Solicitud enviada correctamente.");
  }

  return (
    <div>
      <h1>Nueva solicitud de traslado</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="vehiclePlate">Matrícula</label>
          <input
            id="vehiclePlate"
            type="text"
            value={vehiclePlate}
            onChange={(event) => setVehiclePlate(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="vehicleVin">Número de bastidor</label>
          <input
            id="vehicleVin"
            type="text"
            value={vehicleVin}
            onChange={(event) => setVehicleVin(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="origin">Concesionario de origen</label>
          <select
            id="origin"
            value={originId}
            onChange={(event) => setOriginId(event.target.value)}
            required
          >
            <option value="">Selecciona un concesionario</option>
            {dealerships.map((dealership) => (
              <option key={dealership.id} value={dealership.id}>
                {dealership.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="destination">Concesionario de destino</label>
          <select
            id="destination"
            value={destinationId}
            onChange={(event) => setDestinationId(event.target.value)}
            required
          >
            <option value="">Selecciona un concesionario</option>
            {dealerships.map((dealership) => (
              <option key={dealership.id} value={dealership.id}>
                {dealership.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="desiredDate">Fecha deseada</label>
          <input
            id="desiredDate"
            type="date"
            value={desiredDate}
            onChange={(event) => setDesiredDate(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {errorMessage && <p>{errorMessage}</p>}
        {successMessage && <p>{successMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>
    </div>
  );
}

export default NewRequestPage;
