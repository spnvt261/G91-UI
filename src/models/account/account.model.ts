import type { UserStatus } from "../auth/auth.model";

export type InternalAccountRoleId = "ACCOUNTANT" | "WAREHOUSE" | "CUSTOMER";
export type AccountRoleId = InternalAccountRoleId | "OWNER";

export interface AccountCreateRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  roleId: string;
}

export interface AccountCreateDataResponse {
  id: string;
}

export interface AccountListQuery {
  page?: number;
  size?: number;
  role?: AccountRoleId;
  status?: UserStatus;
}

export interface AccountListItem {
  id: string;
  fullName: string;
  email: string;
  role: AccountRoleId;
  status: UserStatus;
  createdAt: string;
}

export interface AccountListResponseData {
  content: AccountListItem[];
  page: number;
  size: number;
  totalElements: number;
}

export interface AccountDetailResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: AccountRoleId;
  status: UserStatus;
  createdAt: string;
}

export interface AccountUpdateRequest {
  fullName: string;
  phone?: string;
  address?: string;
  roleId: string;
  status: UserStatus;
}

export interface AccountDeactivateRequest {
  reason?: string;
}

export interface AccountRoleResponse {
  id: string;
  name: string;
  description?: string;
}
