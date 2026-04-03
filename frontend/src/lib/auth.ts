import { api, AUTH_TOKEN_KEY } from "@/lib/api";

const AUTH_USER_KEY = "cover_letter_auth_user";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthPayload = {
  user: AuthUser;
  token: string;
};

type AuthResponse = {
  message: string | null;
  data: AuthPayload;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export function getStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function hasStoredToken() {
  return Boolean(getStoredToken());
}

export function storeToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  const rawValue = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function storeUser(user: AuthUser) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthResponse>("/login", input);
  storeToken(data.data.token);
  storeUser(data.data.user);

  return data.data.user;
}

export async function register(input: RegisterInput) {
  const { data } = await api.post<AuthResponse>("/register", input);
  storeToken(data.data.token);
  storeUser(data.data.user);

  return data.data.user;
}

export async function logout() {
  try {
    await api.post("/logout");
  } finally {
    clearToken();
  }
}

export async function getCurrentUser() {
  const { data } = await api.get<{ message: string | null; data: AuthUser }>("/me");
  storeUser(data.data);

  return data.data;
}
