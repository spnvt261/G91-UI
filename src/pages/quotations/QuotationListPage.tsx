import { MoreOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Dropdown, Empty, Layout, Space, Table, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { QuotationModel, QuotationStatus } from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import QuotationFilters from "./components/QuotationFilters";
import QuotationStatusTag from "./components/QuotationStatusTag";
import QuotationSummaryCards from "./components/QuotationSummaryCards";
import { formatQuotationCurrency, formatQuotationDate } from "./quotation.ui";

const PAGE_SIZE = 8;

interface QuotationSummaryState {
  total: number;
  draft: number;
  processing: number;
  closed: number;
  closedLabel: string;
}

const QuotationListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canCreateQuotation = canPerformAction(role, "quotation.create");
  const canCreateContract = canPerformAction(role, "contract.create");
  const isCustomerRole = role === "CUSTOMER";
  const { notify } = useNotify();

  const [items, setItems] = useState<QuotationModel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<QuotationStatus | undefined>(undefined);
  const [createdRange, setCreatedRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [summary, setSummary] = useState<QuotationSummaryState>({
    total: 0,
    draft: 0,
    processing: 0,
    closed: 0,
    closedLabel: "Đã chốt",
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fromDate = createdRange?.[0]?.format("YYYY-MM-DD");
  const toDate = createdRange?.[1]?.format("YYYY-MM-DD");

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);

      if (isCustomerRole) {
        const response = await quotationService.getCustomerList({
          page,
          pageSize,
          keyword: keyword || undefined,
          status,
          fromDate,
          toDate,
        });

        setItems(
          response.items.map((item) => ({
            id: item.id,
            quotationNumber: item.quotationNumber,
            items: [],
            totalAmount: item.totalAmount,
            status: item.status,
            validUntil: item.validUntil,
            createdAt: item.createdAt,
            actions: {
              customerCanEdit: Boolean(item.actions?.canEdit),
              accountantCanCreateContract: false,
            },
          })),
        );
        setTotal(response.pagination.totalItems);
        return;
      }

      const response = await quotationService.getManagementList({
        page,
        pageSize,
        keyword: keyword || undefined,
        status,
        fromDate,
        toDate,
      });

      setItems(
        response.items.map((item) => ({
          id: item.id,
          quotationNumber: item.quotationNumber,
          customerId: item.customerId,
          customerName: item.customerName,
          items: [],
          totalAmount: item.totalAmount,
          status: item.status,
          validUntil: item.validUntil,
          createdAt: item.createdAt,
          actions: {
            customerCanEdit: item.canEdit,
            accountantCanCreateContract: item.canCreateContract,
          },
        })),
      );
      setTotal(response.pagination.totalItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách báo giá.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, isCustomerRole, keyword, notify, page, pageSize, status, toDate]);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);

      if (isCustomerRole) {
        const payload = await quotationService.getSummary();
        setSummary({
          total: payload.total,
          draft: payload.draft,
          processing: payload.pending,
          closed: payload.converted + payload.rejected,
          closedLabel: "Đã chốt / không tiếp tục",
        });
        return;
      }

      const [totalRes, draftRes, pendingRes, approvedRes, convertedRes, rejectedRes] = await Promise.all([
        quotationService.getManagementList({ page: 1, pageSize: 1 }),
        quotationService.getManagementList({ page: 1, pageSize: 1, status: "DRAFT" }),
        quotationService.getManagementList({ page: 1, pageSize: 1, status: "PENDING" }),
        quotationService.getManagementList({ page: 1, pageSize: 1, status: "APPROVED" }),
        quotationService.getManagementList({ page: 1, pageSize: 1, status: "CONVERTED" }),
        quotationService.getManagementList({ page: 1, pageSize: 1, status: "REJECTED" }),
      ]);

      setSummary({
        total: totalRes.pagination.totalItems,
        draft: draftRes.pagination.totalItems,
        processing: pendingRes.pagination.totalItems + approvedRes.pagination.totalItems,
        closed: convertedRes.pagination.totalItems + rejectedRes.pagination.totalItems,
        closedLabel: "Đã chốt / không tiếp tục",
      });
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải thống kê báo giá.");
      setSummaryError(message);
      notify(message, "warning");
    } finally {
      setSummaryLoading(false);
    }
  }, [isCustomerRole, notify]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const columns = useMemo<ColumnsType<QuotationModel>>(() => {
    const baseColumns: ColumnsType<QuotationModel> = [
      {
        title: "Mã báo giá",
        key: "quotationNumber",
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{row.quotationNumber || row.id}</Typography.Text>
            <Typography.Text type="secondary">Hiệu lực đến: {formatQuotationDate(row.validUntil, "Chưa xác định")}</Typography.Text>
          </Space>
        ),
      },
    ];

    if (!isCustomerRole) {
      baseColumns.push({
        title: "Khách hàng",
        key: "customer",
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{row.customerName || "Chưa cập nhật tên khách hàng"}</Typography.Text>
            <Typography.Text type="secondary">{row.customerId || "-"}</Typography.Text>
          </Space>
        ),
      });
    }

    baseColumns.push(
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (value: QuotationModel["status"]) => <QuotationStatusTag status={value} />,
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 170,
        align: "right",
        render: (value: number) => <Typography.Text strong>{formatQuotationCurrency(value)}</Typography.Text>,
      },
      {
        title: "Hạn hiệu lực",
        dataIndex: "validUntil",
        key: "validUntil",
        width: 150,
        render: (value?: string) => {
          const text = formatQuotationDate(value, "Chưa cập nhật");
          return (
            <Tooltip title={value || "Chưa có hạn hiệu lực"}>
              <Typography.Text>{text}</Typography.Text>
            </Tooltip>
          );
        },
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (value?: string) => formatQuotationDate(value, "Chưa cập nhật"),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 200,
        render: (_, row) => {
          const menuItems: MenuProps["items"] = [];
          if (canCreateContract && row.actions?.accountantCanCreateContract) {
            menuItems.push({
              key: "createContract",
              label: "Tạo hợp đồng",
              onClick: () => navigate(ROUTE_URL.CONTRACT_CREATE.replace(":quotationId", row.id)),
            });
          }

          return (
            <Space>
              <Button
                type="link"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", row.id));
                }}
              >
                Xem chi tiết
              </Button>
              {menuItems.length > 0 ? (
                <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                  <Button
                    icon={<MoreOutlined />}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  />
                </Dropdown>
              ) : null}
            </Space>
          );
        },
      },
    );

    return baseColumns;
  }, [canCreateContract, isCustomerRole, navigate]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản lý báo giá"
          subtitle="Theo dõi toàn bộ báo giá, trạng thái xử lý và các hành động tiếp theo trong một màn hình tập trung."
          actions={
            canCreateQuotation ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)}>
                Tạo báo giá
              </Button>
            ) : undefined
          }
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Báo giá" }]} />}
        />
      }
      body={
        <Layout style={{ background: "transparent" }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <QuotationSummaryCards
              total={summary.total}
              draft={summary.draft}
              processing={summary.processing}
              closed={summary.closed}
              closedLabel={summary.closedLabel}
              loading={summaryLoading}
            />

            {summaryError ? (
              <Alert
                type="warning"
                showIcon
                message="Không thể tải thống kê báo giá."
                description={summaryError}
                action={
                  <Button size="small" onClick={() => void loadSummary()}>
                    Tải lại
                  </Button>
                }
              />
            ) : null}

            <Card bordered={false} className="border border-slate-200">
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <QuotationFilters
                  keyword={searchText}
                  status={status}
                  createdRange={createdRange}
                  onKeywordChange={setSearchText}
                  onKeywordSearch={(value) => {
                    setKeyword(value.trim());
                    setPage(1);
                  }}
                  onStatusChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                  onCreatedRangeChange={(value) => {
                    setCreatedRange(value);
                    setPage(1);
                  }}
                  onReset={() => {
                    setSearchText("");
                    setKeyword("");
                    setStatus(undefined);
                    setCreatedRange(null);
                    setPage(1);
                    setPageSize(PAGE_SIZE);
                  }}
                />

                {listError ? (
                  <Alert
                    type="error"
                    showIcon
                    message="Không thể tải danh sách báo giá."
                    description={listError}
                    action={
                      <Button size="small" icon={<ReloadOutlined />} onClick={() => void loadList()}>
                        Thử lại
                      </Button>
                    }
                  />
                ) : null}

                <Table<QuotationModel>
                  rowKey="id"
                  className="quotation-list-table"
                  columns={columns}
                  dataSource={items}
                  loading={{ spinning: loading, tip: "Đang tải danh sách báo giá..." }}
                  rowClassName={() => "cursor-pointer"}
                  onRow={(record) => ({
                    onClick: (event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button") || target.closest("a") || target.closest(".ant-dropdown-trigger")) {
                        return;
                      }
                      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", record.id));
                    },
                  })}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có báo giá phù hợp với bộ lọc hiện tại."
                      >
                        {canCreateQuotation ? (
                          <Button type="primary" onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)}>
                            Tạo báo giá đầu tiên
                          </Button>
                        ) : null}
                      </Empty>
                    ),
                  }}
                  pagination={{
                    current: page,
                    pageSize,
                    total,
                    position: ["bottomRight"],
                    showSizeChanger: true,
                    pageSizeOptions: [8, 16, 24, 32],
                    showTotal: (value, range) => `${range[0]}-${range[1]} trên ${value} báo giá`,
                  }}
                  onChange={(pagination) => {
                    setPage(pagination.current ?? page);
                    setPageSize(pagination.pageSize ?? pageSize);
                  }}
                  scroll={{ x: isCustomerRole ? 980 : 1180 }}
                />
              </Space>
            </Card>
          </Space>
        </Layout>
      }
    />
  );
};

export default QuotationListPage;
