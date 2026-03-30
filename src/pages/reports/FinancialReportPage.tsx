import { FilterOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Empty, Input, Progress, Row, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectReportItem } from "../../models/report/report.model";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage } from "../shared/page.utils";
import { FinancialOverviewCards, ReportFilterBar, ReportPageHeader } from "./components";
import { formatNumber, normalizeText } from "./components/report.utils";

interface FinancialTableRow extends ProjectReportItem {
  key: string;
  normalizedStatus: string;
}

const getStatusMeta = (status: string): { color: string; label: string; riskLevel: "safe" | "warning" | "critical" } => {
  const normalized = normalizeText(status);

  if (normalized.includes("hoàn thành") || normalized.includes("hoan thanh") || normalized.includes("done") || normalized.includes("complete")) {
    return { color: "green", label: "Hoàn thành", riskLevel: "safe" };
  }

  if (normalized.includes("chậm") || normalized.includes("cham") || normalized.includes("delay") || normalized.includes("quá hạn")) {
    return { color: "red", label: "Chậm tiến độ", riskLevel: "critical" };
  }

  if (normalized.includes("rủi ro") || normalized.includes("rui ro") || normalized.includes("risk") || normalized.includes("cảnh báo")) {
    return { color: "gold", label: "Cần theo dõi", riskLevel: "warning" };
  }

  if (normalized.includes("đang") || normalized.includes("dang") || normalized.includes("active") || normalized.includes("in progress")) {
    return { color: "blue", label: "Đang triển khai", riskLevel: "safe" };
  }

  return {
    color: "default",
    label: status || "Chưa phân loại",
    riskLevel: "warning",
  };
};

