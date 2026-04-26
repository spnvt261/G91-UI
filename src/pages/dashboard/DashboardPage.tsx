import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  InboxOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Empty, Row, Select, Space, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type {
  DashboardResponseData,
  DashboardSummary,
  MilestoneConfirmationItem,
  OverdueInvoiceItem,
  PaymentConfirmationItem,
  PendingApprovalItem,
  WarehouseActionItem,
} from "../../models/dashboard/dashboard.model";
import { dashboardService } from "../../services/dashboard/dashboard.service";
import { getErrorMessage } from "../shared/page.utils";
import {
  formatDashboardCurrency,
  formatDashboardDate,
  formatDashboardDateTime,
  formatDashboardNumber,
  getApprovalTierLabel,
  getApprovalTypeLabel,
  getDashboardRoleLabel,
  getDashboardStatusMeta,
  getDisplayValue,
  getPendingActionLabel,
} from "./dashboard.ui";

const DEFAULT_LIMIT = 10;

const EMPTY_SUMMARY: DashboardSummary = {
  pendingApprovalCount: 0,
  pendingPaymentConfirmationCount: 0,
  overdueInvoiceCount: 0,
  overdueAmount: 0,
  warehouseActionCount: 0,
  milestoneConfirmationCount: 0,
};

interface SummaryCardItem {
  key: string;
  title: string;
  value: number;
  helper: string;
  icon: ReactNode;
  color?: string;
  formatter?: (value: number) => string;
}

interface DashboardSectionProps<T extends object> {
  title: string;
  subtitle: string;
  items: T[];
  columns: ColumnsType<T>;
  rowKey: (item: T) => string;
  loading: boolean;
  emptyText: string;
  scrollX: number;
}

const statusTag = (status?: string | null) => {
  const meta = getDashboardStatusMeta(status);
  return <Tag color={meta.color}>{meta.label}</Tag>;
};

