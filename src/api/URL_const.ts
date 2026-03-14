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
    LIST: "/api/quotations",
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

  CUSTOMER: {
    CREATE: "/api/customers",
    LIST: "/api/customers",
    DETAIL: "/api/customers/{id}",
    UPDATE: "/api/customers/{id}",
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
} as const;

export const withId = (path: string, id: string): string => path.replace("{id}", id);