const FinancialReportPage = () => {
  const [projectRows, setProjectRows] = useState<ProjectReportItem[]>([]);
  const [summaryRevenue, setSummaryRevenue] = useState(0);
  const [summaryDebt, setSummaryDebt] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setPageError(null);
        const [projects, dashboard] = await Promise.all([reportService.getProjectReport(), reportService.getDashboard()]);
        setProjectRows(projects);
        setSummaryRevenue(dashboard.summary.totalRevenue ?? 0);
        setSummaryDebt(dashboard.summary.totalDebt ?? 0);
      } catch (err) {
        const message = getErrorMessage(err, "Không thể tải báo cáo tài chính.");
        setPageError(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const rows = useMemo<FinancialTableRow[]>(
    () =>
      projectRows.map((item) => ({
        ...item,
        key: item.projectId,
        normalizedStatus: getStatusMeta(item.status).label,
      })),
    [projectRows],
  );

  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(rows.map((item) => item.status).filter(Boolean)));
    return uniqueStatuses.map((status) => ({ label: getStatusMeta(status).label, value: status }));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);

    return rows.filter((item) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        normalizeText(item.projectName).includes(normalizedKeyword) ||
        normalizeText(item.projectId).includes(normalizedKeyword);
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [keyword, rows, statusFilter]);

  const overview = useMemo(() => {
    const total = filteredRows.length;
    const averageProgress = total > 0 ? filteredRows.reduce((sum, item) => sum + item.progress, 0) / total : 0;
    const onTrack = filteredRows.filter((item) => item.progress >= 80).length;
    const atRisk = filteredRows.filter((item) => {
      const statusMeta = getStatusMeta(item.status);
      return item.progress < 50 || statusMeta.riskLevel !== "safe";
    }).length;

    return {
      total,
      averageProgress,
      onTrack,
      atRisk,
    };
  }, [filteredRows]);

  const columns = useMemo<ColumnsType<FinancialTableRow>>(
    () => [
      {
        title: "Mã dự án",
        dataIndex: "projectId",
        key: "projectId",
        width: 180,
        render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
      },
      {
        title: "Tên dự án",
        dataIndex: "projectName",
        key: "projectName",
        render: (value: string) => value || "Chưa cập nhật",
      },
      {
        title: "Tiến độ",
        dataIndex: "progress",
        key: "progress",
        width: 220,
        render: (value: number) => {
          const normalized = Math.max(0, Math.min(100, value));
          const color = normalized >= 80 ? "#52c41a" : normalized >= 50 ? "#1677ff" : "#fa8c16";
          return <Progress percent={normalized} strokeColor={color} />;
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 190,
        render: (value: string) => {
          const meta = getStatusMeta(value);
          return <Tag color={meta.color}>{meta.label}</Tag>;
        },
      },
    ],
    [],
  );

  const isInitialLoading = loading && projectRows.length === 0;

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ReportPageHeader
          title="Báo cáo tài chính"
          subtitle="Tổng hợp bức tranh doanh thu, công nợ và tiến độ tài chính dự án để hỗ trợ điều hành cấp quản trị."
          breadcrumbItems={[
            { label: "Trang chủ", url: ROUTE_URL.DASHBOARD },
            { label: "Báo cáo", url: ROUTE_URL.REPORT_FINANCIAL },
            { label: "Tài chính" },
          ]}
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {pageError ? (
            <Alert
              showIcon
              type="error"
              message="Không thể tải dữ liệu báo cáo tài chính."
              description={pageError}
              closable
              onClose={() => setPageError(null)}
            />
          ) : null}

          <FinancialOverviewCards totalRevenue={summaryRevenue} totalDebt={summaryDebt} loading={isInitialLoading} />

          <Card bordered={false} title="Điểm nổi bật tài chính" loading={isInitialLoading}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">Dự án đang theo dõi</Typography.Text>
                  <Typography.Title level={4} className="!mb-0">
                    {formatNumber(overview.total)}
                  </Typography.Title>
                  <Typography.Text type="secondary">Số dự án theo bộ lọc hiện tại.</Typography.Text>
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">Dự án tiến độ tốt</Typography.Text>
                  <Typography.Title level={4} className="!mb-0" style={{ color: "#389e0d" }}>
                    {formatNumber(overview.onTrack)}
                  </Typography.Title>
                  <Typography.Text type="secondary">Tiến độ từ 80% trở lên.</Typography.Text>
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">Dự án cần chú ý</Typography.Text>
                  <Typography.Title level={4} className="!mb-0" style={{ color: "#d4380d" }}>
                    {formatNumber(overview.atRisk)}
                  </Typography.Title>
                  <Typography.Text type="secondary">{`Tiến độ trung bình ${overview.averageProgress.toFixed(1)}%`}</Typography.Text>
                </Space>
              </Col>
            </Row>
          </Card>

          <ReportFilterBar
            title="Bộ lọc dự án tài chính"
            description="Tìm kiếm nhanh theo mã, tên dự án và trạng thái tài chính."
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword("");
                  setStatusFilter(undefined);
                }}
              >
                Đặt lại
              </Button>
            }
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} lg={12}>
                <Input
                  allowClear
                  value={keyword}
                  prefix={<SearchOutlined />}
                  placeholder="Tìm theo mã dự án hoặc tên dự án"
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </Col>
              <Col xs={24} lg={8}>
                <Select
                  allowClear
                  value={statusFilter}
                  placeholder="Lọc theo trạng thái"
                  options={statusOptions}
                  suffixIcon={<FilterOutlined />}
                  className="w-full"
                  onChange={(value) => setStatusFilter(value)}
                />
              </Col>
              <Col xs={24} lg={4}>
                <Tag color="blue" style={{ height: 32, display: "inline-flex", alignItems: "center" }}>
                  {`${filteredRows.length} dự án`}
                </Tag>
              </Col>
            </Row>
          </ReportFilterBar>

          <Card
            bordered={false}
            title="Chi tiết tài chính theo dự án"
            extra={<Typography.Text type="secondary">{`Hiển thị ${filteredRows.length} dự án`}</Typography.Text>}
            styles={{ body: { padding: 0 } }}
          >
            <Table<FinancialTableRow>
              rowKey="key"
              columns={columns}
              dataSource={filteredRows}
              loading={{ spinning: loading && projectRows.length > 0, tip: "Đang cập nhật báo cáo tài chính..." }}
              rowClassName={(record) => {
                const statusMeta = getStatusMeta(record.status);
                return statusMeta.riskLevel === "critical" ? "bg-red-50" : statusMeta.riskLevel === "warning" ? "bg-amber-50" : "";
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có dữ liệu dự án phù hợp. Hãy thử thay đổi bộ lọc."
                  />
                ),
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} dự án`,
              }}
              scroll={{ x: 920 }}
            />
          </Card>
        </Space>
      }
    />
  );
};

export default FinancialReportPage;
