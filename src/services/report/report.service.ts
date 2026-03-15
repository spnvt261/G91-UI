import api from "../../apiConfig/axiosConfig";
import { API } from "../../api/URL_const";
import type {
  DashboardReport,
  InventoryReportItem,
  ProjectReportItem,
  ReportFilter,
  SalesReportItem,
} from "../../models/report/report.model";

export const reportService = {
  async getSalesReport(params?: ReportFilter): Promise<SalesReportItem[]> {
    const response = await api.get<SalesReportItem[]>(API.REPORT.SALES, { params });
    return response.data;
  },

  async getInventoryReport(params?: ReportFilter): Promise<InventoryReportItem[]> {
    const response = await api.get<InventoryReportItem[]>(API.REPORT.INVENTORY, { params });
    return response.data;
  },

  async getProjectReport(params?: ReportFilter): Promise<ProjectReportItem[]> {
    const response = await api.get<ProjectReportItem[]>(API.REPORT.PROJECT, { params });
    return response.data;
  },

  async getDashboard(params?: ReportFilter): Promise<DashboardReport> {
    const response = await api.get<DashboardReport>(API.REPORT.DASHBOARD, { params });
    return response.data;
  },
};
