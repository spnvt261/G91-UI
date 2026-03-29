import { Breadcrumb, Button, Card, Descriptions, Empty, Modal, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const getStatusColor = (status?: string) => {
  const normalized = (status ?? "").toUpperCase();
  if (["ACTIVE", "IN_PROGRESS"].includes(normalized)) {
    return "processing";
  }
  if (["COMPLETED", "DONE", "CLOSED"].includes(normalized)) {
    return "success";
  }
  if (["ON_HOLD"].includes(normalized)) {
    return "warning";
  }
  if (["CANCELLED", "ARCHIVED"].includes(normalized)) {
    return "default";
  }
  return "blue";
};

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

  const isBusy = actionLoading || deleting;

  const progressDisplay = useMemo(() => {
    const rawValue = Number(project?.progress ?? project?.progressPercent ?? 0);
    if (Number.isNaN(rawValue)) {
      return "0%";
    }
    return `${Math.max(0, Math.min(100, rawValue))}%`;
  }, [project]);

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
      } catch (error) {
        notify(getErrorMessage(error, "Không thể tải chi tiết dự án"), "error");
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
      await projectService.close(id, "Đóng từ màn hình chi tiết dự án");
      await loadProjectDetail(id);
      notify("Đóng dự án thành công.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể đóng dự án"), "error");
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
      await projectService.confirmMilestone(id, "Xác nhận mốc từ màn hình chi tiết dự án");
      await loadProjectDetail(id);
      notify("Xác nhận mốc dự án thành công.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xác nhận mốc dự án"), "error");
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
      await projectService.softDelete(id, "Lưu trữ từ màn hình chi tiết dự án");
      notify("Dự án đã được lưu trữ (soft delete).", "success");
      setShowDeleteModal(false);
      navigate(ROUTE_URL.PROJECT_LIST);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể lưu trữ dự án"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Breadcrumb
          items={[
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
            { title: "Chi tiết" },
          ]}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Chi tiết dự án
          </Typography.Title>

          <Space wrap>
            {canUpdateProject ? (
              <Button
                type="primary"
                onClick={() => navigate(ROUTE_URL.PROJECT_EDIT.replace(":id", id ?? ""))}
                disabled={!project || isBusy}
              >
                Cập nhật
              </Button>
            ) : null}

            {canAssignWarehouse ? (
              <Button onClick={() => navigate(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE.replace(":id", id ?? ""))} disabled={!project || isBusy}>
                Gán kho
              </Button>
            ) : null}

            {canUpdateProgress ? (
              <Button onClick={() => navigate(ROUTE_URL.PROJECT_PROGRESS_UPDATE.replace(":id", id ?? ""))} disabled={!project || isBusy}>
                Cập nhật tiến độ
              </Button>
            ) : null}

            {canCloseProject ? (
              <Button onClick={handleCloseProject} loading={actionLoading} disabled={!project || isBusy}>
                Đóng dự án
              </Button>
            ) : null}

            {canConfirmMilestone ? (
              <Button onClick={handleConfirmMilestone} loading={actionLoading} disabled={!project || isBusy}>
                Xác nhận mốc
              </Button>
            ) : null}

            {canDeleteProject ? (
              <Button danger onClick={() => setShowDeleteModal(true)} disabled={!project || isBusy}>
                Xóa mềm
              </Button>
            ) : null}

            <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={isBusy}>
              Quay lại
            </Button>
          </Space>
        </div>

        <Card>
          <Spin spinning={loading} tip="Đang tải thông tin dự án...">
            {project ? (
              <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="middle">
                <Descriptions.Item label="ID">{project.id}</Descriptions.Item>
                <Descriptions.Item label="Mã dự án">{project.code ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="Tên dự án">{project.name}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{project.customerName ?? project.customerId}</Descriptions.Item>
                <Descriptions.Item label="Kho chính">{project.warehouseId ?? project.primaryWarehouseId ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(project.status)}>{project.status ?? "-"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tiến độ">{progressDisplay}</Descriptions.Item>
                <Descriptions.Item label="Người quản lý">{project.assignedProjectManager ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">{project.startDate ?? project.startedAt ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc">{project.endDate ?? project.endedAt ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="Địa điểm">{project.location ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="Phạm vi">{project.scope ?? "-"}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Không có dữ liệu dự án." />
            )}
          </Spin>
        </Card>
      </Space>

      <Modal
        title="Xóa mềm dự án"
        open={showDeleteModal}
        onCancel={() => (deleting ? undefined : setShowDeleteModal(false))}
        closable={!deleting}
        maskClosable={!deleting}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" danger loading={deleting} onClick={handleDeleteProject}>
            Xác nhận xóa mềm
          </Button>,
        ]}
      >
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Dự án sẽ được chuyển sang trạng thái lưu trữ. Hệ thống hiện chưa có endpoint xóa vật lý dự án.
        </Typography.Paragraph>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
