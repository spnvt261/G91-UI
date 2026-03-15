import type { UserRole } from "../models/auth/auth.model";

const ACCESS_TOKEN_KEY = "access_token";
const USER_ROLE_KEY = "user_role";

export const getStoredAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredUserRole = (): UserRole | null => {
  const role = localStorage.getItem(USER_ROLE_KEY);
  if (!role) {
    return null;
  }

  return role as UserRole;
};

export const persistAuthSession = (accessToken: string, role: UserRole) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_ROLE_KEY, role);
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
};
