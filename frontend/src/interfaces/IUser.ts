import { GendersInterface } from "./IGender";
export interface UsersInterface {
  ID?: number;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  BirthDay?: string;
  GenderID?: number;
  Gender?: GendersInterface;
  Password?: string;
  Profile?: string;
}