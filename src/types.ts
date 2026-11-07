// Allowed user roles (same values as the user_role enum in the database)
export type Role = "requester" | "driver" | "admin";

// Allowed request statuses (same values as the request_status enum)
export type RequestStatus =
  "pending" | "assigned" | "in_progress" | "completed" | "cancelled";

// One row of the dealerships table
export interface Dealership {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  created_at: string;
}

// One row of the profiles table
export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  dealership_id: number | null;
  created_at: string;
}

// One row of the transfer_requests table
export interface TransferRequest {
  id: number;
  vehicle_plate: string | null;
  vehicle_vin: string | null;
  origin_dealership_id: number;
  destination_dealership_id: number;
  requester_id: string;
  driver_id: string | null;
  status: RequestStatus;
  desired_date: string | null;
  notes: string | null;
  created_at: string;
}

// Data needed to create a request (the rest is filled in by the database)
export type NewTransferRequest = Pick<
  TransferRequest,
  | "vehicle_plate"
  | "vehicle_vin"
  | "origin_dealership_id"
  | "destination_dealership_id"
  | "requester_id"
  | "desired_date"
  | "notes"
>;

// A request together with the names of its dealerships (result of a joined query)
export interface TransferRequestWithDealerships extends TransferRequest {
  origin: { name: string } | null;
  destination: { name: string } | null;
}

// A request with dealership names plus the names of the requester and the driver
export interface TransferRequestWithDetails extends TransferRequestWithDealerships {
  requester: { full_name: string } | null;
  driver: { full_name: string } | null;
}
