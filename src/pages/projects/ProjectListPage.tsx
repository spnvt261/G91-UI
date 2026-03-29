import { Modal } from "antd";
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
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const ProjectListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canCreateProject = canPerformAction(role, "project.create");
  const canDeleteProject = canPerformAction(role, "project.delete");

  const [allItems, setAllItems] = useState<ProjectModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ProjectModel | null>(null);
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
      label: "Status",
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
      { key: "code", header: "Project Code" },
      { key: "name", header: "Project Name" },
      { key: "customerId", header: "Customer" },
      { key: "status", header: "Status" },
      { key: "progress", header: "Progress" },
    ],
    [],
  );

  const handleDeleteProject = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await projectService.softDelete(deletingItem.id, "Archived from project list");
      setAllItems((previous) => previous.filter((item) => item.id !== deletingItem.id));
      notify("Project archived (soft delete).", "success");
      setDeletingItem(null);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot archive project"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Loading projects..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Project Management"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={canCreateProject ? <CustomButton label="Create Project" onClick={() => navigate(ROUTE_URL.PROJECT_CREATE)} /> : undefined}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Home" }, { label: "Projects" }]} />}
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
            searchPlaceholder="Search projects"
            filters={filters}
            onApplyFilters={(values) => {
              setStatus(Array.isArray(values.status) ? (values.status as ProjectModel["status"][]) : []);
              setPage(1);
            }}
          />
          <DataTable
            columns={columns}
            data={pagedItems}
            actions={(row) => (
              <div className="flex gap-2">
                <CustomButton
                  label="View"
                  className="px-2 py-1 text-sm"
                  onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", row.id))}
                />
                {canDeleteProject ? (
                  <CustomButton
                    label="Soft Delete"
                    className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                    onClick={() => setDeletingItem(row)}
                  />
                ) : null}
              </div>
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />

          <Modal
            title="Soft delete project"
            open={Boolean(deletingItem)}
            onCancel={() => (deleting ? undefined : setDeletingItem(null))}
            closable={!deleting}
            maskClosable={!deleting}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="Cancel"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => setDeletingItem(null)}
                  disabled={deleting}
                />
                <CustomButton
                  label={deleting ? "Processing..." : "Confirm"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteProject}
                  disabled={deleting}
                />
              </div>
            }
          >
            <p className="text-sm text-slate-600">
              This action archives the project using update status because backend hard-delete API is not available.
            </p>
            {deletingItem ? <p className="mt-2 text-sm font-semibold text-slate-800">{deletingItem.name}</p> : null}
          </Modal>
        </BaseCard>
      }
    />
  );
};

export default ProjectListPage;
