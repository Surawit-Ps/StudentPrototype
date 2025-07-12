import { UsersInterface } from "../../interfaces/IUser";
import { WorkInterface } from "../../interfaces/IWork";
import { DashboardInterface } from "../../interfaces/IDashboard";

const apiUrl = "http://localhost:8000";

// ส่ง Authorization Header อัตโนมัติ
export function authRequestOptions(method: string = "GET", body?: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type") || "Bearer";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `${tokenType} ${token}`,
  };

  const options: RequestInit = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}

// -------------------- AUTH --------------------
export async function SignIn(email: string, password: string) {
  const res = await fetch(`${apiUrl}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email, Password: password }),
  });

  const data = await res.json();

  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("token_type", data.token_type);
    localStorage.setItem("user_id", data.id.toString());
    return true;
  }

  console.error("Login failed:", data.error);
  return false;
}

export async function SignUp(data: UsersInterface) {
  const res = await fetch(`${apiUrl}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 201) {
    return res.json();
  } else {
    const error = await res.json();
    console.error("SignUp failed:", error);
    return false;
  }
}

// -------------------- USER --------------------
async function GetUsers() {
  const res = await fetch(`${apiUrl}/users`, authRequestOptions("GET"));
  return res.ok ? res.json() : false;
}

async function GetUserById(id: Number | undefined) {
  const res = await fetch(`${apiUrl}/user/${id}`, authRequestOptions("GET"));
  return res.ok ? res.json() : false;
}

async function CreateUser(data: UsersInterface) {
  const res = await fetch(`${apiUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.status === 201 ? res.json() : false;
}

async function UpdateUser(data: UsersInterface) {
  const res = await fetch(`${apiUrl}/users`, authRequestOptions("PATCH", data));
  return res.ok ? res.json() : false;
}

async function DeleteUserByID(id: Number | undefined) {
  const res = await fetch(`${apiUrl}/users/${id}`, authRequestOptions("DELETE"));
  return res.ok;
}

async function GetGenders() {
  const res = await fetch(`${apiUrl}/genders`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return res.ok ? res.json() : false;
}

// -------------------- WORK --------------------
async function CreateWork(data: WorkInterface) {
  const res = await fetch(`${apiUrl}/work`, authRequestOptions("POST", data));
  return res.ok ? res.json() : false;
}

async function GetWork() {
  const res = await fetch(`${apiUrl}/work`, authRequestOptions("GET"));
  return res.ok ? res.json() : false;
}

async function GetWorkById(id: Number | undefined) {
  const res = await fetch(`${apiUrl}/work/${id}`, authRequestOptions("GET"));
  return res.ok ? res.json() : false;
}

async function UpdateWork(data: WorkInterface) {
  const res = await fetch(`${apiUrl}/work/${data.ID}`, authRequestOptions("PATCH", data));
  return res.ok ? res.json() : false;
}

async function DeleteWorkByID(id: Number | undefined) {
  const res = await fetch(`${apiUrl}/work/${id}`, authRequestOptions("DELETE"));
  return res.ok;
}

// -------------------- DASHBOARD --------------------
async function CreateDashboard(data: DashboardInterface) {
  const res = await fetch(`${apiUrl}/dashboard`, authRequestOptions("POST", data));
  return res.ok ? res.json() : false;
}

async function GetDashboard() {
  const res = await fetch(`${apiUrl}/dashboard`, authRequestOptions("GET"));
  return res.ok ? res.json() : false;
}

async function GetDashboardById(id: Number | undefined) {
  const res = await fetch(`${apiUrl}/dashboard/${id}`, authRequestOptions("GET"));
  return res.ok ? res.json() : false;
}

async function UpdateDashboard(data: DashboardInterface) {
  const res = await fetch(`${apiUrl}/dashboard`, authRequestOptions("PATCH", data));
  return res.ok ? res.json() : false;
}

async function DeleteDashboardByID(id: Number | undefined) {
  const res = await fetch(`${apiUrl}/dashboard/${id}`, authRequestOptions("DELETE"));
  return res.ok;
}

export {
  // user
  GetUsers,
  CreateUser,
  GetGenders,
  DeleteUserByID,
  GetUserById,
  UpdateUser,
  // work
  CreateWork,
  GetWork,
  GetWorkById,
  UpdateWork,
  DeleteWorkByID,
  // dashboard
  CreateDashboard,
  GetDashboard,
  GetDashboardById,
  UpdateDashboard,
  DeleteDashboardByID,
};
