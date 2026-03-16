import { useEffect, useMemo, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import PageHeader from "../../components/layout/PageHeader";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const DashboardReportPage = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        const dashboard = await reportService.getDashboard();
        setTotalRevenue(dashboard.summary.totalRevenue ?? 0);
        setTotalContracts(dashboard.summary.totalContracts ?? 0);
        setTotalOrders(dashboard.summary.totalOrders ?? 0);
        setTotalDebt(dashboard.summary.totalDebt ?? 0);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load dashboard report"), "error");
      }
    };

    void load();
  }, []);

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
    <div className="space-y-4">
      <PageHeader title="Dashboard Report" />
      <StatsGrid items={stats} />
      <BaseCard>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Revenue Trend" subtitle="Sales performance by period" />
          <ChartCard title="Risk Monitoring" subtitle="Debt and inventory alert tracking" />
        </div>
      </BaseCard>
    </div>
  );
};

export default DashboardReportPage;
