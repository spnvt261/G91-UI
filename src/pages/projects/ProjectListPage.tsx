import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import FilterSearchModalBar, { type FilterModalGroup } from "../../components/table/FilterSearchModalBar";
import Pagination from "../../components/table/Pagination";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
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
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await projectService.getList({ keyword, status: status[0] as ProjectModel["status"] | undefined });
        setAllItems(result);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load projects"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);
  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { label: "NEW", value: "NEW" },
        { label: "IN_PROGRESS", value: "IN_PROGRESS" },
        { label: "ON_HOLD", value: "ON_HOLD" },
        { label: "DONE", value: "DONE" },
      ],
      value: status,
    },
  ];

  const columns = useMemo<DataTableColumn<ProjectModel>[]>(
    () => [
      { key: "id", header: "ID", className: "font-semibold text-blue-900" },
      { key: "code", header: "Mã dự án" },
      { key: "name", header: "Tên dự án" },
      { key: "customerId", header: "Khách hàng" },
      { key: "status", header: "Trạng thái" },
      { key: "progress", header: "Tiến độ" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản lý dự án"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={<CustomButton label="Tạo dự án" onClick={() => navigate(ROUTE_URL.PROJECT_CREATE)} />}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Dự án" }]} />}
        />
      }
      body={
        <BaseCard>
          <FilterSearchModalBar
            searchValue={keyword}
            onSearchChange={(value) => {
              setKeyword(value);
              setPage(1);
            }}
            onSearchReset={() => {
              setKeyword("");
              setPage(1);
            }}
            searchPlaceholder="Tìm dự án"
            filters={filters}
            onApplyFilters={(values) => {
              setStatus(Array.isArray(values.status) ? (values.status as ProjectModel["status"][]) : []);
              setPage(1);
            }}
          />
          {loading ? <p className="mb-3 text-sm text-slate-500">Đang tải danh sách dự án...</p> : null}
          <DataTable
            columns={columns}
            data={pagedItems}
            actions={(row) => (
              <CustomButton
                label="Xem"
                className="px-2 py-1 text-sm"
                onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", row.id))}
              />
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default ProjectListPage;
