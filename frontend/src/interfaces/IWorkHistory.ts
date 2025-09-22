export interface IWorkHistory {
  ID?: number;
  user_id: number;
  work_id: number;
  paid_amount: number | null;
  volunteer_hour: number | null;
  Work?: {
    title?: string;
    description?: string;
    paid?: number | null;
    volunteer?: number | null;
  };
  User?: {
    FirstName?: string;
    LastName?: string;
  };
}
