import type { PaginationMeta } from "../common/api.model";

export type ProjectStatus = "NEW" | "IN_PROGRESS" | "ON_HOLD" | "DONE" | string;

export interface ProjectModel {
  id: string;
  code?: string;
  projectCode?: string;
  name: string;
  customerId: string;
  customerName?: string;
  warehouseId?: string;
  primaryWarehouseId?: string;
  backupWarehouseId?: string;
  progress?: number;
  progressPercent?: number;
  progressStatus?: string;
  status: ProjectStatus;
  startedAt?: string;
  endedAt?: string;
  startDate?: string;
  endDate?: string;
  assignedProjectManager?: string;
  location?: string;
  scope?: string;
  budget?: number;
  linkedContractId?: string;
  linkedOrderReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectListQuery {
  page?: number;
  pageSize?: number;
  size?: number;
  keyword?: string;
  projectCode?: string;
  projectName?: string;
  customerId?: string;
  status?: ProjectStatus;
  progressStatus?: string;
  warehouseId?: string;
  assignedManager?: string;
  archived?: boolean;
  createdFrom?: string;
  createdTo?: string;
  startFrom?: string;
  startTo?: string;
  endFrom?: string;
  endTo?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface ProjectMilestoneRequest {
  name: string;
  milestoneType: string;
  completionPercent: number;
  amount: number;
  dueDate: string;
  notes?: string;
}

export interface ProjectCreateRequest {
  customerId: string;
  name: string;
  location?: string;
  scope?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  assignedProjectManager?: string;
  primaryWarehouseId?: string;
  backupWarehouseId?: string;
  linkedContractId?: string;
  linkedOrderReference?: string;
  status?: string;
  paymentMilestones?: ProjectMilestoneRequest[];
  // Legacy aliases currently used by UI screens.
  code?: string;
  warehouseId?: string;
  progress?: number;
}

export interface ProjectUpdateRequest {
  name?: string;
  location?: string;
  scope?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  assignedProjectManager?: string;
  primaryWarehouseId?: string;
  backupWarehouseId?: string;
  linkedContractId?: string;
  linkedOrderReference?: string;
  status?: string;
  actualSpend?: number;
  commitments?: number;
  paymentsReceived?: number;
  paymentsDue?: number;
  outstandingBalance?: number;
  openOrderCount?: number;
  unresolvedIssueCount?: number;
  customerSignoffCompleted?: boolean;
  paymentMilestones?: ProjectMilestoneRequest[];
  changeReason?: string;
  // Legacy aliases currently used by UI screens.
  code?: string;
  customerId?: string;
  warehouseId?: string;
  progress?: number;
}

export interface AssignWarehouseRequest {
  primaryWarehouseId?: string;
  backupWarehouseId?: string;
  assignmentReason?: string;
  // Legacy alias currently used by UI screens.
  warehouseId?: string;
}

export interface UpdateProjectProgressRequest {
  progressPercent?: number;
  progressStatus?: string;
  phase?: string;
  notes?: string;
  changeReason?: string;
  evidenceDocuments?: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
    contentType?: string;
  }>;
  // Legacy aliases currently used by UI screens.
  progress?: number;
  note?: string;
}

export interface ProjectListResponseData {
  items: ProjectModel[];
  pagination: PaginationMeta;
  filters?: Record<string, unknown>;
}

export interface ProjectDetailResponseData {
  project: ProjectModel;
}

export interface ProjectFinancialBreakdownItem {
  category: string;
  amount?: number;
}

export interface ProjectFinancialSummaryModel {
  budget?: number;
  actualSpend?: number;
  commitments?: number;
  variance?: number;
  breakdownByCategory?: ProjectFinancialBreakdownItem[];
  paymentsReceived?: number;
  paymentsDue?: number;
  outstandingBalance?: number;
  profitabilityAmount?: number;
  profitabilityMargin?: number;
  aggregationMode?: string;
}

export interface ProjectProgressResponse {
  id: string;
  projectId: string;
  progressPercent: number;
  progressStatus?: string;
  phase?: string;
  notes?: string;
  changeReason?: string;
  createdAt?: string;
}
