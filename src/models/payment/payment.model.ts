export interface InvoiceModel {
  id: string;
  contractId: string;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string;
  status: "UNPAID" | "PARTIAL" | "PAID";
}

export interface DebtModel {
  customerId: string;
  customerName?: string;
  totalDebt: number;
  overdueDebt?: number;
}

export interface PaymentRecordRequest {
  amount: number;
  paidAt: string;
  method?: string;
  note?: string;
}

export interface InvoiceListQuery {
  page?: number;
  size?: number;
  status?: "UNPAID" | "PARTIAL" | "PAID";
  keyword?: string;
}

export interface DebtListQuery {
  page?: number;
  size?: number;
  keyword?: string;
}
