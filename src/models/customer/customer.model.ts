export interface CustomerModel {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
}

export interface CustomerListQuery {
  page?: number;
  size?: number;
  keyword?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export type CustomerCreateRequest = Omit<CustomerModel, "id" | "createdAt">;
export type CustomerUpdateRequest = Omit<CustomerModel, "id" | "createdAt">;
