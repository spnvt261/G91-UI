import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<ProjectModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await projectService.getList({ keyword, status: status[0] as ProjectModel["status"] | undefined });
        setAllItems(result);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load projects"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, status]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);

  const columns = useMemo<DataTableColumn<ProjectModel>[]>(
    () => [
      { key: "id", header: "ID", className: "font-semibold text-blue-900" },
      { key: "code", header: "Mã Dự Án" },
      { key: "name", header: "Tên Dự Án" },
      { key: "customerId", header: "Khách Hàng" },
      { key: "status", header: "Trạng Thái" },
      { key: "progress", header: "Tiến Độ" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Quản Lý Dự Án" rightActions={<CustomButton label="Tạo Dự Án" onClick={() => navigate(ROUTE_URL.PROJECT_CREATE)} />} />
      <BaseCard>
        <TableFilterBar
          searchValue={keyword}
          onSearchChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          filters={[
            {
              key: "status",
              placeholder: "Trạng Thái",
              options: [
                { label: "NEW", value: "NEW" },
                { label: "IN_PROGRESS", value: "IN_PROGRESS" },
                { label: "ON_HOLD", value: "ON_HOLD" },
                { label: "DONE", value: "DONE" },
              ],
              value: status,
              onChange: (values) => {
                setStatus(values);
                setPage(1);
              },
            },
          ]}
        />
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading projects...</p> : null}
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <DataTable
          columns={columns}
          data={pagedItems}
          actions={(row) => (
            <CustomButton label="Xem" className="px-2 py-1 text-sm" onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", row.id))} />
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
      </BaseCard>
    </div>
  );
};

export default ProjectListPage;
