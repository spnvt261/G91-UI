export const API = {
  AUTH: {
    REGISTER: "/api/auth/register",
    VERIFY_REGISTRATION: "/api/auth/verify-registration",
    RESEND_VERIFICATION_CODE: "/api/auth/resend-verification-code",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    CHANGE_PASSWORD: "/api/auth/change-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },

  USER: {
    ME: "/api/users/me",
  },

  ACCOUNTS: {
    CREATE: "/api/accounts",
    LIST: "/api/accounts",
    DETAIL: "/api/accounts/{id}",
    UPDATE: "/api/accounts/{id}",
    DEACTIVATE: "/api/accounts/{id}/deactivate",
  },

  ROLES: {
    LIST: "/api/roles",
  },

  PRODUCTS: {
    LIST: "/api/products",
    CREATE: "/api/products",
    DETAIL: "/api/products/{id}",
    UPDATE: "/api/products/{id}",
    STATUS: "/api/products/{id}/status",
    DELETE: "/api/products/{id}",
  },

  PRICE_LISTS: {
    CREATE: "/api/price-lists",
    LIST: "/api/price-lists",
    DETAIL: "/api/price-lists/{id}",
    UPDATE: "/api/price-lists/{id}",
    DELETE: "/api/price-lists/{id}",
    ADD_ITEM: "/api/price-lists/{id}/items",
  },

  PRICE_LIST_ITEMS: {
    UPDATE: "/api/price-list-items/{id}",
    DELETE: "/api/price-list-items/{id}",
  },

  PROMOTIONS: {
    CREATE: "/api/promotions",
    LIST: "/api/promotions",
    DETAIL: "/api/promotions/{id}",
    UPDATE: "/api/promotions/{id}",
    DELETE: "/api/promotions/{id}",
  },

  CUSTOMER: {
    QUOTATION_FORM_INIT: "/api/customer/quotation-form-init",
    QUOTATIONS: "/api/customer/quotations",
    QUOTATION_SUMMARY: "/api/customer/quotations/summary",

    // Legacy customer management routes kept for compatibility with existing screens.
    CREATE: "/api/customers",
    LIST: "/api/customers",
    DETAIL: "/api/customers/{id}",
    UPDATE: "/api/customers/{id}",
    DISABLE: "/api/customers/{id}/disable",
    SUMMARY: "/api/customers/{id}/summary",
  },

  QUOTATIONS: {
    LIST: "/api/quotations",
    PREVIEW: "/api/quotations/preview",
    CREATE: "/api/quotations",
    DRAFT: "/api/quotations/draft",
    SUBMIT: "/api/quotations/submit",
    DETAIL: "/api/quotations/{id}",
    UPDATE: "/api/quotations/{id}",
    PREVIEW_BY_ID: "/api/quotations/{id}/preview",
    SUBMIT_BY_ID: "/api/quotations/{id}/submit",
    HISTORY: "/api/quotations/{id}/history",
  },

  CONTRACTS: {
    FORM_INIT: "/api/contracts/form-init",
    PREVIEW: "/api/contracts/preview",
    FROM_QUOTATION: "/api/contracts/from-quotation/{id}",

    // Legacy contract routes kept for compatibility with existing screens.
    CREATE: "/api/contracts",
    UPDATE: "/api/contracts/{id}",
    LIST: "/api/contracts",
    APPROVAL_REVIEW: "/api/contracts/{id}/approval-review",
    DETAIL: "/api/contracts/{id}",
    CANCEL: "/api/contracts/{id}/cancel",
    APPROVE: "/api/contracts/{id}/approve",
    SUBMIT: "/api/contracts/{id}/submit",
    TRACK: "/api/contracts/{id}/tracking",
    DOCUMENTS: "/api/contracts/{id}/documents",
    DOCUMENTS_GENERATE: "/api/contracts/{id}/documents/generate",
    DOCUMENT_EXPORT: "/api/contracts/{id}/documents/{documentId}/export",
    DOCUMENT_EMAIL: "/api/contracts/{id}/documents/{documentId}/email",
    REJECT: "/api/contracts/{id}/reject",
    REQUEST_MODIFICATION: "/api/contracts/{id}/request-modification",
    APPROVALS_PENDING: "/api/contracts/approvals/pending",
  },

  PROJECT: {
    CREATE: "/api/projects",
    LIST: "/api/projects",
    DETAIL: "/api/projects/{id}",
    UPDATE: "/api/projects/{id}",
    ASSIGN_WAREHOUSE: "/api/projects/{id}/warehouses",
    ADD_PROGRESS: "/api/projects/{id}/progress",
    UPDATE_PROGRESS: "/api/projects/{id}/progress/{progressUpdateId}",
  },

  PAYMENT: {
    INVOICE_LIST: "/api/invoices",
    INVOICE_DETAIL: "/api/invoices/{id}",
    RECORD_PAYMENT: "/api/invoices/{id}/payments",
    DEBT_STATUS: "/api/debts",
  },

  REPORT: {
    SALES: "/api/reports/sales",
    INVENTORY: "/api/reports/inventory",
    PROJECT: "/api/reports/projects",
    DASHBOARD: "/api/reports/dashboard",
  },

  INVENTORY: {
    RECEIPTS_CREATE: "/api/inventory/receipts",
    ISSUES_CREATE: "/api/inventory/issues",
    ADJUSTMENTS_CREATE: "/api/inventory/adjustments",
    STATUS: "/api/inventory/status",
    HISTORY: "/api/inventory/history",
  },

  // Backward-compatible aliases.
  ACCOUNT: {
    CREATE: "/api/accounts",
    LIST: "/api/accounts",
    DETAIL: "/api/accounts/{id}",
    UPDATE: "/api/accounts/{id}",
    DEACTIVATE: "/api/accounts/{id}/deactivate",
  },

  PRODUCT: {
    LIST: "/api/products",
    CREATE: "/api/products",
    DETAIL: "/api/products/{id}",
    UPDATE: "/api/products/{id}",
    STATUS: "/api/products/{id}/status",
    DELETE: "/api/products/{id}",
  },

  PRICING: {
    PRICE_LIST_CREATE: "/api/price-lists",
    PRICE_LIST_LIST: "/api/price-lists",
    PRICE_LIST_DETAIL: "/api/price-lists/{id}",
    PRICE_LIST_UPDATE: "/api/price-lists/{id}",
    PRICE_LIST_DELETE: "/api/price-lists/{id}",
    PRICE_LIST_ADD_ITEM: "/api/price-lists/{id}/items",
    PRICE_LIST_ITEM_UPDATE: "/api/price-list-items/{id}",
    PRICE_LIST_ITEM_DELETE: "/api/price-list-items/{id}",
  },

  PROMOTION: {
    CREATE: "/api/promotions",
    LIST: "/api/promotions",
    DETAIL: "/api/promotions/{id}",
    UPDATE: "/api/promotions/{id}",
    DELETE: "/api/promotions/{id}",
  },

  QUOTATION: {
    CREATE: "/api/quotations",
    LIST: "/api/customer/quotations",
    DETAIL: "/api/quotations/{id}",
    UPDATE: "/api/quotations/{id}",
    SUBMIT: "/api/quotations/{id}/submit",
  },

  CONTRACT: {
    CREATE: "/api/contracts",
    UPDATE: "/api/contracts/{id}",
    LIST: "/api/contracts",
    DETAIL: "/api/contracts/{id}",
    APPROVE: "/api/contracts/{id}/approve",
    SUBMIT: "/api/contracts/{id}/submit",
    TRACK: "/api/contracts/{id}/tracking",
    REJECT: "/api/contracts/{id}/reject",
  },
} as const;

export const withId = (path: string, id: string): string => path.replace("{id}", id);

export const withPathParams = (path: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((result, [key, value]) => result.replace(`{${key}}`, value), path);
