export const ROUTE_URL = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",

  PRODUCT_LIST: "/products",
  PRODUCT_DETAIL: "/products/:id",

  QUOTATION_LIST: "/quotations",
  QUOTATION_CREATE: "/quotations/create",
  QUOTATION_DETAIL: "/quotations/:id",

  CONTRACT_LIST: "/contracts",
  CONTRACT_CREATE: "/contracts/create/:quotationId",
  CONTRACT_DETAIL: "/contracts/:id",
  CONTRACT_EDIT: "/contracts/:id/edit",
  CONTRACT_TRACKING: "/contracts/:id/tracking",

  CONTRACT_APPROVAL_LIST: "/approvals/contracts",
  CONTRACT_APPROVAL_DETAIL: "/approvals/contracts/:id",

  CUSTOMER_LIST: "/customers",
  CUSTOMER_DETAIL: "/customers/:id",
  CUSTOMER_CREATE: "/customers/create",
  CUSTOMER_EDIT: "/customers/:id/edit",

  PROJECT_LIST: "/projects",
  PROJECT_DETAIL: "/projects/:id",
  PROJECT_CREATE: "/projects/create",
  PROJECT_EDIT: "/projects/:id/edit",
  PROJECT_ASSIGN_WAREHOUSE: "/projects/:id/assign-warehouse",

  PAYMENT_LIST: "/payments",
  PAYMENT_DETAIL: "/payments/:id",
  PAYMENT_RECORD: "/payments/:id/record",

  REPORT_DASHBOARD: "/reports/dashboard",
  REPORT_SALES: "/reports/sales",
  REPORT_INVENTORY: "/reports/inventory",
  REPORT_FINANCIAL: "/reports/financial",
} as const;
