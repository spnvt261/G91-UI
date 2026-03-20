import { useEffect, useMemo, useState } from "react";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { useNotify } from "../../context/notifyContext";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();
  const [totalSales, setTotalSales] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [pendingQuotations, setPendingQuotations] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dashboard = await reportService.getDashboard();
        setTotalSales(dashboard.summary.totalRevenue ?? 0);
        setTotalContracts(dashboard.summary.totalContracts ?? 0);
        setPendingQuotations(dashboard.openProjectCount ?? 0);
        setInventoryValue((dashboard.inventoryAlertCount ?? 0) * 1000000);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load dashboard report"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

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
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Dashboard"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Dashboard" }]} />}
        />
      }
      body={
        <div className="space-y-6">
          {loading ? <p className="text-sm text-slate-500">Loading dashboard...</p> : null}
          <StatsGrid items={stats} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Sales Trend" subtitle="Monthly sales overview" />
            <ChartCard title="Contract Pipeline" subtitle="Pending and approved contracts" />
          </div>
        </div>
      }
    />
  );
};

export default DashboardPage;
