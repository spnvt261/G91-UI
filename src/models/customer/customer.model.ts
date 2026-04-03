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
  portalAccountLinked?: boolean;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerPortalAccountModel {
  userId?: string;
  email?: string;
  status?: string;
  temporaryPassword?: string;
}

export interface CustomerFinancialModel {
  creditLimit?: number;
  paymentTerms?: string;
  totalInvoicedAmount?: number;
  totalPaymentsReceived?: number;
  totalAllocatedPayments?: number;
  outstandingDebt?: number;
}

export interface CustomerActivityModel {
  quotationCount?: number;
  contractCount?: number;
  invoiceCount?: number;
  projectCount?: number;
  activeProjectCount?: number;
  openContractCount?: number;
  lastTransactionAt?: string;
}

export interface CustomerContactPersonModel {
  fullName?: string;
  phone?: string;
  email?: string;
  primary?: boolean;
}

export interface CustomerRecentTransactionModel {
  type?: string;
  entityId?: string;
  referenceNo?: string;
  status?: string;
  amount?: number;
  eventAt?: string;
}

export interface CustomerDocumentModel {
  type?: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface CustomerDetailModel {
  customer: CustomerModel;
  portalAccount?: CustomerPortalAccountModel;
  financial?: CustomerFinancialModel;
  activity?: CustomerActivityModel;
  contactPersons: CustomerContactPersonModel[];
  recentTransactions: CustomerRecentTransactionModel[];
  documents: CustomerDocumentModel[];
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

export interface CustomerSummaryResponse {
  customerId?: string;
  customerCode?: string;
  companyName?: string;
  status?: "ACTIVE" | "INACTIVE";
  creditLimit?: number;
  paymentTerms?: string;
  totalInvoicedAmount?: number;
  totalPaymentsReceived?: number;
  totalAllocatedPayments?: number;
  outstandingDebt?: number;
  quotationCount?: number;
  contractCount?: number;
  invoiceCount?: number;
  projectCount?: number;
  activeProjectCount?: number;
  openContractCount?: number;
  canDisable?: boolean;
  disableBlockers: string[];
  lastTransactionAt?: string;
}
