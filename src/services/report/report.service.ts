import api from "../../apiConfig/axiosConfig";
import { API } from "../../api/URL_const";
import type {
  DashboardReport,
  InventoryReportItem,
  ProjectReportItem,
  ReportFilter,
  SalesReportItem,
} from "../../models/report/report.model";
import { extractList } from "../service.utils";

export const reportService = {
  async getSalesReport(params?: ReportFilter): Promise<SalesReportItem[]> {
    const response = await api.get<unknown>(API.REPORT.SALES, { params });
    return extractList<SalesReportItem>(response.data);
  },

  async getInventoryReport(params?: ReportFilter): Promise<InventoryReportItem[]> {
    const response = await api.get<unknown>(API.REPORT.INVENTORY, { params });
    return extractList<InventoryReportItem>(response.data);
  },

  async getProjectReport(params?: ReportFilter): Promise<ProjectReportItem[]> {
    const response = await api.get<unknown>(API.REPORT.PROJECT, { params });
    return extractList<ProjectReportItem>(response.data);
  },

  async getDashboard(params?: ReportFilter): Promise<DashboardReport> {
    const response = await api.get<DashboardReport>(API.REPORT.DASHBOARD, { params });
    return response.data;
  },
};
