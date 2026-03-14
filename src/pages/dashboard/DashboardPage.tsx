import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import StatsGrid from "../../components/dashboard/StatsGrid";
import ChartCard from "../../components/dashboard/ChartCard";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [pendingQuotations, setPendingQuotations] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const dashboard = await reportService.getDashboard();
        setTotalSales(dashboard.summary.totalRevenue ?? 0);
        setTotalContracts(dashboard.summary.totalContracts ?? 0);
        setPendingQuotations(dashboard.openProjectCount ?? 0);
        setInventoryValue((dashboard.inventoryAlertCount ?? 0) * 1000000);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load dashboard report"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const stats = useMemo(
    () => [
      { title: "Total Sales", value: toCurrency(totalSales), trend: "Updated from report service" },
      { title: "Total Contracts", value: String(totalContracts), trend: "Contracts in system" },
      { title: "Pending Quotations", value: String(pendingQuotations), trend: "Waiting for processing" },
      { title: "Inventory Value", value: toCurrency(inventoryValue), trend: "Estimated inventory amount" },
    ],
    [inventoryValue, pendingQuotations, totalContracts, totalSales],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      {error ? <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading dashboard...</p> : null}
      <StatsGrid items={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Sales Trend" subtitle="Monthly sales overview" />
        <ChartCard title="Contract Pipeline" subtitle="Pending and approved contracts" />
      </div>
    </div>
  );
};

export default DashboardPage;
