import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Profile, TransferRequestWithDetails } from "../types";

interface AssignDriverFormProps {
  request: TransferRequestWithDetails;
  drivers: Profile[];
  // Called after the change has been saved, so the list can update itself
  onAssigned: (requestId: number, driver: Profile) => void;
}

function AssignDriverForm({
  request,
  drivers,
  onAssigned,
}: AssignDriverFormProps) {
  const [driverId, setDriverId] = useState(request.driver_id ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAssign() {
    const driver = drivers.find((item) => item.id === driverId);

    if (!driver) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("transfer_requests")
      .update({ driver_id: driver.id, status: "assigned" })
      .eq("id", request.id);

    setIsSaving(false);

    if (error) {
      console.error(error.message);
      setErrorMessage("No se ha podido asignar el gruista.");
      return;
    }

    onAssigned(request.id, driver);
  }

  return (
    <div>
      <select
        aria-label="Gruista"
        value={driverId}
        onChange={(event) => setDriverId(event.target.value)}
      >
        <option value="">Selecciona un gruista</option>
        {drivers.map((driver) => (
          <option key={driver.id} value={driver.id}>
            {driver.full_name}
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        disabled={!driverId || isSaving || driverId === request.driver_id}
      >
        {isSaving
          ? "Guardando..."
          : request.driver_id
            ? "Reasignar"
            : "Asignar"}
      </button>

      {errorMessage && <p className="error" role="alert">{errorMessage}</p>}
    </div>
  );
}

export default AssignDriverForm;
