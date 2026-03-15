export const API = {
  AUTH: {
    REGISTER: "/api/auth/register",
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

  PRODUCTS: {
    LIST: "/api/products",
    CREATE: "/api/products",
    DETAIL: "/api/products/{id}",
    UPDATE: "/api/products/{id}",
    STATUS: "/api/products/{id}/status",
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

  CUSTOMER: {
    QUOTATION_FORM_INIT: "/api/customer/quotation-form-init",
    QUOTATIONS: "/api/customer/quotations",
    QUOTATION_SUMMARY: "/api/customer/quotations/summary",

    // Legacy customer management routes kept for compatibility with existing screens.
    CREATE: "/api/customers",
    LIST: "/api/customers",
    DETAIL: "/api/customers/{id}",
    UPDATE: "/api/customers/{id}",
  },

  QUOTATIONS: {
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
    FROM_QUOTATION: "/api/contracts/from-quotation/{id}",

    // Legacy contract routes kept for compatibility with existing screens.
    CREATE: "/api/contracts",
    UPDATE: "/api/contracts/{id}",
    LIST: "/api/contracts",
    DETAIL: "/api/contracts/{id}",
    APPROVE: "/api/contracts/{id}/approve",
    SUBMIT: "/api/contracts/{id}/submit",
    TRACK: "/api/contracts/{id}/track",
    REJECT: "/api/contracts/{id}/reject",
  },

  PROJECT: {
    CREATE: "/api/projects",
    LIST: "/api/projects",
    DETAIL: "/api/projects/{id}",
    UPDATE: "/api/projects/{id}",
    ASSIGN_WAREHOUSE: "/api/projects/{id}/assign-warehouse",
    UPDATE_PROGRESS: "/api/projects/{id}/progress",
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
    TRACK: "/api/contracts/{id}/track",
    REJECT: "/api/contracts/{id}/reject",
  },
} as const;

export const withId = (path: string, id: string): string => path.replace("{id}", id);
