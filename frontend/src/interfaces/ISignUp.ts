// interfaces/ISignUp.ts
export interface SignUpInterface {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  BirthDay: string; // ใช้ ISO string เช่น '2000-01-01'
  Profile: string;
  GenderID: number;
}
