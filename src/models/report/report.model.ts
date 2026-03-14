export interface ReportFilter {
  fromDate?: string;
  toDate?: string;
  warehouseId?: string;
  customerId?: string;
}

export interface ReportSummaryModel {
  totalRevenue?: number;
  totalContracts?: number;
  totalOrders?: number;
  totalDebt?: number;
}

export interface SalesReportItem {
  period: string;
  revenue: number;
}

export interface InventoryReportItem {
  productId: string;
  productCode: string;
  productName: string;
  availableQty: number;
  reservedQty?: number;
}

export interface ProjectReportItem {
  projectId: string;
  projectName: string;
  progress: number;
  status: string;
}

export interface DashboardReport {
  summary: ReportSummaryModel;
  salesTrend?: SalesReportItem[];
  inventoryAlertCount?: number;
  openProjectCount?: number;
}
