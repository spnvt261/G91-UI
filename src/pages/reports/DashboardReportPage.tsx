import { useEffect, useMemo, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const DashboardReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dashboard = await reportService.getDashboard();
        setTotalRevenue(dashboard.summary.totalRevenue ?? 0);
        setTotalContracts(dashboard.summary.totalContracts ?? 0);
        setTotalOrders(dashboard.summary.totalOrders ?? 0);
        setTotalDebt(dashboard.summary.totalDebt ?? 0);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể load dashboard report"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const stats = useMemo(
    () => [
      { title: "Total Revenue", value: toCurrency(totalRevenue), trend: "From report service" },
      { title: "Total Contracts", value: String(totalContracts), trend: "Active contracts" },
      { title: "Total Orders", value: String(totalOrders), trend: "Processed orders" },
      { title: "Total Debt", value: toCurrency(totalDebt), trend: "Outstanding debt" },
    ],
    [totalContracts, totalDebt, totalOrders, totalRevenue],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải báo cáo tổng quan..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Dashboard Report"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Báo cáo", url: ROUTE_URL.REPORT_DASHBOARD },
                { label: "Dashboard" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          <StatsGrid items={stats} />
          <BaseCard>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Revenue Trend" subtitle="Sales performance by period" />
              <ChartCard title="Risk Monitoring" subtitle="Debt and inventory alert tracking" />
            </div>
          </BaseCard>
        </div>
      }
    />
  );
};

export default DashboardReportPage;