const DashboardSection = <T extends object>({
  title,
  subtitle,
  items,
  columns,
  rowKey,
  loading,
  emptyText,
  scrollX,
}: DashboardSectionProps<T>) => (
  <Card bordered className="shadow-sm" styles={{ body: { padding: 16 } }}>
    <Space direction="vertical" size={14} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={4} className="!mb-1 !text-slate-900">
          {title}
        </Typography.Title>
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
      </div>

      <Table<T>
        size="middle"
        rowKey={rowKey}
        columns={columns}
        dataSource={items}
        loading={{ spinning: loading, tip: "Đang tải dữ liệu..." }}
        pagination={false}
        scroll={{ x: scrollX }}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />,
        }}
      />
    </Space>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardResponseData | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const response = await dashboardService.getDashboard({ limit });
      setDashboard(response);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải dữ liệu tổng quan quản trị.");
      setPageError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [limit, notify]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.summary ?? EMPTY_SUMMARY;

  const summaryCards = useMemo<SummaryCardItem[]>(
    () => [
      {
        key: "approval",
        title: "Hợp đồng chờ phê duyệt",
        value: summary.pendingApprovalCount,
        helper: "Cần chủ sở hữu ra quyết định",
        icon: <FileDoneOutlined />,
        color: "#d48806",
      },
      {
        key: "payment",
        title: "Chuyển khoản chờ xác nhận",
        value: summary.pendingPaymentConfirmationCount,
        helper: "Yêu cầu khách hàng đã gửi",
        icon: <CheckCircleOutlined />,
        color: "#1677ff",
      },
      {
        key: "overdue",
        title: "Hóa đơn quá hạn",
        value: summary.overdueInvoiceCount,
        helper: "Còn số tiền phải thu",
        icon: <WarningOutlined />,
        color: "#cf1322",
      },
      {
        key: "amount",
        title: "Tổng nợ quá hạn",
        value: summary.overdueAmount,
        helper: "Tổng số tiền chưa thu",
        icon: <ClockCircleOutlined />,
        color: "#cf1322",
        formatter: formatDashboardCurrency,
      },
      {
        key: "warehouse",
        title: "Đơn cần kho xử lý",
        value: summary.warehouseActionCount,
        helper: "Đang trong luồng giao hàng",
        icon: <InboxOutlined />,
        color: "#08979c",
      },
      {
        key: "milestone",
        title: "Mốc dự án chờ xác nhận",
        value: summary.milestoneConfirmationCount,
        helper: "Cần khách hàng xác nhận",
        icon: <ScheduleOutlined />,
        color: "#7c3aed",
      },
    ],
    [summary],
  );

  const pendingApprovalColumns = useMemo<ColumnsType<PendingApprovalItem>>(
    () => [
      {
        title: "Hợp đồng",
        key: "contract",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{getDisplayValue(record.contractNumber ?? record.contractId)}</Typography.Text>
            <Typography.Text type="secondary">Mã: {getDisplayValue(record.contractId)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{getDisplayValue(record.customerName)}</Typography.Text>
            <Typography.Text type="secondary">{getDisplayValue(record.customerId, "Chưa có mã")}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Nội dung duyệt",
        key: "approvalType",
        width: 210,
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            <Typography.Text>{getApprovalTypeLabel(record.approvalType)}</Typography.Text>
            <Space size={4} wrap>
              <Tag>{getApprovalTierLabel(record.approvalTier)}</Tag>
              <Tag color="blue">{getPendingActionLabel(record.pendingAction)}</Tag>
            </Space>
          </Space>
        ),
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        align: "right",
        width: 160,
        render: (value?: number | null) => <Typography.Text strong>{formatDashboardCurrency(value)}</Typography.Text>,
      },
      {
        title: "Thời điểm",
        key: "requestedAt",
        width: 190,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{formatDashboardDateTime(record.requestedAt)}</Typography.Text>
            <Typography.Text type="secondary">Hạn: {formatDashboardDateTime(record.dueAt)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: statusTag,
      },
      {
        title: "Thao tác",
        key: "action",
        width: 110,
        fixed: "right",
        render: (_, record) => (
          <Button
            type="link"
            disabled={!record.contractId}
            onClick={() => record.contractId && navigate(ROUTE_URL.CONTRACT_APPROVAL_DETAIL.replace(":id", record.contractId))}
          >
            Xem
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const paymentConfirmationColumns = useMemo<ColumnsType<PaymentConfirmationItem>>(
    () => [
      {
        title: "Hóa đơn",
        key: "invoice",
        width: 190,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{getDisplayValue(record.invoiceNumber ?? record.invoiceId)}</Typography.Text>
            <Typography.Text type="secondary">Mã: {getDisplayValue(record.invoiceId)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{getDisplayValue(record.customerName)}</Typography.Text>
            <Typography.Text type="secondary">{getDisplayValue(record.customerCode ?? record.customerId, "Chưa có mã")}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Số tiền",
        dataIndex: "requestedAmount",
        key: "requestedAmount",
        width: 160,
        align: "right",
        render: (value?: number | null) => <Typography.Text strong>{formatDashboardCurrency(value)}</Typography.Text>,
      },
      {
        title: "Chuyển khoản",
        key: "transfer",
        width: 260,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{formatDashboardDateTime(record.transferTime)}</Typography.Text>
            <Typography.Text type="secondary">
              {getDisplayValue(record.senderBankName, "Chưa có ngân hàng")} - {getDisplayValue(record.referenceCode, "Chưa có mã tham chiếu")}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: "Tạo lúc",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 170,
        render: (value?: string | null) => formatDashboardDateTime(value),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: statusTag,
      },
      {
        title: "Thao tác",
        key: "action",
        width: 110,
        fixed: "right",
        render: (_, record) => (
          <Button
            type="link"
            disabled={!record.requestId}
            onClick={() => record.requestId && navigate(ROUTE_URL.PAYMENT_CONFIRMATION_DETAIL.replace(":id", record.requestId))}
          >
            Xem
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const overdueInvoiceColumns = useMemo<ColumnsType<OverdueInvoiceItem>>(
    () => [
      {
        title: "Hóa đơn",
        key: "invoice",
        width: 190,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{getDisplayValue(record.invoiceNumber ?? record.invoiceId)}</Typography.Text>
            <Typography.Text type="secondary">Hợp đồng: {getDisplayValue(record.contractNumber ?? record.contractId)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{getDisplayValue(record.customerName)}</Typography.Text>
            <Typography.Text type="secondary">{getDisplayValue(record.customerCode ?? record.customerId, "Chưa có mã")}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Hạn thanh toán",
        key: "dueDate",
        width: 170,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{formatDashboardDate(record.dueDate)}</Typography.Text>
            <Typography.Text type="danger">{formatDashboardNumber(record.overdueDays)} ngày quá hạn</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Tổng tiền",
        dataIndex: "grandTotal",
        key: "grandTotal",
        width: 150,
        align: "right",
        render: (value?: number | null) => formatDashboardCurrency(value),
      },
      {
        title: "Đã thu",
        dataIndex: "paidAmount",
        key: "paidAmount",
        width: 150,
        align: "right",
        render: (value?: number | null) => formatDashboardCurrency(value),
      },
      {
        title: "Còn phải thu",
        dataIndex: "outstandingAmount",
        key: "outstandingAmount",
        width: 160,
        align: "right",
        render: (value?: number | null) => <Typography.Text type="danger" strong>{formatDashboardCurrency(value)}</Typography.Text>,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: statusTag,
      },
      {
        title: "Thao tác",
        key: "action",
        width: 110,
        fixed: "right",
        render: (_, record) => (
          <Button
            type="link"
            disabled={!record.invoiceId}
            onClick={() => record.invoiceId && navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", record.invoiceId))}
          >
            Xem
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const warehouseActionColumns = useMemo<ColumnsType<WarehouseActionItem>>(
    () => [
      {
        title: "Đơn bán",
        key: "saleOrder",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{getDisplayValue(record.saleOrderNumber ?? record.contractId)}</Typography.Text>
            <Typography.Text type="secondary">Hợp đồng: {getDisplayValue(record.contractNumber ?? record.contractId)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{getDisplayValue(record.customerName)}</Typography.Text>
            <Typography.Text type="secondary">{getDisplayValue(record.customerId, "Chưa có mã")}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Ngày giao",
        key: "delivery",
        width: 180,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>Dự kiến: {formatDashboardDate(record.expectedDeliveryDate)}</Typography.Text>
            <Typography.Text type="secondary">Thực tế: {formatDashboardDate(record.actualDeliveryDate)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Giá trị",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 150,
        align: "right",
        render: (value?: number | null) => formatDashboardCurrency(value),
      },
      {
        title: "Gửi lúc",
        dataIndex: "submittedAt",
        key: "submittedAt",
        width: 170,
        render: (value?: string | null) => formatDashboardDateTime(value),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: statusTag,
      },
      {
        title: "Thao tác",
        key: "action",
        width: 110,
        fixed: "right",
        render: (_, record) => (
          <Button
            type="link"
            disabled={!record.contractId}
            onClick={() => record.contractId && navigate(ROUTE_URL.SALE_ORDER_DETAIL.replace(":id", record.contractId))}
          >
            Xem
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const milestoneColumns = useMemo<ColumnsType<MilestoneConfirmationItem>>(
    () => [
      {
        title: "Dự án",
        key: "project",
        width: 240,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{getDisplayValue(record.projectName ?? record.projectCode)}</Typography.Text>
            <Typography.Text type="secondary">Mã: {getDisplayValue(record.projectCode ?? record.projectId)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Mốc cần xác nhận",
        key: "milestone",
        width: 230,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{getDisplayValue(record.milestoneName)}</Typography.Text>
            <Typography.Text type="secondary">Hoàn thành {formatDashboardNumber(record.completionPercent)}%</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 210,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{getDisplayValue(record.customerName)}</Typography.Text>
            <Typography.Text type="secondary">{getDisplayValue(record.customerId, "Chưa có mã")}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Số tiền",
        dataIndex: "amount",
        key: "amount",
        width: 150,
        align: "right",
        render: (value?: number | null) => formatDashboardCurrency(value),
      },
      {
        title: "Thời hạn",
        key: "deadline",
        width: 190,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>Đến hạn: {formatDashboardDate(record.dueDate)}</Typography.Text>
            <Typography.Text type="secondary">Xác nhận: {formatDashboardDateTime(record.confirmationDeadline)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 150,
        render: (_, record) => (
          <Space direction="vertical" size={4}>
            {statusTag(record.status)}
            {statusTag(record.confirmationStatus)}
          </Space>
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        width: 110,
        fixed: "right",
        render: (_, record) => (
          <Button
            type="link"
            disabled={!record.projectId}
            onClick={() => record.projectId && navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", record.projectId))}
          >
            Xem
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const initialLoading = loading && !dashboard;

  return (
    <NoResizeScreenTemplate
      loading={initialLoading}
      loadingText="Đang tải dữ liệu tổng quan quản trị..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tổng quan quản trị"
          subtitle="Theo dõi các việc cần xử lý trên hợp đồng, chuyển khoản, hóa đơn, kho và dự án trong một màn hình."
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Tổng quan quản trị" }]} />}
          actions={
            <Space wrap>
              <Space size={8}>
                <Typography.Text type="secondary">Số dòng hiển thị</Typography.Text>
                <Select
                  value={limit}
                  style={{ width: 110 }}
                  options={[
                    { value: 5, label: "5 dòng" },
                    { value: 10, label: "10 dòng" },
                    { value: 20, label: "20 dòng" },
                    { value: 50, label: "50 dòng" },
                  ]}
                  onChange={setLimit}
                />
              </Space>
              <Button icon={<ReloadOutlined />} onClick={() => void loadDashboard()} loading={loading}>
                Làm mới
              </Button>
            </Space>
          }
          meta={
            dashboard ? (
              <Space wrap size={8}>
                <Tag color="blue">Vai trò: {getDashboardRoleLabel(dashboard.role)}</Tag>
                <Tag>Cập nhật: {formatDashboardDateTime(dashboard.generatedAt)}</Tag>
              </Space>
            ) : null
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {pageError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải dữ liệu tổng quan quản trị."
              description={pageError}
              action={
                <Button size="small" onClick={() => void loadDashboard()}>
                  Thử lại
                </Button>
              }
            />
          ) : null}

          <Row gutter={[16, 16]}>
            {summaryCards.map((item) => (
              <Col xs={24} md={12} xl={8} key={item.key}>
                <Card bordered className="h-full shadow-sm">
                  <Statistic
                    title={item.title}
                    value={item.value}
                    prefix={<span style={{ color: item.color }}>{item.icon}</span>}
                    formatter={(value) => item.formatter?.(Number(value)) ?? formatDashboardNumber(Number(value))}
                    valueStyle={item.color ? { color: item.color } : undefined}
                  />
                  <Typography.Text type="secondary">{item.helper}</Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>

          <DashboardSection<PendingApprovalItem>
            title="Hợp đồng chờ phê duyệt"
            subtitle="Các hợp đồng đang cần chủ sở hữu xem xét và ra quyết định."
            items={dashboard?.pendingApprovals ?? []}
            columns={pendingApprovalColumns}
            rowKey={(item) => item.approvalId || item.contractId || "pending-approval"}
            loading={loading}
            emptyText="Không có hợp đồng nào đang chờ phê duyệt."
            scrollX={1240}
          />

          <DashboardSection<PaymentConfirmationItem>
            title="Yêu cầu chuyển khoản chờ xác nhận"
            subtitle="Các yêu cầu khách hàng đã gửi, cần đối chiếu trước khi xác nhận thanh toán."
            items={dashboard?.pendingPaymentConfirmations ?? []}
            columns={paymentConfirmationColumns}
            rowKey={(item) => item.requestId || item.invoiceId || "payment-confirmation"}
            loading={loading}
            emptyText="Không có yêu cầu chuyển khoản nào đang chờ xác nhận."
            scrollX={1290}
          />

          <DashboardSection<OverdueInvoiceItem>
            title="Hóa đơn quá hạn"
            subtitle="Các hóa đơn đã quá hạn và vẫn còn số tiền phải thu."
            items={dashboard?.overdueInvoices ?? []}
            columns={overdueInvoiceColumns}
            rowKey={(item) => item.invoiceId || "overdue-invoice"}
            loading={loading}
            emptyText="Không có hóa đơn quá hạn cần theo dõi."
            scrollX={1310}
          />

          <DashboardSection<WarehouseActionItem>
            title="Đơn cần kho xử lý"
            subtitle="Các đơn bán đang trong luồng giữ hàng, soạn hàng, giao hàng hoặc hoàn tất giao."
            items={dashboard?.warehouseActions ?? []}
            columns={warehouseActionColumns}
            rowKey={(item) => item.contractId || item.saleOrderNumber || "warehouse-action"}
            loading={loading}
            emptyText="Không có đơn bán nào cần kho xử lý."
            scrollX={1170}
          />

          <DashboardSection<MilestoneConfirmationItem>
            title="Mốc dự án chờ khách hàng xác nhận"
            subtitle="Các mốc dự án đã sẵn sàng để khách hàng xác nhận hoàn thành."
            items={dashboard?.milestoneConfirmations ?? []}
            columns={milestoneColumns}
            rowKey={(item) => item.milestoneId || item.projectId || "milestone-confirmation"}
            loading={loading}
            emptyText="Không có mốc dự án nào đang chờ khách hàng xác nhận."
            scrollX={1280}
          />
        </Space>
      }
    />
  );
};

export default DashboardPage;
