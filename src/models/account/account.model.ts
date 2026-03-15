import type { UserRole, UserStatus } from "../auth/auth.model";

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
  role?: UserRole;
  status?: UserStatus;
}

export interface AccountListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
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
  role: UserRole;
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
