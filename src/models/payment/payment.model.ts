export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "OTHER" | string;

export interface OpenInvoiceModel {
  invoiceId: string;
  invoiceNumber?: string;
  contractId?: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueDays?: number;
  status?: string;
}

export interface PaymentAllocationRequest {
  invoiceId: string;
  allocatedAmount: number;
}

export interface PaymentCreateRequest {
  customerId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  note?: string;
  allocations: PaymentAllocationRequest[];
}

export interface PaymentAllocationModel {
  invoiceId: string;
  invoiceNumber?: string;
  allocatedAmount: number;
  invoiceTotal?: number;
  invoicePaidAmount?: number;
  invoiceOutstandingAmount?: number;
}

export interface PaymentModel {
  id: string;
  receiptNumber?: string;
  customerId?: string;
  customerCode?: string;
  customerName?: string;
  paymentDate?: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  referenceNo?: string;
  note?: string;
  allocations: PaymentAllocationModel[];
}
