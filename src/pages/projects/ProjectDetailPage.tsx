import { Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();

  const canUpdateProject = canPerformAction(role, "project.update");
  const canAssignWarehouse = canPerformAction(role, "project.assign-warehouse");
  const canUpdateProgress = canPerformAction(role, "project.progress.update");
  const canDeleteProject = canPerformAction(role, "project.delete");
  const canCloseProject = canPerformAction(role, "project.close");
  const canConfirmMilestone = canPerformAction(role, "project.milestone.confirm");

  const [project, setProject] = useState<ProjectModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { notify } = useNotify();

  const loadProjectDetail = async (projectId: string) => {
    const detail = await projectService.getDetail(projectId);
    setProject(detail);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        await loadProjectDetail(id);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load project detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleCloseProject = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      await projectService.close(id, "Closed from project detail");
      await loadProjectDetail(id);
      notify("Ðóng d? án thành công.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot close project"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmMilestone = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      await projectService.confirmMilestone(id, "Milestone confirmed by customer");
      await loadProjectDetail(id);
      notify("Xác nh?n m?c d? án thành công.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot confirm project milestone"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) {
      return;
    }

    try {
      setDeleting(true);
      await projectService.softDelete(id, "Archived from project detail");
      notify("D? án dã du?c luu tr? (soft delete).", "success");
      setShowDeleteModal(false);
      navigate(ROUTE_URL.PROJECT_LIST);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot archive project"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Ðang t?i thông tin d? án..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi ti?t d? án"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex flex-wrap gap-2">
              {canUpdateProject ? (
                <CustomButton
                  label="C?p nh?t"
                  onClick={() => navigate(ROUTE_URL.PROJECT_EDIT.replace(":id", id ?? ""))}
                  disabled={!project || actionLoading || deleting}
                />
              ) : null}
              {canAssignWarehouse ? (
                <CustomButton
                  label="Gán kho"
                  onClick={() => navigate(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE.replace(":id", id ?? ""))}
                  disabled={!project || actionLoading || deleting}
                />
              ) : null}
              {canUpdateProgress ? (
                <CustomButton
                  label="C?p nh?t ti?n d?"
                  onClick={() => navigate(ROUTE_URL.PROJECT_PROGRESS_UPDATE.replace(":id", id ?? ""))}
                  disabled={!project || actionLoading || deleting}
                />
              ) : null}
              {canCloseProject ? (
                <CustomButton
                  label={actionLoading ? "Ðang dóng..." : "Ðóng d? án"}
                  onClick={handleCloseProject}
                  disabled={!project || actionLoading || deleting}
                />
              ) : null}
              {canConfirmMilestone ? (
                <CustomButton
                  label={actionLoading ? "Ðang xác nh?n..." : "Xác nh?n m?c"}
                  onClick={handleConfirmMilestone}
                  disabled={!project || actionLoading || deleting}
                />
              ) : null}
              {canDeleteProject ? (
                <CustomButton
                  label="Xóa m?m"
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={!project || actionLoading || deleting}
                />
              ) : null}
              <CustomButton
                label="Quay l?i"
                className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}
                disabled={actionLoading || deleting}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "D? án", url: ROUTE_URL.PROJECT_LIST },
                { label: "Chi ti?t" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          {project ? (
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold">ID:</span> {project.id}
              </p>
              <p>
                <span className="font-semibold">Mã d? án:</span> {project.code ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Tên d? án:</span> {project.name}
              </p>
              <p>
                <span className="font-semibold">Khách hàng:</span> {project.customerId}
              </p>
              <p>
                <span className="font-semibold">Kho:</span> {project.warehouseId ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Tr?ng thái:</span> {project.status}
              </p>
              <p>
                <span className="font-semibold">Ti?n d?:</span> {project.progress ?? 0}%
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Không có d? li?u d? án.</p>
          )}

          <Modal
            title="Xóa d? án"
            open={showDeleteModal}
            onCancel={() => (deleting ? undefined : setShowDeleteModal(false))}
            closable={!deleting}
            maskClosable={!deleting}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="H?y"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                />
                <CustomButton
                  label={deleting ? "Ðang x? lý..." : "Xác nh?n xóa m?m"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteProject}
                  disabled={deleting}
                />
              </div>
            }
          >
            <p className="text-sm text-slate-600">
              D? án s? du?c chuy?n sang tr?ng thái luu tr?. H? th?ng hi?n chua có endpoint xóa v?t lý d? án.
            </p>
          </Modal>
        </BaseCard>
      }
    />
  );
};

export default ProjectDetailPage;

