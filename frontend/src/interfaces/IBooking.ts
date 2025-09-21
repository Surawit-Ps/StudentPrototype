export interface BookingInterface {
  ID?: number;
  user_id?: number;
  work_id?: number;
  status?: string; // <-- NEW field
  deleted_at?: string | null;
}