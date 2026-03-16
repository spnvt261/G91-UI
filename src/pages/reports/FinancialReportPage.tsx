import { useEffect, useMemo, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import TableFilterBar from "../../components/table/TableFilterBar";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const FinancialReportPage = () => {
  const [projectRows, setProjectRows] = useState<{ projectId: string; projectName: string; progress: number; status: string }[]>([]);
  const [summaryRevenue, setSummaryRevenue] = useState(0);
  const [summaryDebt, setSummaryDebt] = useState(0);
  const [keyword, setKeyword] = useState("");
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, dashboard] = await Promise.all([reportService.getProjectReport(), reportService.getDashboard()]);
        setProjectRows(projects);
        setSummaryRevenue(dashboard.summary.totalRevenue ?? 0);
        setSummaryDebt(dashboard.summary.totalDebt ?? 0);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load financial report"), "error");
      }
    };

    void load();
  }, []);

  const filteredRows = useMemo(() => {
    return projectRows.filter((item) => item.projectName.toLowerCase().includes(keyword.toLowerCase()) || item.projectId.toLowerCase().includes(keyword.toLowerCase()));
  }, [keyword, projectRows]);

  return (
    <div className="space-y-4">
      <PageHeader title="Financial Report" />
      <BaseCard title="Tổng Quán Tài Chínác">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Tổng doanh thu</p>
            <p className="text-2xl font-semibold text-blue-900">{toCurrency(summaryRevenue)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Tổng còng nợ</p>
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
  );
};

export default FinancialReportPage;
