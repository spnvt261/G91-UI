export interface DashboardQuery {
  limit?: number;
}

export interface DashboardSummary {
  pendingApprovalCount: number;
  pendingPaymentConfirmationCount: number;
  overdueInvoiceCount: number;
  overdueAmount: number;
  warehouseActionCount: number;
  milestoneConfirmationCount: number;
}

export interface PendingApprovalItem {
  approvalId?: string | null;
  contractId?: string | null;
  contractNumber?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  totalAmount?: number | null;
  approvalType?: string | null;
  approvalTier?: string | null;
  pendingAction?: string | null;
  requestedBy?: string | null;
  requestedAt?: string | null;
  dueAt?: string | null;
  status?: string | null;
}

export interface PaymentConfirmationItem {
  requestId?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  customerId?: string | null;
  customerCode?: string | null;
  customerName?: string | null;
  requestedAmount?: number | null;
  transferTime?: string | null;
  senderBankName?: string | null;
  referenceCode?: string | null;
  status?: string | null;
  createdAt?: string | null;
}

export interface OverdueInvoiceItem {
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  contractId?: string | null;
  contractNumber?: string | null;
  customerId?: string | null;
  customerCode?: string | null;
  customerName?: string | null;
  dueDate?: string | null;
  overdueDays?: number | null;
  grandTotal?: number | null;
  paidAmount?: number | null;
  outstandingAmount?: number | null;
  status?: string | null;
}

export interface WarehouseActionItem {
  contractId?: string | null;
  saleOrderNumber?: string | null;
  contractNumber?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  expectedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  status?: string | null;
  totalAmount?: number | null;
  submittedAt?: string | null;
}

export interface MilestoneConfirmationItem {
  milestoneId?: string | null;
  projectId?: string | null;
  projectCode?: string | null;
  projectName?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  milestoneName?: string | null;
  completionPercent?: number | null;
  amount?: number | null;
  dueDate?: string | null;
  confirmationDeadline?: string | null;
  status?: string | null;
  confirmationStatus?: string | null;
}

export interface DashboardResponseData {
  role: string;
  generatedAt: string;
  summary: DashboardSummary;
  pendingApprovals: PendingApprovalItem[];
  pendingPaymentConfirmations: PaymentConfirmationItem[];
  overdueInvoices: OverdueInvoiceItem[];
  warehouseActions: WarehouseActionItem[];
  milestoneConfirmations: MilestoneConfirmationItem[];
}
