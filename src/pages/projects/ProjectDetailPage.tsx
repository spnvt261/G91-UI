import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Empty,
  Modal,
  Row,
  Skeleton,
  Space,
  Statistic,
  Timeline,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import ProjectActionBar from "./components/ProjectActionBar";
import ProjectPageLayout from "./components/ProjectPageLayout";
import ProjectProgressBar from "./components/ProjectProgressBar";
import ProjectStatusTag from "./components/ProjectStatusTag";
import { buildProjectActionNavigation } from "./projectNavigation";
import { displayText, formatProjectDate, getProjectStatusLabel, resolveProjectProgress, resolveWarehouseDisplay } from "./projectPresentation";

type ProjectDetailShape = ProjectModel & {
  customerSignoffCompleted?: boolean;
};

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const role = getStoredUserRole();

  const canUpdateProject = canPerformAction(role, "project.update");
  const canAssignWarehouse = canPerformAction(role, "project.assign-warehouse");
  const canUpdateProgress = canPerformAction(role, "project.progress.update");
  const canViewFinancialSummary = canPerformAction(role, "project.financial-summary.view");
  const canDeleteProject = canPerformAction(role, "project.delete");
  const canCloseProject = canPerformAction(role, "project.close");
  const canConfirmMilestone = canPerformAction(role, "project.milestone.confirm");
  const { notify } = useNotify();

  const [project, setProject] = useState<ProjectDetailShape | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const progressPercent = resolveProjectProgress(project);
  const milestoneDone = Boolean(project?.customerSignoffCompleted);
  const primaryWarehouseLabel = resolveWarehouseDisplay(
    project?.primaryWarehouseName ?? project?.warehouseName,
    project?.primaryWarehouseId ?? project?.warehouseId,
  );
  const backupWarehouseLabel = resolveWarehouseDisplay(project?.backupWarehouseName, project?.backupWarehouseId);

  const loadProjectDetail = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setDetailError(null);
      const detail = await projectService.getDetail(id);
      setProject(detail as ProjectDetailShape);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải trung tâm dự án.");
      setDetailError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadProjectDetail();
  }, [loadProjectDetail]);

  const navigateToActionPage = useCallback((targetPath: string) => {
    if (!id) {
      return;
    }

    const navigation = buildProjectActionNavigation(targetPath.replace(":id", id), location);
    navigate(navigation.to, { state: navigation.state });
  }, [id, location, navigate]);

  const runAction = useCallback(async (task: () => Promise<void>, successMessage: string, errorFallback: string) => {
    try {
      setLoadingAction(true);
      await task();
      await loadProjectDetail();
      notify(successMessage, "success");
    } catch (error) {
      notify(getErrorMessage(error, errorFallback), "error");
    } finally {
      setLoadingAction(false);
    }
  }, [loadProjectDetail, notify]);

  const closeProject = useCallback(
    async () =>
      runAction(
      async () => {
        if (!id) {
          return;
        }
        await projectService.close(id, "Đóng từ trang chi tiết dự án");
      },
      "Đã đóng dự án thành công.",
      "Không thể đóng dự án.",
      ),
    [id, runAction],
  );

  const confirmMilestone = useCallback(
    async () =>
      runAction(
      async () => {
        if (!id) {
          return;
        }
        await projectService.confirmMilestone(id, "Xác nhận mốc từ trang chi tiết dự án");
      },
      "Đã xác nhận mốc dự án.",
      "Không thể xác nhận mốc dự án.",
      ),
    [id, runAction],
  );

  const archiveProject = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoadingAction(true);
      await projectService.softDelete(id, "Lưu trữ từ trang chi tiết dự án");
      notify("Đã lưu trữ dự án.", "success");
      navigate(ROUTE_URL.PROJECT_LIST);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể lưu trữ dự án."), "error");
    } finally {
      setLoadingAction(false);
    }
  }, [id, navigate, notify]);

  const requestCloseProject = useCallback(() => {
    void Modal.confirm({
      title: "Xác nhận đóng dự án",
      content: "Dự án sẽ chuyển sang trạng thái đã đóng. Bạn có chắc chắn muốn tiếp tục?",
      okText: "Đóng dự án",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => closeProject(),
    });
  }, [closeProject]);

  const requestConfirmMilestone = useCallback(() => {
    void Modal.confirm({
      title: "Xác nhận mốc nghiệm thu",
      content: "Sau khi xác nhận, hệ thống sẽ ghi nhận khách hàng đã nghiệm thu mốc hiện tại.",
      okText: "Xác nhận mốc",
      cancelText: "Hủy",
      onOk: () => confirmMilestone(),
    });
  }, [confirmMilestone]);

  const requestArchiveProject = useCallback(() => {
    void Modal.confirm({
      title: "Xác nhận lưu trữ dự án",
      content: "Dự án sẽ được chuyển sang trạng thái lưu trữ và không còn ở danh sách vận hành chính.",
      okText: "Lưu trữ",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => archiveProject(),
    });
  }, [archiveProject]);

  const secondaryActionItems = useMemo<NonNullable<MenuProps["items"]>>(() => {
    const items: NonNullable<MenuProps["items"]> = [];

    if (canUpdateProject) {
      items.push({
        key: "edit",
        label: "Cập nhật thông tin dự án",
        onClick: () => navigateToActionPage(ROUTE_URL.PROJECT_EDIT),
      });
    }

    if (canAssignWarehouse) {
      items.push({
        key: "assign-warehouse",
        label: "Gán kho triển khai",
        onClick: () => navigateToActionPage(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE),
      });
    }

    if (canConfirmMilestone) {
      items.push({
        key: "confirm-milestone",
        label: "Xác nhận mốc nghiệm thu",
        onClick: requestConfirmMilestone,
      });
    }

    if (canViewFinancialSummary) {
      items.push({
        key: "financial-summary",
        label: "Thống kê tài chính",
        onClick: () => navigateToActionPage(ROUTE_URL.PROJECT_FINANCIAL_SUMMARY),
      });
    }

    return items;
  }, [canAssignWarehouse, canConfirmMilestone, canUpdateProject, canViewFinancialSummary, navigateToActionPage, requestConfirmMilestone]);

  const dangerActionItems = useMemo<NonNullable<MenuProps["items"]>>(() => {
    const items: NonNullable<MenuProps["items"]> = [];

    if (canCloseProject) {
      items.push({
        key: "close-project",
        label: "Đóng dự án",
        danger: true,
        onClick: requestCloseProject,
      });
    }

    if (canDeleteProject) {
      items.push({
        key: "archive-project",
        label: "Lưu trữ dự án",
        danger: true,
        onClick: requestArchiveProject,
      });
    }

    return items;
  }, [canCloseProject, canDeleteProject, requestArchiveProject, requestCloseProject]);

  return (
    <ProjectPageLayout
      title={
        <Space size={8} wrap>
          <span>{displayText(project?.name ?? "Trung tâm dự án")}</span>
          {project ? <ProjectStatusTag status={project.status} /> : null}
        </Space>
      }
      subtitle={
        project
          ? `Mã: ${displayText(project.projectCode ?? project.code)} • Khách hàng: ${displayText(project.customerName ?? project.customerId)}`
          : "Theo dõi điều phối triển khai, kho phụ trách và tình trạng nghiệm thu của dự án."
      }
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: "Chi tiết dự án" },
      ]}
      actions={
        <ProjectActionBar
          primaryActions={
            canUpdateProgress ? (
              <Button
                type="primary"
                onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_PROGRESS_UPDATE)}
                disabled={!project || loadingAction}
              >
                Cập nhật tiến độ
              </Button>
            ) : null
          }
          secondaryActions={
            secondaryActionItems.length > 0 ? (
              <Dropdown menu={{ items: secondaryActionItems }} trigger={["click"]}>
                <Button disabled={!project || loadingAction}>Thao tác dự án</Button>
              </Dropdown>
            ) : null
          }
          dangerActions={
            dangerActionItems.length > 0 ? (
              <Dropdown menu={{ items: dangerActionItems }} trigger={["click"]}>
                <Button danger disabled={!project || loadingAction} loading={loadingAction}>
                  Hành động rủi ro
                </Button>
              </Dropdown>
            ) : null
          }
          utilityActions={
            <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={loadingAction}>
              Quay lại danh sách
            </Button>
          }
        />
      }
    >
      {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên đường dẫn." /> : null}

      {detailError ? (
        <Alert
          type="error"
          showIcon
          message="Không thể tải trung tâm dự án."
          description={
            <Space orientation="vertical" size={6}>
              <Typography.Text>{detailError}</Typography.Text>
              <Button size="small" onClick={() => void loadProjectDetail()}>
                Tải lại
              </Button>
            </Space>
          }
        />
      ) : null}

      {loading ? (
        <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : project ? (
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <Card>
                <Statistic title="Tiến độ tổng thể" value={progressPercent} suffix="%" />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={12}>
              <Card>
                <Space orientation="vertical" size={6}>
                  <Typography.Text type="secondary">Trạng thái dự án</Typography.Text>
                  <ProjectStatusTag status={project.status} />
                  <Typography.Text type="secondary">{displayText(getProjectStatusLabel(project.status))}</Typography.Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={12}>
              <Card>
                <Space orientation="vertical" size={6}>
                  <Typography.Text type="secondary">Khách hàng</Typography.Text>
                  <Typography.Text strong style={{ wordBreak: "break-word" }}>
                    {displayText(project.customerName ?? project.customerId)}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ wordBreak: "break-word" }}>
                    Quản lý dự án: {displayText(project.assignedProjectManager)}
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={12}>
              <Card>
                <Space orientation="vertical" size={6}>
                  <Typography.Text type="secondary">Kho triển khai</Typography.Text>
                  <Typography.Text strong style={{ wordBreak: "break-word" }}>
                    {primaryWarehouseLabel}
                  </Typography.Text>
                  <Badge
                    status={milestoneDone ? "success" : "processing"}
                    text={milestoneDone ? "Đã nghiệm thu mốc chính" : "Chưa nghiệm thu mốc chính"}
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <Card title="Tổng quan dự án" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Space orientation="vertical" size={18} style={{ width: "100%" }}>
                  <ProjectProgressBar value={progressPercent} showMeta />
                  <Descriptions column={{ xs: 1, md: 2 }} size="middle">
                    <Descriptions.Item label="Mã dự án">{displayText(project.projectCode ?? project.code)}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái tiến độ">{displayText(project.progressStatus ?? project.status)}</Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">{displayText(project.customerName ?? project.customerId)}</Descriptions.Item>
                    <Descriptions.Item label="Kho chính">{primaryWarehouseLabel}</Descriptions.Item>
                    <Descriptions.Item label="Địa điểm triển khai">{displayText(project.location)}</Descriptions.Item>
                    <Descriptions.Item label="Phạm vi công việc">{displayText(project.scope)}</Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">{formatProjectDate(project.startDate ?? project.startedAt)}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">{formatProjectDate(project.endDate ?? project.endedAt)}</Descriptions.Item>
                  </Descriptions>
                </Space>
              </Card>
            </Col>
            <Col xs={24} xl={8}>
              <Card title="Nhịp điều phối" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Timeline
                  items={[
                    {
                      color: "green",
                      children: `Dự án tạo lúc: ${formatProjectDate(project.createdAt)}`,
                    },
                    {
                      color: "blue",
                      children: `Bắt đầu triển khai: ${formatProjectDate(project.startDate ?? project.startedAt)}`,
                    },
                    {
                      color: "blue",
                      children: `Cập nhật gần nhất: ${formatProjectDate(project.updatedAt)}`,
                    },
                    {
                      color: milestoneDone ? "green" : "gray",
                      children: milestoneDone ? "Đã xác nhận mốc nghiệm thu." : "Chưa xác nhận mốc nghiệm thu.",
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="Thông tin khách hàng" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tên khách hàng">{displayText(project.customerName ?? project.customerId)}</Descriptions.Item>
                  <Descriptions.Item label="Quản lý phụ trách">{displayText(project.assignedProjectManager)}</Descriptions.Item>
                  <Descriptions.Item label="Đơn hàng liên kết">{displayText(project.linkedOrderReference)}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Kho và triển khai" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Kho chính">{primaryWarehouseLabel}</Descriptions.Item>
                  <Descriptions.Item label="Kho dự phòng">{backupWarehouseLabel}</Descriptions.Item>
                  <Descriptions.Item label="Địa điểm">{displayText(project.location)}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Thông tin hệ thống" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Ngân sách">{displayText(project.budget)}</Descriptions.Item>
                  <Descriptions.Item label="Tạo lúc">{formatProjectDate(project.createdAt)}</Descriptions.Item>
                  <Descriptions.Item label="Cập nhật gần nhất">{formatProjectDate(project.updatedAt)}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </Space>
      ) : (
        <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
          <Empty description="Không có dữ liệu dự án để hiển thị." />
        </Card>
      )}
    </ProjectPageLayout>
  );
};

export default ProjectDetailPage;

