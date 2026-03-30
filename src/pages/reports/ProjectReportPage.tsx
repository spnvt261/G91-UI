import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable from "../../components/table/DataTable";
import TableFilterBar from "../../components/table/TableFilterBar";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { hasPermission } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { reportService } from "../../services/report/report.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const ProjectReportPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canViewFinancialSummary = hasPermission(role, "project.financial-summary.view");

  const [rows, setRows] = useState<{ projectId: string; projectName: string; progress: number; status: string }[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const projects = await reportService.getProjectReport();
        setRows(projects);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể load project report"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const filteredRows = useMemo(() => {
    const normalized = keyword.toLowerCase();
    return rows.filter((item) => item.projectName.toLowerCase().includes(normalized) || item.projectId.toLowerCase().includes(normalized));
  }, [keyword, rows]);

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải báo cáo dự án..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Project Report"
          actions={
            canViewFinancialSummary ? <CustomButton label="Project Financial Summary" onClick={() => navigate(ROUTE_URL.REPORT_FINANCIAL)} /> : undefined
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Home" },
                { label: "Reports", url: ROUTE_URL.REPORT_PROJECT },
                { label: "Project" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
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
      }
    />
  );
};

export default ProjectReportPage;


