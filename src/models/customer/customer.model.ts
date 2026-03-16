export interface CustomerModel {
  id: string;
  fullName: string;
  companyName?: string;
  customerType?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
  currentDebt?: number;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerListQuery {
  page?: number;
  size?: number;
  keyword?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export type CustomerCreateRequest = Omit<CustomerModel, "id" | "createdAt" | "updatedAt">;
export type CustomerUpdateRequest = Omit<CustomerModel, "id" | "createdAt" | "updatedAt">;
