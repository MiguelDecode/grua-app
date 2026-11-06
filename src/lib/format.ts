// Turns a date like '2026-11-05' into '05/11/2026' (no timezone conversion)
export function formatDate(isoDate: string | null): string {
  if (!isoDate) {
    return "-";
  }

  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

// Turns a full timestamp into a local date like '05/11/2026'
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("es-ES");
}
