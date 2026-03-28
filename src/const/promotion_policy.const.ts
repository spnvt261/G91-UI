import type { UserRole } from "../models/auth/auth.model";

export const PROMOTION_READ_ROLES: UserRole[] = ["OWNER", "ACCOUNTANT", "CUSTOMER"];
export const PROMOTION_WRITE_ROLES: UserRole[] = ["OWNER", "ACCOUNTANT"];

export const canReadPromotionByRole = (role: UserRole | null | undefined): boolean => {
  if (!role) {
    return false;
  }

  return PROMOTION_READ_ROLES.includes(role);
};

export const canWritePromotionByRole = (role: UserRole | null | undefined): boolean => {
  if (!role) {
    return false;
  }

  return PROMOTION_WRITE_ROLES.includes(role);
};
