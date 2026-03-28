import type { UserRole } from "../models/auth/auth.model";

const ACCESS_TOKEN_KEY = "access_token";
const USER_ROLE_KEY = "user_role";

export const getStoredAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

export const normalizeUserRole = (role: string | null | undefined): UserRole | null => {
  if (!role) {
    return null;
  }

  let upperRole = role.trim().toUpperCase();

  if (upperRole.startsWith("ROLE_")) {
    upperRole = upperRole.slice(5);
  }

  if (upperRole === "ACOUNTER") {
    return "ACCOUNTANT";
  }

  if (upperRole === "ACCOUNTING") {
    return "ACCOUNTANT";
  }

  if (upperRole === "ADMIN") {
    return "OWNER";
  }

  if (upperRole === "GUEST" || upperRole === "CUSTOMER" || upperRole === "ACCOUNTANT" || upperRole === "WAREHOUSE" || upperRole === "OWNER") {
    return upperRole;
  }

  return null;
};

export const getStoredUserRole = (): UserRole | null => {
  const role = localStorage.getItem(USER_ROLE_KEY);
  return normalizeUserRole(role);
};

export const persistAuthSession = (accessToken: string, role: UserRole) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  const normalizedRole = normalizeUserRole(role) ?? role;
  localStorage.setItem(USER_ROLE_KEY, normalizedRole);
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
};
