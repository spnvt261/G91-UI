import api from "../../apiConfig/axiosConfig";
import { API } from "../../api/URL_const";
import type { DashboardQuery, DashboardResponseData } from "../../models/dashboard/dashboard.model";

export const dashboardService = {
  async getDashboard(params?: DashboardQuery): Promise<DashboardResponseData> {
    const response = await api.get<DashboardResponseData>(API.DASHBOARD, { params });
    return response.data;
  },
};
