import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Empty, Input, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { DebtListItemModel, DebtListQuery } from "../../models/debt/debt.model";
import { debtService } from "../../services/debt/debt.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import DebtStatusTag from "./components/DebtStatusTag";
import { DEBT_STATUS_OPTIONS, formatDebtDate } from "./debt.ui";

const DEFAULT_PAGE_SIZE = 10;

const DebtListPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const role = getStoredUserRole();

  const canSendReminder = canPerformAction(role, "payment.reminder.send");
  const canConfirmSettlement = canPerformAction(role, "debt.settlement.confirm");
  const canExportCsv = role === "ACCOUNTANT";

  const [items, setItems] = useState<DebtListItemModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [exporting, setExporting] = useState(false);

  const query = useMemo<DebtListQuery>(
    () => ({
      keyword: keyword || undefined,
      status: status || undefined,
      overdueOnly: overdueOnly || undefined,
      page,
      pageSize,
      sortBy: "outstandingAmount",
      sortDir: "desc",
    }),
    [keyword, overdueOnly, page, pageSize, status],
  );

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await debtService.getList(query);
      setItems(response.items);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách công nợ.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const summary = useMemo(
    () => ({
      totalOutstanding: items.reduce((sum, item) => sum + (item.outstandingAmount ?? 0), 0),
      totalOverdue: items.reduce((sum, item) => sum + (item.overdueAmount ?? 0), 0),
      customers: items.length,
    }),
    [items],
  );

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await debtService.exportCsv(query);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "debt-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      notify("Xuất báo cáo CSV thành công.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xuất báo cáo CSV."), "error");
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<ColumnsType<DebtListItemModel>>(
    () => [
      {
        title: "Mã khách hàng",
        dataIndex: "customerCode",
        key: "customerCode",
        width: 150,
        render: (value: string | undefined, record: DebtListItemModel) => value || record.customerId || "-",
      },
      {
        title: "Tên khách hàng",
        dataIndex: "customerName",
        key: "customerName",
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Tổng dư nợ",
        dataIndex: "outstandingAmount",
        key: "outstandingAmount",
        align: "right",
        width: 170,
        render: (value: number) => <Typography.Text strong>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Nợ quá hạn",
        dataIndex: "overdueAmount",
        key: "overdueAmount",
        align: "right",
        width: 170,
        render: (value: number) => <Typography.Text style={{ color: "#d4380d" }}>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Trạng thái công nợ",
        dataIndex: "status",
        key: "status",
        width: 170,
        render: (value) => <DebtStatusTag status={value} />,
      },
      {
        title: "Lần thanh toán gần nhất",
        dataIndex: "lastPaymentDate",
        key: "lastPaymentDate",
        width: 170,
        render: (value?: string) => formatDebtDate(value),
      },
      {
        title: "Thao tác",
        key: "actions",
        fixed: "right",
        width: 270,
        render: (_, row) => (
          <Space wrap size={4}>
            <Button type="link" onClick={() => navigate(ROUTE_URL.DEBT_DETAIL.replace(":customerId", row.customerId))}>
              Chi tiết
            </Button>
            {canSendReminder ? (
              <Button size="small" onClick={() => navigate(ROUTE_URL.DEBT_DETAIL.replace(":customerId", row.customerId), { state: { tab: "reminders" } })}>
                Gửi nhắc nợ
              </Button>
            ) : null}
            {canConfirmSettlement ? (
              <Button size="small" onClick={() => navigate(ROUTE_URL.DEBT_DETAIL.replace(":customerId", row.customerId), { state: { tab: "settlement" } })}>
                Quyết toán
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [canConfirmSettlement, canSendReminder, navigate],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Danh sách công nợ"
          subtitle="Theo dõi tổng dư nợ, nợ quá hạn và trạng thái thu hồi công nợ theo từng khách hàng."
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Công nợ" }]} />}
          actions={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => void loadList()} loading={loading}>
                Làm mới
              </Button>
              {canExportCsv ? (
                <Button icon={<DownloadOutlined />} onClick={() => void handleExport()} loading={exporting}>
                  Xuất báo cáo CSV
                </Button>
              ) : null}
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Khách hàng trong trang hiện tại</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {summary.customers}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Tổng dư nợ</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {toCurrency(summary.totalOutstanding)}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Nợ quá hạn</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0, color: "#d4380d" }}>
                  {toCurrency(summary.totalOverdue)}
                </Typography.Title>
              </Card>
            </Col>
          </Row>

          <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Row gutter={[12, 12]}>
                <Col xs={24} lg={10}>
                  <Input.Search
                    allowClear
                    value={keywordInput}
                    placeholder="Tìm theo mã khách hàng, tên khách hàng, số hóa đơn"
                    enterButton="Tìm"
                    onChange={(event) => setKeywordInput(event.target.value)}
                    onSearch={(value) => {
                      setKeyword(value.trim());
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Select
                    allowClear
                    placeholder="Lọc trạng thái"
                    options={DEBT_STATUS_OPTIONS}
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                      setPage(1);
                    }}
                    className="w-full"
                  />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Select
                    value={overdueOnly ? "ONLY" : "ALL"}
                    onChange={(value) => {
                      setOverdueOnly(value === "ONLY");
                      setPage(1);
                    }}
                    options={[
                      { value: "ALL", label: "Bao gồm tất cả" },
                      { value: "ONLY", label: "Chỉ nợ quá hạn" },
                    ]}
                    className="w-full"
                  />
                </Col>
                <Col xs={24} lg={4}>
                  <Button
                    block
                    onClick={() => {
                      setKeywordInput("");
                      setKeyword("");
                      setStatus(undefined);
                      setOverdueOnly(false);
                      setPage(1);
                      setPageSize(DEFAULT_PAGE_SIZE);
                    }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </Col>
              </Row>

              {listError ? <Alert type="error" showIcon message="Không thể tải danh sách công nợ." description={listError} /> : null}

              <Table<DebtListItemModel>
                rowKey={(record) => record.customerId}
                loading={{ spinning: loading, tip: "Đang tải danh sách công nợ..." }}
                columns={columns}
                dataSource={items}
                pagination={{
                  current: page,
                  pageSize,
                  total: totalItems,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} khách hàng`,
                }}
                onChange={(pagination) => {
                  setPage(pagination.current ?? 1);
                  setPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
                }}
                scroll={{ x: 1250 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có dữ liệu công nợ phù hợp với bộ lọc hiện tại."
                    />
                  ),
                }}
              />
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default DebtListPage;
