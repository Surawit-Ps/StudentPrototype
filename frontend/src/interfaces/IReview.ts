export interface ReviewInterface {
  ID?: number;
  user_id: number;
  work_id: number;
  booking_id: number;
  rating?: number;
  comment?: string;
}