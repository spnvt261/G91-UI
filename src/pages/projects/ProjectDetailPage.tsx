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
    { key: "projectCode", label: "Project code", value: displayText(project?.projectCode ?? project?.code) },
    { key: "projectName", label: "Project name", value: displayText(project?.name) },
    { key: "customer", label: "Customer", value: displayText(project?.customerName ?? project?.customerId) },
    { key: "manager", label: "Project manager", value: displayText(project?.assignedProjectManager) },
    { key: "warehouse", label: "Primary warehouse", value: displayText(project?.primaryWarehouseId ?? project?.warehouseId) },
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
        notify(getErrorMessage(error, "Cannot load project detail"), "error");
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
      await projectService.close(id, "Closed from project detail screen");
      await loadProjectDetail(id);
      notify("Project closed successfully.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Cannot close project"), "error");
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
      await projectService.confirmMilestone(id, "Milestone confirmed from project detail screen");
      await loadProjectDetail(id);
      notify("Milestone confirmed successfully.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Cannot confirm project milestone"), "error");
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
      await projectService.softDelete(id, "Archived from project detail screen");
      notify("Project archived (soft delete).", "success");
      setShowDeleteModal(false);
      navigate(ROUTE_URL.PROJECT_LIST);
    } catch (error) {
      notify(getErrorMessage(error, "Cannot archive project"), "error");
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
            <span>{displayText(project?.name ?? "Project detail")}</span>
            {project ? <ProjectStatusTag status={project.status} /> : null}
          </Space>
        }
        subtitle={`Project code: ${displayText(project?.projectCode ?? project?.code)}`}
        breadcrumbItems={[
          { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Home</span> },
          { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Projects</span> },
          { title: "Detail" },
        ]}
        actions={
          <Space wrap>
            {canUpdateProject ? (
              <Button type="primary" onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_EDIT)} disabled={!project || isBusy}>
                Update
              </Button>
            ) : null}
            {canAssignWarehouse ? (
              <Button onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE)} disabled={!project || isBusy}>
                Assign warehouse
              </Button>
            ) : null}
            {canUpdateProgress ? (
              <Button onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_PROGRESS_UPDATE)} disabled={!project || isBusy}>
                Update progress
              </Button>
            ) : null}
            {canCloseProject ? (
              <Button onClick={handleCloseProject} loading={actionLoading} disabled={!project || isBusy}>
                Close project
              </Button>
            ) : null}
            {canConfirmMilestone ? (
              <Button onClick={handleConfirmMilestone} loading={actionLoading} disabled={!project || isBusy}>
                Confirm milestone
              </Button>
            ) : null}
            {canDeleteProject ? (
              <Button danger onClick={() => setShowDeleteModal(true)} disabled={!project || isBusy}>
                Soft delete
              </Button>
            ) : null}
            <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={isBusy}>
              Back to list
            </Button>
          </Space>
        }
      >
        {!id ? <Alert type="warning" showIcon message="Project id is missing from URL." /> : null}
        <Spin spinning={loading} tip="Loading project detail...">
          {project ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Overview">
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
                <Card title="Progress">
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <ProjectProgressBar value={progressPercent} showMeta />
                    <Row gutter={12}>
                      <Col span={12}>
                        <Statistic title="Completed" value={progressPercent} suffix="%" />
                      </Col>
                      <Col span={12}>
                        <Statistic title="Progress status" value={displayText(project.progressStatus ?? project.status)} />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="Execution info">
                  <Descriptions column={{ xs: 1, md: 2, xl: 3 }} size="middle">
                    <Descriptions.Item label="Start date">{formatProjectDate(project.startDate ?? project.startedAt)}</Descriptions.Item>
                    <Descriptions.Item label="End date">{formatProjectDate(project.endDate ?? project.endedAt)}</Descriptions.Item>
                    <Descriptions.Item label="Location">{displayText(project.location)}</Descriptions.Item>
                    <Descriptions.Item label="Scope">{displayText(project.scope)}</Descriptions.Item>
                    <Descriptions.Item label="Budget">{displayText(project.budget)}</Descriptions.Item>
                    <Descriptions.Item label="Linked order">{displayText(project.linkedOrderReference)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          ) : (
            <Card>
              <Empty description="No project data found." />
            </Card>
          )}
        </Spin>
      </ProjectPageLayout>

      <Modal
        title="Soft delete project"
        open={showDeleteModal}
        onCancel={() => (deleting ? undefined : setShowDeleteModal(false))}
        closable={!deleting}
        maskClosable={!deleting}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" danger loading={deleting} onClick={handleDeleteProject}>
            Confirm soft delete
          </Button>,
        ]}
      >
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          This action moves the project into archived status. Physical delete endpoint is not available yet.
        </Typography.Paragraph>
        <Typography.Text type="secondary">{displayText(project?.name)}</Typography.Text>
      </Modal>
    </>
  );
};

export default ProjectDetailPage;

