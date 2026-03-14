import api from "../../apiConfig/axiosConfig";
import { API } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  DashboardReport,
  InventoryReportItem,
  ProjectReportItem,
  ReportFilter,
  SalesReportItem,
} from "../../models/report/report.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const reportService = {
  async getSalesReport(params?: ReportFilter): Promise<SalesReportItem[]> {
    const response = await api.get<ApiResponse<SalesReportItem[]>>(API.REPORT.SALES, { params });
    return unwrap(response);
  },

  async getInventoryReport(params?: ReportFilter): Promise<InventoryReportItem[]> {
    const response = await api.get<ApiResponse<InventoryReportItem[]>>(API.REPORT.INVENTORY, { params });
    return unwrap(response);
  },

  async getProjectReport(params?: ReportFilter): Promise<ProjectReportItem[]> {
    const response = await api.get<ApiResponse<ProjectReportItem[]>>(API.REPORT.PROJECT, { params });
    return unwrap(response);
  },

  async getDashboard(params?: ReportFilter): Promise<DashboardReport> {
    const response = await api.get<ApiResponse<DashboardReport>>(API.REPORT.DASHBOARD, { params });
    return unwrap(response);
  },
};
