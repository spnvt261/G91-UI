import { MoreOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Dropdown, Empty, Input, InputNumber, Row, Select, Space, Table, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import ContractStatusTag from "./components/ContractStatusTag";
import ContractSummaryCards from "./components/ContractSummaryCards";
import { formatContractCurrency, formatContractDate, getContractDisplayNumber, getContractSummary } from "./contract.ui";

const DEFAULT_PAGE_SIZE = 8;

const CONTRACT_STATUS_OPTIONS = [
  { label: "Nháp", value: "DRAFT" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Từ chối", value: "REJECTED" },
  { label: "Đang xử lý", value: "IN_PROGRESS" },
  { label: "Đang hiệu lực", value: "ACTIVE" },
  { label: "Hoàn tất", value: "COMPLETED" },
];

const ContractListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canEdit = canPerformAction(role, "contract.update");
  const canCreateContract = canPerformAction(role, "contract.create");
  const { notify } = useNotify();

  const [allItems, setAllItems] = useState<ContractModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ContractModel["status"] | undefined>(undefined);
  const [createdRange, setCreatedRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [minTotal, setMinTotal] = useState<number | null>(null);
  const [maxTotal, setMaxTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const result = await contractService.getList({
        keyword: keyword || undefined,
        status,
      });
      setAllItems(result);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách hợp đồng.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [keyword, notify, status]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filteredItems = useMemo(() => {
    const fromTime = createdRange?.[0]?.startOf("day").valueOf();
    const toTime = createdRange?.[1]?.endOf("day").valueOf();

    return allItems.filter((item) => {
      const createdTime = item.createdAt ? new Date(item.createdAt).getTime() : undefined;
      const validDate =
        (fromTime == null || (createdTime != null && createdTime >= fromTime)) &&
        (toTime == null || (createdTime != null && createdTime <= toTime));

      const validTotal =
        (minTotal == null || item.totalAmount >= minTotal) &&
        (maxTotal == null || item.totalAmount <= maxTotal);

      return validDate && validTotal;
    });
  }, [allItems, createdRange, maxTotal, minTotal]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filteredItems.length, page, pageSize]);

  const summary = useMemo(() => getContractSummary(filteredItems), [filteredItems]);

  const columns = useMemo<ColumnsType<ContractModel>>(
    () => [
      {
        title: "Số hợp đồng",
        key: "contractNumber",
        width: 230,
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{getContractDisplayNumber(row)}</Typography.Text>
            <Typography.Text type="secondary">Mã hệ thống: {row.id}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Báo giá",
        key: "quotationId",
        width: 180,
        render: (_, row) => (
          <Typography.Text code>{row.quotationNumber || row.quotationId || "Chưa liên kết"}</Typography.Text>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{row.customerName || "Chưa cập nhật tên khách hàng"}</Typography.Text>
            <Typography.Text type="secondary">{row.customerId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (value: ContractModel["status"]) => <ContractStatusTag status={value} />,
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 180,
        align: "right",
        render: (value: number) => <Typography.Text strong>{formatContractCurrency(value)}</Typography.Text>,
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 160,
        render: (value?: string) => formatContractDate(value),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 170,
        fixed: "right",
        render: (_, row) => {
          const actionItems: MenuProps["items"] = [];

          if (canEdit) {
            actionItems.push({
              key: "edit",
              label: "Chỉnh sửa",
              onClick: () => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", row.id)),
            });
          }

          return (
            <Space size={4}>
              <Button
                type="link"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", row.id));
                }}
              >
                Chi tiết
              </Button>
              {actionItems.length > 0 ? (
                <Dropdown menu={{ items: actionItems }} trigger={["click"]}>
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
    ],
    [canEdit, navigate],
  );

  const emptyNode = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="Không có hợp đồng phù hợp với bộ lọc hiện tại."
    >
      {canCreateContract ? (
        <Button onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
          Đi tới danh sách báo giá
        </Button>
      ) : null}
    </Empty>
  );

  const handleResetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setStatus(undefined);
    setCreatedRange(null);
    setMinTotal(null);
    setMaxTotal(null);
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản lý hợp đồng"
          subtitle="Theo dõi toàn bộ vòng đời hợp đồng, lọc nhanh theo trạng thái và xử lý ngay các hợp đồng cần ưu tiên."
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Hợp đồng" }]} />}
          actions={
            <Space wrap>
              {canCreateContract ? (
                <Button onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                  Tạo từ báo giá
                </Button>
              ) : null}
              <Button icon={<ReloadOutlined />} onClick={() => void loadList()}>
                Làm mới
              </Button>
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <ContractSummaryCards
            loading={loading}
            items={[
              {
                key: "total",
                label: "Tổng hợp đồng",
                value: summary.totalContracts,
                description: "Toàn bộ hợp đồng theo bộ lọc hiện tại",
              },
              {
                key: "pending",
                label: "Chờ duyệt",
                value: summary.pendingContracts,
                valueColor: "#d48806",
                description: "Cần owner xem xét phê duyệt",
              },
              {
                key: "processing",
                label: "Đang hiệu lực / xử lý",
                value: summary.processingContracts,
                valueColor: "#1677ff",
                description: "Đang ở giai đoạn thực thi",
              },
              {
                key: "closed",
                label: "Đã hủy / hoàn tất",
                value: summary.closedContracts,
                valueColor: "#64748b",
                description: "Không còn thao tác vận hành",
              },
            ]}
          />

          <Card bordered={false} className="shadow-sm">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} lg={8}>
                  <Input.Search
                    allowClear
                    value={keywordInput}
                    placeholder="Tìm theo số hợp đồng, khách hàng hoặc mã báo giá"
                    onChange={(event) => setKeywordInput(event.target.value)}
                    onSearch={(value) => {
                      setKeyword(value.trim());
                      setPage(1);
                    }}
                  />
                </Col>

                <Col xs={24} sm={12} lg={4}>
                  <Select
                    allowClear
                    placeholder="Lọc trạng thái"
                    style={{ width: "100%" }}
                    options={CONTRACT_STATUS_OPTIONS}
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                      setPage(1);
                    }}
                  />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    value={createdRange}
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày tạo", "Đến ngày tạo"]}
                    onChange={(value) => {
                      if (!value || !value[0] || !value[1]) {
                        setCreatedRange(null);
                      } else {
                        setCreatedRange([value[0], value[1]]);
                      }
                      setPage(1);
                    }}
                  />
                </Col>

                <Col xs={24} sm={12} lg={3}>
                  <InputNumber<number>
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Tổng tiền từ"
                    value={minTotal}
                    onChange={(value) => {
                      setMinTotal(value ?? null);
                      setPage(1);
                    }}
                    formatter={(value) => `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    parser={(value) => Number(value?.replace(/\./g, "") || "0")}
                  />
                </Col>

                <Col xs={24} sm={12} lg={3}>
                  <InputNumber<number>
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Đến"
                    value={maxTotal}
                    onChange={(value) => {
                      setMaxTotal(value ?? null);
                      setPage(1);
                    }}
                    formatter={(value) => `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    parser={(value) => Number(value?.replace(/\./g, "") || "0")}
                  />
                </Col>
              </Row>

              <Space>
                <Button onClick={handleResetFilters}>Đặt lại bộ lọc</Button>
                <Tooltip title="Dữ liệu được lọc theo các tiêu chí hiện tại">
                  <Typography.Text type="secondary">
                    {filteredItems.length} hợp đồng phù hợp
                  </Typography.Text>
                </Tooltip>
              </Space>

              {listError ? (
                <Alert
                  type="error"
                  showIcon
                  message="Không thể tải danh sách hợp đồng"
                  description={listError}
                  action={
                    <Button size="small" onClick={() => void loadList()}>
                      Thử lại
                    </Button>
                  }
                />
              ) : null}

              <Table<ContractModel>
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={pagedItems}
                loading={{ spinning: loading, tip: "Đang tải danh sách hợp đồng..." }}
                rowClassName={() => "cursor-pointer"}
                onRow={(record) => ({
                  onClick: (event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button") || target.closest("a") || target.closest(".ant-dropdown-trigger")) {
                      return;
                    }

                    navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", record.id));
                  },
                })}
                locale={{ emptyText: emptyNode }}
                pagination={{
                  current: page,
                  pageSize,
                  total: filteredItems.length,
                  showSizeChanger: true,
                  pageSizeOptions: [8, 16, 24, 32],
                  position: ["bottomRight"],
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} hợp đồng`,
                }}
                onChange={(pagination) => {
                  setPage(pagination.current ?? page);
                  setPageSize(pagination.pageSize ?? pageSize);
                }}
                scroll={{ x: 1160 }}
              />
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default ContractListPage;
