import { Alert, Button, Card, Col, Descriptions, Empty, Modal, Row, Space, Spin, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import ProjectPageLayout from "./components/ProjectPageLayout";
import ProjectProgressBar from "./components/ProjectProgressBar";
import ProjectStatusTag from "./components/ProjectStatusTag";
import { buildProjectActionNavigation } from "./projectNavigation";
import { displayText, formatProjectDate, resolveProjectProgress } from "./projectPresentation";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const progressPercent = resolveProjectProgress(project);

  const overviewItems = [
    { key: "projectCode", label: "Mã dự án", value: displayText(project?.projectCode ?? project?.code) },
    { key: "projectName", label: "Tên dự án", value: displayText(project?.name) },
    { key: "customer", label: "Khách hàng", value: displayText(project?.customerName ?? project?.customerId) },
    { key: "manager", label: "Quản lý dự án", value: displayText(project?.assignedProjectManager) },
    { key: "warehouse", label: "Kho chính", value: displayText(project?.primaryWarehouseId ?? project?.warehouseId) },
  ];

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
      notify("Xác nhận mốc thành công.", "success");
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
      notify("Đã xóa dự án thành công.", "success");
      setShowDeleteModal(false);
      navigate(ROUTE_URL.PROJECT_LIST);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xóa dự án"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const navigateToActionPage = (targetPath: string) => {
    if (!id) {
      return;
    }

    const navigation = buildProjectActionNavigation(targetPath.replace(":id", id), location);
    navigate(navigation.to, { state: navigation.state });
  };

  return (
    <>
      <ProjectPageLayout
        title={
          <Space size={8} wrap>
            <span>{displayText(project?.name ?? "Chi tiết dự án")}</span>
            {project ? <ProjectStatusTag status={project.status} /> : null}
          </Space>
        }
        subtitle={`Mã dự án: ${displayText(project?.projectCode ?? project?.code)}`}
        breadcrumbItems={[
          { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
          { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
          { title: "Chi tiết" },
        ]}
        actions={
          <Space wrap>
            {canUpdateProject ? (
              <Button type="primary" onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_EDIT)} disabled={!project || isBusy}>
                Cập nhật
              </Button>
            ) : null}
            {canAssignWarehouse ? (
              <Button onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE)} disabled={!project || isBusy}>
                Gán kho
              </Button>
            ) : null}
            {canUpdateProgress ? (
              <Button onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_PROGRESS_UPDATE)} disabled={!project || isBusy}>
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
                Xóa
              </Button>
            ) : null}
            <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={isBusy}>
              Quay lại danh sách
            </Button>
          </Space>
        }
      >
        {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên URL." /> : null}
        <Spin spinning={loading} tip="Đang tải chi tiết dự án...">
          {project ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Tổng quan">
                  <Row gutter={[12, 12]}>
                    {overviewItems.map((item) => (
                      <Col key={item.key} xs={24} md={12}>
                        <div className="h-full rounded-lg border border-slate-200 px-4 py-3">
                          <Typography.Text type="secondary">{item.label}</Typography.Text>
                          <Typography.Paragraph
                            style={{
                              marginBottom: 0,
                              marginTop: 6,
                              fontWeight: 500,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {item.value}
                          </Typography.Paragraph>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Tiến độ">
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <ProjectProgressBar value={progressPercent} showMeta />
                    <Row gutter={12}>
                      <Col span={12}>
                        <Statistic title="Hoàn thành" value={progressPercent} suffix="%" />
                      </Col>
                      <Col span={12}>
                        <Statistic title="Trạng thái tiến độ" value={displayText(project.progressStatus ?? project.status)} />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="Thông tin triển khai">
                  <Descriptions column={{ xs: 1, md: 2, xl: 3 }} size="middle">
                    <Descriptions.Item label="Ngày bắt đầu">{formatProjectDate(project.startDate ?? project.startedAt)}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">{formatProjectDate(project.endDate ?? project.endedAt)}</Descriptions.Item>
                    <Descriptions.Item label="Địa điểm">{displayText(project.location)}</Descriptions.Item>
                    <Descriptions.Item label="Phạm vi">{displayText(project.scope)}</Descriptions.Item>
                    <Descriptions.Item label="Ngân sách">{displayText(project.budget)}</Descriptions.Item>
                    <Descriptions.Item label="Đơn hàng liên kết">{displayText(project.linkedOrderReference)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          ) : (
            <Card>
              <Empty description="Không có dữ liệu dự án." />
            </Card>
          )}
        </Spin>
      </ProjectPageLayout>

      <Modal
        title="Xóa dự án"
        open={showDeleteModal}
        onCancel={() => (deleting ? undefined : setShowDeleteModal(false))}
        closable={!deleting}
        maskClosable={!deleting}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" danger loading={deleting} onClick={handleDeleteProject}>
            Xác nhận xóa
          </Button>,
        ]}
      >
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          Hành động này sẽ chuyển dự án sang trạng thái lưu trữ vì backend chưa hỗ trợ API xóa cứng.
        </Typography.Paragraph>
        <Typography.Text type="secondary">{displayText(project?.name)}</Typography.Text>
      </Modal>
    </>
  );
};

export default ProjectDetailPage;
