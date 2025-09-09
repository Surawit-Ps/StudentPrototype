import { UsersInterface } from './IUser';     
import { WorkInterface } from './IWork';
import { ReviewInterface } from './IReview'; 

export interface WorkHistoryInterface {
  ID?: number;

  UserID: number;
  User?: UsersInterface;

  WorkID: number;
  Work?: WorkInterface;

  PaidAmount?: number | null;
  VolunteerHour?: number | null;

  Reviews?: ReviewInterface[];
}
