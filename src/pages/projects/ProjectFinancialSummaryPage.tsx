import { Alert, Button, Card, Col, Empty, Progress, Row, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/loading/Loading";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectFinancialBreakdownItem, ProjectFinancialSummaryModel, ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import ProjectContextCard from "./components/ProjectContextCard";
import ProjectPageLayout from "./components/ProjectPageLayout";
import { resolveProjectBackTarget } from "./projectNavigation";

const CATEGORY_LABELS: Record<string, string> = {
  ACTUAL_SPEND: "Chi phí thực tế",
  COMMITMENTS: "Cam kết chi",
  PAYMENTS_RECEIVED: "Thanh toán đã nhận",
  PAYMENTS_DUE: "Thanh toán phải thu",
  OUTSTANDING_BALANCE: "Công nợ còn lại",
};

const toReadableToken = (value?: string) => {
  const normalized = (value ?? "").trim().toUpperCase();
  if (!normalized) {
    return "-";
  }

  if (CATEGORY_LABELS[normalized]) {
    return CATEGORY_LABELS[normalized];
  }

  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

const toPercentLabel = (value?: number) => `${Number(value ?? 0).toFixed(2)}%`;

const ProjectFinancialSummaryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { notify } = useNotify();
  const backTarget = useMemo(() => resolveProjectBackTarget(location, id), [id, location]);

  const [project, setProject] = useState<ProjectModel | null>(null);
  const [summary, setSummary] = useState<ProjectFinancialSummaryModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setPageError(null);
      const [projectDetail, financialSummary] = await Promise.all([projectService.getDetail(id), projectService.getFinancialSummary(id)]);
      setProject(projectDetail);
      setSummary(financialSummary);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải thống kê tài chính dự án.");
      setPageError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const breakdownColumns = useMemo<ColumnsType<ProjectFinancialBreakdownItem>>(
    () => [
      {
        title: "Hạng mục",
        dataIndex: "category",
        key: "category",
        render: (value: string | undefined) => toReadableToken(value),
      },
      {
        title: "Giá trị",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (value: number | undefined) => toCurrency(value ?? 0),
      },
    ],
    [],
  );

  const profitabilityMargin = Number(summary?.profitabilityMargin ?? 0);
  const marginProgress = Math.max(0, Math.min(100, profitabilityMargin));
  const variance = Number(summary?.variance ?? 0);
  const isVarianceNegative = variance < 0;

  return (
    <ProjectPageLayout
      title="Thống kê tài chính dự án"
      subtitle="Tổng hợp ngân sách, dòng tiền và hiệu quả tài chính theo dự án."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: id ? <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", id))}>Chi tiết dự án</span> : "Chi tiết dự án" },
        { title: "Thống kê tài chính" },
      ]}
      actions={(
        <Space>
          <Button onClick={() => void loadData()} loading={loading} disabled={!id}>
            Tải lại
          </Button>
          <Button onClick={() => navigate(backTarget)}>Quay lại</Button>
        </Space>
      )}
    >
      {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên đường dẫn." /> : null}

      {pageError ? (
        <Alert
          type="error"
          showIcon
          message="Không thể tải thống kê tài chính."
          description={(
            <Space orientation="vertical" size={6}>
              <Typography.Text>{pageError}</Typography.Text>
              <Button size="small" onClick={() => void loadData()} loading={loading} disabled={!id}>
                Thử lại
              </Button>
            </Space>
          )}
        />
      ) : null}

      {loading ? (
        <Loading mode="section" text="Đang tải dữ liệu tài chính dự án..." />
      ) : project && summary ? (
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <ProjectContextCard project={project} title="Ngữ cảnh dự án" />

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} xl={6}>
              <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Typography.Text type="secondary">Ngân sách</Typography.Text>
                <Typography.Title level={3} style={{ margin: "8px 0 0" }}>
                  {toCurrency(summary.budget)}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Typography.Text type="secondary">Chi phí thực tế</Typography.Text>
                <Typography.Title level={3} style={{ margin: "8px 0 0" }}>
                  {toCurrency(summary.actualSpend)}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Typography.Text type="secondary">Cam kết chi</Typography.Text>
                <Typography.Title level={3} style={{ margin: "8px 0 0" }}>
                  {toCurrency(summary.commitments)}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Typography.Text type="secondary">Độ lệch ngân sách</Typography.Text>
                <Typography.Title level={3} style={{ margin: "8px 0 0", color: isVarianceNegative ? "#cf1322" : "#389e0d" }}>
                  {toCurrency(summary.variance)}
                </Typography.Title>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Dòng tiền" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Typography.Text type="secondary">Thanh toán đã nhận</Typography.Text>
                    <Typography.Text strong>{toCurrency(summary.paymentsReceived)}</Typography.Text>
                  </Row>
                  <Row justify="space-between">
                    <Typography.Text type="secondary">Thanh toán phải thu</Typography.Text>
                    <Typography.Text strong>{toCurrency(summary.paymentsDue)}</Typography.Text>
                  </Row>
                  <Row justify="space-between">
                    <Typography.Text type="secondary">Công nợ còn lại</Typography.Text>
                    <Typography.Text strong>{toCurrency(summary.outstandingBalance)}</Typography.Text>
                  </Row>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Hiệu quả lợi nhuận" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
                <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Typography.Text type="secondary">Lợi nhuận</Typography.Text>
                    <Typography.Text strong>{toCurrency(summary.profitabilityAmount)}</Typography.Text>
                  </Row>
                  <Row justify="space-between">
                    <Typography.Text type="secondary">Biên lợi nhuận</Typography.Text>
                    <Typography.Text strong>{toPercentLabel(summary.profitabilityMargin)}</Typography.Text>
                  </Row>
                  <Progress percent={marginProgress} showInfo={false} status={profitabilityMargin < 0 ? "exception" : "active"} />
                  <Typography.Text type="secondary">
                    Biên lợi nhuận được backend tính theo công thức: (paymentsReceived - actualSpend) / paymentsReceived.
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
          </Row>

          <Card title="Chi tiết theo hạng mục" variant="borderless" style={{ border: "1px solid #e6edf5" }}>
            <Table<ProjectFinancialBreakdownItem>
              rowKey={(record, index) => `${record.category ?? "UNKNOWN"}-${index ?? 0}`}
              columns={breakdownColumns}
              dataSource={summary.breakdownByCategory ?? []}
              pagination={false}
              locale={{ emptyText: "Không có dữ liệu chi tiết." }}
            />
          </Card>

          <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
            <Space orientation="vertical" size={8}>
              <Typography.Text type="secondary">Chế độ tổng hợp</Typography.Text>
              <Tag color="blue">{toReadableToken(summary.aggregationMode)}</Tag>
            </Space>
          </Card>
        </Space>
      ) : (
        <Card variant="borderless" style={{ border: "1px solid #e6edf5" }}>
          <Empty description="Không có dữ liệu tài chính để hiển thị." />
        </Card>
      )}
    </ProjectPageLayout>
  );
};

export default ProjectFinancialSummaryPage;
