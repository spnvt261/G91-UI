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
  { label: "Chờ duyệt", value: "PENDING_APPROVAL" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Từ chối", value: "REJECTED" },
  { label: "Đã gửi thực hiện", value: "SUBMITTED" },
  { label: "Đang xử lý", value: "PROCESSING" },
  { label: "Đã dự trữ", value: "RESERVED" },
  { label: "Đã soạn hàng", value: "PICKED" },
  { label: "Đang xuất giao", value: "IN_TRANSIT" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Hoàn tất", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
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
      const message = getErrorMessage(error, "KhÃ´ng thá»ƒ táº£i danh sÃ¡ch há»£p Ä‘á»“ng.");
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
        title: "Sá»‘ há»£p Ä‘á»“ng",
        key: "contractNumber",
        width: 230,
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{getContractDisplayNumber(row)}</Typography.Text>
            <Typography.Text type="secondary">MÃ£ há»‡ thá»‘ng: {row.id}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "BÃ¡o giÃ¡",
        key: "quotationId",
        width: 180,
        render: (_, row) => (
          <Typography.Text code>{row.quotationNumber || row.quotationId || "ChÆ°a liÃªn káº¿t"}</Typography.Text>
        ),
      },
      {
        title: "KhÃ¡ch hÃ ng",
        key: "customer",
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{row.customerName || "ChÆ°a cáº­p nháº­t tÃªn khÃ¡ch hÃ ng"}</Typography.Text>
            <Typography.Text type="secondary">{row.customerId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Tráº¡ng thÃ¡i",
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (value: ContractModel["status"]) => <ContractStatusTag status={value} />,
      },
      {
        title: "Tá»•ng tiá»n",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 180,
        align: "right",
        render: (value: number) => <Typography.Text strong>{formatContractCurrency(value)}</Typography.Text>,
      },
      {
        title: "NgÃ y táº¡o",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 160,
        render: (value?: string) => formatContractDate(value),
      },
      {
        title: "Thao tÃ¡c",
        key: "actions",
        width: 170,
        fixed: "right",
        render: (_, row) => {
          const actionItems: MenuProps["items"] = [];

          if (canEdit) {
            actionItems.push({
              key: "edit",
              label: "Chá»‰nh sá»­a",
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
                Chi tiáº¿t
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
      description="KhÃ´ng cÃ³ há»£p Ä‘á»“ng phÃ¹ há»£p vá»›i bá»™ lá»c hiá»‡n táº¡i."
    >
      {canCreateContract ? (
        <Button onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
          Äi tá»›i danh sÃ¡ch bÃ¡o giÃ¡
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
          title="Quáº£n lÃ½ há»£p Ä‘á»“ng"
          subtitle="Theo dÃµi toÃ n bá»™ vÃ²ng Ä‘á»i há»£p Ä‘á»“ng, lá»c nhanh theo tráº¡ng thÃ¡i vÃ  xá»­ lÃ½ ngay cÃ¡c há»£p Ä‘á»“ng cáº§n Æ°u tiÃªn."
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chá»§" }, { label: "Há»£p Ä‘á»“ng" }]} />}
          actions={
            <Space wrap>
              {canCreateContract ? (
                <Button onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                  Táº¡o tá»« bÃ¡o giÃ¡
                </Button>
              ) : null}
              <Button icon={<ReloadOutlined />} onClick={() => void loadList()}>
                LÃ m má»›i
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
                label: "Tá»•ng há»£p Ä‘á»“ng",
                value: summary.totalContracts,
                description: "ToÃ n bá»™ há»£p Ä‘á»“ng theo bá»™ lá»c hiá»‡n táº¡i",
              },
              {
                key: "pending",
                label: "Chá» duyá»‡t",
                value: summary.pendingContracts,
                valueColor: "#d48806",
                description: "Cáº§n owner xem xÃ©t phÃª duyá»‡t",
              },
              {
                key: "processing",
                label: "Äang hiá»‡u lá»±c / xá»­ lÃ½",
                value: summary.processingContracts,
                valueColor: "#1677ff",
                description: "Äang á»Ÿ giai Ä‘oáº¡n thá»±c thi",
              },
              {
                key: "closed",
                label: "ÄÃ£ há»§y / hoÃ n táº¥t",
                value: summary.closedContracts,
                valueColor: "#64748b",
                description: "KhÃ´ng cÃ²n thao tÃ¡c váº­n hÃ nh",
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
                    placeholder="TÃ¬m theo sá»‘ há»£p Ä‘á»“ng, khÃ¡ch hÃ ng hoáº·c mÃ£ bÃ¡o giÃ¡"
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
                    placeholder="Lá»c tráº¡ng thÃ¡i"
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
                    placeholder={["Tá»« ngÃ y táº¡o", "Äáº¿n ngÃ y táº¡o"]}
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
                    placeholder="Tá»•ng tiá»n tá»«"
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
                    placeholder="Äáº¿n"
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
                <Button onClick={handleResetFilters}>Äáº·t láº¡i bá»™ lá»c</Button>
                <Tooltip title="Dá»¯ liá»‡u Ä‘Æ°á»£c lá»c theo cÃ¡c tiÃªu chÃ­ hiá»‡n táº¡i">
                  <Typography.Text type="secondary">
                    {filteredItems.length} há»£p Ä‘á»“ng phÃ¹ há»£p
                  </Typography.Text>
                </Tooltip>
              </Space>

              {listError ? (
                <Alert
                  type="error"
                  showIcon
                  message="KhÃ´ng thá»ƒ táº£i danh sÃ¡ch há»£p Ä‘á»“ng"
                  description={listError}
                  action={
                    <Button size="small" onClick={() => void loadList()}>
                      Thá»­ láº¡i
                    </Button>
                  }
                />
              ) : null}

              <Table<ContractModel>
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={pagedItems}
                loading={{ spinning: loading, tip: "Äang táº£i danh sÃ¡ch há»£p Ä‘á»“ng..." }}
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
                  showTotal: (total, range) => `${range[0]}-${range[1]} trÃªn ${total} há»£p Ä‘á»“ng`,
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

