export interface CustomerModel {
  id: string;
  customerCode?: string;
  companyName: string;
  taxCode: string;
  customerType: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  priceGroup?: string;
  creditLimit?: number;
  paymentTerms?: string;
  currentDebt?: number;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  customerCode?: string;
  taxCode?: string;
  customerType?: string;
  priceGroup?: string;
  status?: "ACTIVE" | "INACTIVE";
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt" | "customerCode" | "companyName" | "creditLimit";
  sortDir?: "asc" | "desc";
}

export interface CustomerListResponse {
  items: CustomerModel[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CustomerCreateRequest {
  companyName: string;
  taxCode: string;
  customerType: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  priceGroup?: string;
  creditLimit?: number;
  paymentTerms?: string;
  createPortalAccount?: boolean;
}

export interface CustomerUpdateRequest {
  companyName: string;
  taxCode: string;
  customerType: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  priceGroup?: string;
  creditLimit?: number;
  paymentTerms?: string;
  changeReason?: string;
}

export interface CustomerDisableRequest {
  reason: string;
}

export interface CustomerStatusResponse {
  id: string;
  customerCode?: string;
  status?: "ACTIVE" | "INACTIVE";
  reason?: string;
  updatedAt?: string;
}
