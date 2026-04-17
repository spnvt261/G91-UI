export const ROUTE_URL = {
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_REGISTRATION: "/verify-registration",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",
  ACCOUNT_LIST: "/accounts",
  ACCOUNT_CREATE: "/accounts/create",
  ACCOUNT_DETAIL: "/accounts/:id",
  ACCOUNT_EDIT: "/accounts/:id/edit",

  PRODUCT_LIST: "/products",
  PRODUCT_DETAIL: "/products/:id",
  PRODUCT_CREATE: "/products/create",
  PRODUCT_EDIT: "/products/:id/edit",

  PRICE_LIST_LIST: "/price-lists",
  PRICE_LIST_CREATE: "/price-lists/create",
  PRICE_LIST_DETAIL: "/price-lists/:id",

  QUOTATION_LIST: "/quotations",
  QUOTATION_CREATE: "/quotations/create",
  QUOTATION_DETAIL: "/quotations/:id",

  PROMOTION_LIST: "/promotions",
  PROMOTION_CREATE: "/promotions/create",
  PROMOTION_DETAIL: "/promotions/:id",

  CONTRACT_LIST: "/contracts",
  CONTRACT_CREATE: "/contracts/create/:quotationId",
  CONTRACT_DETAIL: "/contracts/:id",
  CONTRACT_EDIT: "/contracts/:id/edit",
  CONTRACT_TRACKING: "/contracts/:id/tracking",

  CONTRACT_APPROVAL_LIST: "/approvals/contracts",
  CONTRACT_APPROVAL_DETAIL: "/approvals/contracts/:id",

  SALE_ORDER_LIST: "/sale-orders",
  SALE_ORDER_DETAIL: "/sale-orders/:id",
  SALE_ORDER_TIMELINE: "/sale-orders/:id/timeline",

  CUSTOMER_LIST: "/customers",
  CUSTOMER_DETAIL: "/customers/:id",
  CUSTOMER_CREATE: "/customers/create",
  CUSTOMER_EDIT: "/customers/:id/edit",

  PROJECT_LIST: "/projects",
  PROJECT_DETAIL: "/projects/:id",
  PROJECT_CREATE: "/projects/create",
  PROJECT_EDIT: "/projects/:id/edit",
  PROJECT_ASSIGN_WAREHOUSE: "/projects/:id/assign-warehouse",
  PROJECT_PROGRESS_UPDATE: "/projects/:id/progress",
  PROJECT_FINANCIAL_SUMMARY: "/projects/:id/financial-summary",

  INVOICE_LIST: "/invoices",
  INVOICE_DETAIL: "/invoices/:id",
  INVOICE_CREATE: "/invoices/create",
  INVOICE_EDIT: "/invoices/:id/edit",

  PAYMENT_LIST: "/payments",
  PAYMENT_DETAIL: "/payments/:id",
  PAYMENT_RECORD: "/payments/record",
  PAYMENT_RECORD_BY_INVOICE: "/payments/:id/record",
  PAYMENT_CONFIRMATION_LIST: "/payment-confirmation-requests",
  PAYMENT_CONFIRMATION_DETAIL: "/payment-confirmation-requests/:id",

  DEBT_LIST: "/debts",
  DEBT_DETAIL: "/debts/:customerId",

  INVENTORY_STATUS: "/inventory",
  INVENTORY_RECEIPT_CREATE: "/inventory/receipts/create",
  INVENTORY_ISSUE_CREATE: "/inventory/issues/create",
  INVENTORY_ADJUSTMENT_CREATE: "/inventory/adjustments/create",
  INVENTORY_HISTORY: "/inventory/history",

  REPORT_DASHBOARD: "/reports/dashboard",
  REPORT_SALES: "/reports/sales",
  REPORT_INVENTORY: "/reports/inventory",
  REPORT_PROJECT: "/reports/project",
  REPORT_FINANCIAL: "/reports/financial",
  REPORT_EXPORT: "/reports/export",
} as const;
