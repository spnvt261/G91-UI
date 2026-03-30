import { useEffect, useMemo, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable from "../../components/table/DataTable";
import TableFilterBar from "../../components/table/TableFilterBar";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const FinancialReportPage = () => {
  const [projectRows, setProjectRows] = useState<{ projectId: string; projectName: string; progress: number; status: string }[]>([]);
  const [summaryRevenue, setSummaryRevenue] = useState(0);
  const [summaryDebt, setSummaryDebt] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projects, dashboard] = await Promise.all([reportService.getProjectReport(), reportService.getDashboard()]);
        setProjectRows(projects);
        setSummaryRevenue(dashboard.summary.totalRevenue ?? 0);
        setSummaryDebt(dashboard.summary.totalDebt ?? 0);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể load financial report"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const filteredRows = useMemo(() => {
    return projectRows.filter((item) => item.projectName.toLowerCase().includes(keyword.toLowerCase()) || item.projectId.toLowerCase().includes(keyword.toLowerCase()));
  }, [keyword, projectRows]);

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải báo cáo tài chính..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Financial Report"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "Báo cáo", url: ROUTE_URL.REPORT_PROJECT },
                { label: "Tài chính" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          <BaseCard title="T?ng quan tài chính">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">T?ng doanh thu</p>
                <p className="text-2xl font-semibold text-blue-900">{toCurrency(summaryRevenue)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">T?ng công n?</p>
                <p className="text-2xl font-semibold text-red-500">{toCurrency(summaryDebt)}</p>
              </div>
            </div>
          </BaseCard>
          <BaseCard title="Project Financial Status">
            <TableFilterBar searchValue={keyword} onSearchChange={setKeyword} />
            <DataTable
              columns={[
                { key: "projectId", header: "Project ID" },
                { key: "projectName", header: "Project Name" },
                { key: "progress", header: "Progress" },
                { key: "status", header: "Status" },
              ]}
              data={filteredRows}
            />
          </BaseCard>
        </div>
      }
    />
  );
};

export default FinancialReportPage;



