import { Alert, Badge, Button, Card, Checkbox, Col, DatePicker, Descriptions, Empty, Form, Input, InputNumber, Modal, Row, Space, Statistic, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectFinancialSummaryModel, ProjectMilestoneModel, ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import ProjectActionBar from "./components/ProjectActionBar";
import ProjectPageLayout from "./components/ProjectPageLayout";
import ProjectProgressBar from "./components/ProjectProgressBar";
import ProjectStatusTag from "./components/ProjectStatusTag";
import { buildProjectActionNavigation } from "./projectNavigation";
import { displayText, formatProjectDate, getProjectStatusLabel, resolveProjectProgress, resolveWarehouseDisplay } from "./projectPresentation";

type ProjectDetailShape = ProjectModel & {
  customerSignoffCompleted?: boolean;
  closeEligibility?: {
    canClose?: boolean;
    blockers?: string[];
  };
  financialDependencies?: {
    openContracts?: number;
    openInvoices?: number;
    outstandingDebt?: number;
  };
};

type CloseProjectFormValues = {
  closeReason: string;
  customerSignoffCompleted?: boolean;
  customerSatisfactionScore?: number;
  warrantyStartDate?: dayjs.Dayjs;
  warrantyEndDate?: dayjs.Dayjs;
};

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const canUpdateProject = canPerformAction(role, "project.update");
  const canAssignWarehouse = canPerformAction(role, "project.assign-warehouse");
  const canUpdateProgress = canPerformAction(role, "project.progress.update");
  const canViewFinancialSummary = canPerformAction(role, "project.financial-summary.view");
  const canDeleteProject = canPerformAction(role, "project.delete");
  const canCloseProject = canPerformAction(role, "project.close");
  const canConfirmMilestone = canPerformAction(role, "project.milestone.confirm");

  const [project, setProject] = useState<ProjectDetailShape | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestoneModel[]>([]);
  const [financialSummary, setFinancialSummary] = useState<ProjectFinancialSummaryModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeForm] = Form.useForm<CloseProjectFormValues>();

  const progressPercent = resolveProjectProgress(project);
  const milestoneDone = Boolean(project?.customerSignoffCompleted);
  const primaryWarehouseLabel = resolveWarehouseDisplay(
    project?.primaryWarehouseName ?? project?.warehouseName,
    project?.primaryWarehouseId ?? project?.warehouseId,
  );
  const backupWarehouseLabel = resolveWarehouseDisplay(project?.backupWarehouseName, project?.backupWarehouseId);
  const closeBlockers = project?.closeEligibility?.blockers ?? [];
  const remainingDebt = project?.financialDependencies?.outstandingDebt ?? financialSummary?.outstandingBalance ?? 0;
  const openContractCount = project?.financialDependencies?.openContracts ?? project?.openContractCount ?? 0;
  const openInvoiceCount = project?.financialDependencies?.openInvoices ?? 0;
  const canCloseByBusiness = (project?.closeEligibility?.canClose ?? true) && closeBlockers.length === 0;

  const loadProjectDetail = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setDetailError(null);

      const [detail, projectMilestones, financial] = await Promise.all([
        projectService.getDetailCenter(id),
        projectService.getMilestones(id).catch(() => []),
        projectService.getFinancialSummary(id).catch(() => null),
      ]);

      setProject(detail.project as ProjectDetailShape);
      setMilestones(projectMilestones);
      setFinancialSummary(financial);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết dự án.");
      setDetailError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadProjectDetail();
  }, [loadProjectDetail]);

  const navigateToActionPage = useCallback(
    (targetPath: string) => {
      if (!id) {
        return;
      }

      const navigation = buildProjectActionNavigation(targetPath.replace(":id", id), location);
      navigate(navigation.to, { state: navigation.state });
    },
    [id, location, navigate],
  );

  const runAction = useCallback(
    async (task: () => Promise<void>, successMessage: string, errorFallback: string) => {
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
    },
    [loadProjectDetail, notify],
  );

  const handleConfirmMilestone = async () => {
    await runAction(
      async () => {
        if (!id) {
          return;
        }
        await projectService.confirmMilestone(id, "Xác nhận nghiệm thu từ trang chi tiết dự án");
      },
      "Đã xác nhận nghiệm thu milestone.",
      "Không thể xác nhận milestone.",
    );
  };

  const handleArchiveProject = async () => {
    await runAction(
      async () => {
        if (!id) {
          return;
        }
        await projectService.softDelete(id, "Lưu trữ từ trang chi tiết dự án");
        navigate(ROUTE_URL.PROJECT_LIST);
      },
      "Đã lưu trữ dự án.",
      "Không thể lưu trữ dự án.",
    );
  };

  const handleCloseProject = async (values: CloseProjectFormValues) => {
    if (!id) {
      return;
    }

    await runAction(
      async () => {
        await projectService.close(id, {
          closeReason: values.closeReason.trim(),
          customerSignoffCompleted: Boolean(values.customerSignoffCompleted),
          customerSatisfactionScore: values.customerSatisfactionScore != null ? Number(values.customerSatisfactionScore) : undefined,
          warrantyStartDate: values.warrantyStartDate?.format("YYYY-MM-DD"),
          warrantyEndDate: values.warrantyEndDate?.format("YYYY-MM-DD"),
          note: values.closeReason.trim(),
        });
        setCloseModalOpen(false);
      },
      "Đã đóng dự án thành công.",
      "Không thể đóng dự án. Vui lòng kiểm tra điều kiện đóng dự án hoặc thông báo lỗi từ hệ thống.",
    );
  };

  const milestoneColumns = useMemo<ColumnsType<ProjectMilestoneModel>>(
    () => [
      {
        title: "Mốc nghiệm thu",
        key: "name",
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{row.name || row.milestoneType || row.id}</Typography.Text>
            <Typography.Text type="secondary">Mức hoàn thành: {row.completionPercent ?? 0}%</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Giá trị",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (value?: number) => (value != null ? toCurrency(value) : "-"),
      },
      {
        title: "Hạn mốc",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (value?: string) => formatProjectDate(value),
      },
      {
        title: "Trạng thái",
        key: "status",
        render: (_, row) => {
          const isConfirmed = Boolean(row.confirmedAt) || String(row.status).toUpperCase() === "CONFIRMED";
          return <Badge status={isConfirmed ? "success" : "processing"} text={isConfirmed ? "Đã xác nhận" : "Chờ xác nhận"} />;
        },
      },
    ],
    [],
  );

  return (
    <>
      <ProjectPageLayout
        title={
          <Space size={8} wrap>
            <span>{displayText(project?.name ?? "Chi tiết dự án")}</span>
            {project ? <ProjectStatusTag status={project.status} /> : null}
          </Space>
        }
        subtitle={
          project
            ? `Mã: ${displayText(project.projectCode ?? project.code)} • Khách hàng: ${displayText(project.customerName ?? project.customerId)}`
            : "Theo dõi tiến độ, milestone và điều kiện đóng dự án."
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
                <Button type="primary" onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_PROGRESS_UPDATE)} disabled={!project || loadingAction}>
                  Cập nhật tiến độ
                </Button>
              ) : null
            }
            secondaryActions={
              <Space wrap>
                {canUpdateProject ? (
                  <Button onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_EDIT)} disabled={!project || loadingAction}>
                    Cập nhật thông tin
                  </Button>
                ) : null}
                {canAssignWarehouse ? (
                  <Button onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE)} disabled={!project || loadingAction}>
                    Gán kho triển khai
                  </Button>
                ) : null}
                {canViewFinancialSummary ? (
                  <Button onClick={() => navigateToActionPage(ROUTE_URL.PROJECT_FINANCIAL_SUMMARY)} disabled={!project || loadingAction}>
                    Xem tài chính
                  </Button>
                ) : null}
                {canConfirmMilestone ? (
                  <Button onClick={() => void handleConfirmMilestone()} disabled={loadingAction}>
                    Xác nhận milestone
                  </Button>
                ) : null}
              </Space>
            }
            dangerActions={
              <Space wrap>
                {canCloseProject ? (
                  <Button
                    danger
                    disabled={!project || loadingAction}
                    onClick={() => {
                      closeForm.setFieldsValue({
                        closeReason: "",
                        customerSignoffCompleted: milestoneDone,
                        customerSatisfactionScore: project?.customerSatisfactionScore,
                      });
                      setCloseModalOpen(true);
                    }}
                  >
                    Đóng dự án
                  </Button>
                ) : null}
                {canDeleteProject ? (
                  <Button danger ghost onClick={() => void handleArchiveProject()} disabled={loadingAction}>
                    Lưu trữ dự án
                  </Button>
                ) : null}
              </Space>
            }
            utilityActions={<Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Quay lại danh sách</Button>}
          />
        }
      >
        {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên đường dẫn." /> : null}
        {detailError ? <Alert type="error" showIcon message="Không thể tải chi tiết dự án." description={detailError} /> : null}

        {!loading && !project ? (
          <Card>
            <Empty description="Không có dữ liệu dự án để hiển thị." />
          </Card>
        ) : null}

        {project ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card>
                  <Statistic title="Tiến độ tổng thể" value={progressPercent} suffix="%" />
                  <ProjectProgressBar value={progressPercent} showMeta />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card>
                  <Space direction="vertical" size={6}>
                    <Typography.Text type="secondary">Trạng thái dự án</Typography.Text>
                    <ProjectStatusTag status={project.status} />
                    <Typography.Text type="secondary">{displayText(getProjectStatusLabel(project.status))}</Typography.Text>
                    <Badge status={milestoneDone ? "success" : "warning"} text={milestoneDone ? "Đã có xác nhận khách hàng" : "Chưa có xác nhận khách hàng"} />
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card title="Điều kiện đóng dự án">
              {!canCloseByBusiness ? (
                <Alert
                  type="warning"
                  showIcon
                  message="Dự án chưa đủ điều kiện đóng."
                  description={
                    <Space direction="vertical" size={2}>
                      {closeBlockers.length > 0 ? closeBlockers.map((blocker) => <Typography.Text key={blocker}>• {blocker}</Typography.Text>) : null}
                      {closeBlockers.length === 0 ? <Typography.Text>Vui lòng kiểm tra thêm các điều kiện nghiệp vụ liên quan.</Typography.Text> : null}
                    </Space>
                  }
                />
              ) : (
                <Alert type="success" showIcon message="Dự án đủ điều kiện đóng theo dữ liệu hiện tại." />
              )}

              <Descriptions column={{ xs: 1, md: 2, lg: 3 }} size="small" style={{ marginTop: 12 }}>
                <Descriptions.Item label="Milestone đã xác nhận">{milestones.filter((milestone) => milestone.confirmedAt).length}</Descriptions.Item>
                <Descriptions.Item label="Tổng milestone">{milestones.length}</Descriptions.Item>
                <Descriptions.Item label="Xác nhận khách hàng">{milestoneDone ? "Đã xác nhận" : "Chưa xác nhận"}</Descriptions.Item>
                <Descriptions.Item label="Hợp đồng mở">{openContractCount}</Descriptions.Item>
                <Descriptions.Item label="Hóa đơn mở">{openInvoiceCount}</Descriptions.Item>
                <Descriptions.Item label="Phụ thuộc tài chính">{toCurrency(remainingDebt)}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Danh sách milestone">
              <Table
                rowKey={(row) => row.id}
                columns={milestoneColumns}
                dataSource={milestones}
                pagination={false}
                locale={{
                  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu milestone." />,
                }}
              />
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card title="Thông tin khách hàng">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tên khách hàng">{displayText(project.customerName ?? project.customerId)}</Descriptions.Item>
                    <Descriptions.Item label="Quản lý phụ trách">{displayText(project.assignedProjectManager)}</Descriptions.Item>
                    <Descriptions.Item label="Đơn hàng liên kết">{displayText(project.linkedOrderReference)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Kho và triển khai">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Kho chính">{primaryWarehouseLabel}</Descriptions.Item>
                    <Descriptions.Item label="Kho dự phòng">{backupWarehouseLabel}</Descriptions.Item>
                    <Descriptions.Item label="Địa điểm">{displayText(project.location)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Tài chính dự án">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngân sách">{project.budget != null ? toCurrency(project.budget) : "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Đã thu">{toCurrency(financialSummary?.paymentsReceived ?? 0)}</Descriptions.Item>
                    <Descriptions.Item label="Còn phải thu">{toCurrency(financialSummary?.paymentsDue ?? 0)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Space>
        ) : null}
      </ProjectPageLayout>

      <Modal
        title="Xác nhận đóng dự án"
        open={closeModalOpen}
        onCancel={() => (loadingAction ? undefined : setCloseModalOpen(false))}
        onOk={() => closeForm.submit()}
        okText="Xác nhận đóng dự án"
        cancelText="Đóng"
        okButtonProps={{ danger: true, loading: loadingAction, disabled: !canCloseByBusiness }}
      >
        <Form<CloseProjectFormValues> form={closeForm} layout="vertical" onFinish={(values) => void handleCloseProject(values)}>
          {!canCloseByBusiness ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 12 }}
              message="Dự án chưa đủ điều kiện đóng."
              description="Hệ thống có thể từ chối yêu cầu đóng dự án nếu chưa hoàn tất milestone, chưa có xác nhận khách hàng hoặc còn ràng buộc tài chính."
            />
          ) : null}

          <Form.Item
            label="Lý do đóng dự án"
            name="closeReason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do đóng dự án." },
              { max: 1000, message: "Lý do tối đa 1000 ký tự." },
            ]}
          >
            <Input.TextArea rows={3} maxLength={1000} showCount placeholder="Nhập lý do đóng dự án." />
          </Form.Item>

          <Form.Item name="customerSignoffCompleted" valuePropName="checked">
            <Checkbox>Xác nhận đã có biên bản nghiệm thu của khách hàng</Checkbox>
          </Form.Item>

          <Form.Item label="Điểm hài lòng khách hàng (1-5)" name="customerSatisfactionScore">
            <InputNumber min={1} max={5} className="w-full" />
          </Form.Item>

          <Form.Item label="Bảo hành từ ngày" name="warrantyStartDate">
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Bảo hành đến ngày" name="warrantyEndDate">
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProjectDetailPage;
