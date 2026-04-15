import { MoreOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Dropdown, Empty, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction, hasPermission } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { invoiceService } from "../../services/invoice/invoice.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import ContractStatusTag from "./components/ContractStatusTag";
import ContractSummaryCards from "./components/ContractSummaryCards";
import { formatContractCurrency, formatContractDate, getContractDisplayNumber, getContractSummary } from "./contract.ui";

const DEFAULT_PAGE_SIZE = 8;

interface CreateInvoiceFromContractFormValues {
  issueDate?: Dayjs;
  dueDate: Dayjs;
}

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
<<<<<<< HEAD
  const canViewDetail = hasPermission(role, "sale-order.detail.view");
  const canSearchSaleOrder = hasPermission(role, "sale-order.search");
=======
  const canCreateInvoice = canPerformAction(role, "invoice.create");
>>>>>>> new3
  const { notify } = useNotify();

  const [allItems, setAllItems] = useState<ContractModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [createInvoiceTarget, setCreateInvoiceTarget] = useState<ContractModel | null>(null);
  const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);
  const [createInvoiceForm] = Form.useForm<CreateInvoiceFromContractFormValues>();

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

  const openCreateInvoiceModal = useCallback(
    (contract: ContractModel) => {
      setCreateInvoiceTarget(contract);
      createInvoiceForm.setFieldsValue({
        issueDate: dayjs(),
        dueDate: undefined,
      });
    },
    [createInvoiceForm],
  );

  const closeCreateInvoiceModal = useCallback(() => {
    if (createInvoiceLoading) {
      return;
    }
    setCreateInvoiceTarget(null);
    createInvoiceForm.resetFields();
  }, [createInvoiceForm, createInvoiceLoading]);

  const handleCreateInvoiceFromContract = useCallback(
    async (values: CreateInvoiceFromContractFormValues) => {
      if (!createInvoiceTarget) {
        return;
      }

      try {
        setCreateInvoiceLoading(true);
        const created = await invoiceService.convertFromContract(createInvoiceTarget.id, {
          issueDate: values.issueDate?.format("YYYY-MM-DD"),
          dueDate: values.dueDate.format("YYYY-MM-DD"),
          status: "DRAFT",
        });
        notify("Đã tạo hóa đơn nháp từ hợp đồng. Chuyển sang màn chỉnh sửa hóa đơn.", "success");
        setCreateInvoiceTarget(null);
        createInvoiceForm.resetFields();
        navigate(ROUTE_URL.INVOICE_EDIT.replace(":id", created.id));
      } catch (error) {
        notify(getErrorMessage(error, "Không thể tạo hóa đơn từ hợp đồng."), "error");
      } finally {
        setCreateInvoiceLoading(false);
      }
    },
    [createInvoiceForm, createInvoiceTarget, navigate, notify],
  );

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
        width: 300,
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
        width: 96,
        fixed: "right",
        align: "center",
        render: (_, row) => {
          const normalizedStatus = String(row.status ?? "").trim().toUpperCase();
          const canCreateInvoiceFromContract = canCreateInvoice && normalizedStatus === "DELIVERED";
          const actionItems: MenuProps["items"] = [
            {
              key: "detail",
              label: "Chi tiết",
              onClick: () => navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", row.id)),
            },
          ];

          if (canCreateInvoiceFromContract) {
            actionItems.push({
              key: "create-invoice",
              label: "Tạo invoice",
              onClick: () => openCreateInvoiceModal(row),
            });
          }

          if (canEdit) {
            actionItems.push({
              key: "edit",
              label: "Chỉnh sửa",
              onClick: () => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", row.id)),
            });
          }

          return (
            <Dropdown menu={{ items: actionItems }} trigger={["click"]} placement="bottomRight">
              <Button
<<<<<<< HEAD
                type="link"
                disabled={!canViewDetail}
=======
                icon={<MoreOutlined />}
>>>>>>> new3
                onClick={(event) => {
                  event.stopPropagation();
                }}
              />
            </Dropdown>
          );
        },
      },
    ],
<<<<<<< HEAD
    [canEdit, canViewDetail, navigate],
=======
    [canCreateInvoice, canEdit, navigate, openCreateInvoiceModal],
>>>>>>> new3
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
    <>
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
<<<<<<< HEAD
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
                label: "Tổng hợp hợp đồng",
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
                    disabled={!canSearchSaleOrder}
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
                    disabled={!canSearchSaleOrder}
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
                    disabled={[!canSearchSaleOrder, !canSearchSaleOrder]}
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
                    disabled={!canSearchSaleOrder}
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
                    disabled={!canSearchSaleOrder}
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
                <Button onClick={handleResetFilters} disabled={!canSearchSaleOrder}>
                  Đặt lại bộ lọc
                </Button>
                <Tooltip title="Dữ liệu được lọc theo các tiêu chí hiện tại">
                  <Typography.Text type="secondary">
                    {filteredItems.length} hợp đồng phù hợp
                  </Typography.Text>
                </Tooltip>
=======
>>>>>>> new3
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
                  label: "Tổng hợp hợp đồng",
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

<<<<<<< HEAD
              <Table<ContractModel>
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={pagedItems}
                loading={{ spinning: loading, tip: "Đang tải danh sách hợp đồng..." }}
                rowClassName={() => "cursor-pointer"}
                onRow={(record) => ({
                  onClick: (event) => {
                    if (!canViewDetail) {
                      return;
                    }

                    const target = event.target as HTMLElement;
                    if (target.closest("button") || target.closest("a") || target.closest(".ant-dropdown-trigger")) {
                      return;
=======
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
>>>>>>> new3
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
                  scroll={{ x: 1320 }}
                />
              </Space>
            </Card>
          </Space>
        }
      />

      <Modal
        title={createInvoiceTarget ? `Tạo hóa đơn từ ${getContractDisplayNumber(createInvoiceTarget)}` : "Tạo hóa đơn từ hợp đồng"}
        open={Boolean(createInvoiceTarget)}
        onCancel={closeCreateInvoiceModal}
        onOk={() => createInvoiceForm.submit()}
        okText="Tạo hóa đơn nháp"
        cancelText="Đóng"
        okButtonProps={{ loading: createInvoiceLoading }}
      >
        <Form<CreateInvoiceFromContractFormValues> form={createInvoiceForm} layout="vertical" onFinish={(values) => void handleCreateInvoiceFromContract(values)}>
          <Typography.Paragraph type="secondary">
            Hệ thống sẽ tạo invoice nháp từ contract đã giao hàng, sau đó chuyển sang màn chỉnh sửa invoice để hoàn thiện thông tin.
          </Typography.Paragraph>
          <Form.Item label="Ngày xuất hóa đơn" name="issueDate">
            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Mặc định hôm nay nếu bỏ trống" />
          </Form.Item>
          <Form.Item label="Hạn thanh toán" name="dueDate" rules={[{ required: true, message: "Vui lòng chọn hạn thanh toán." }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn hạn thanh toán" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ContractListPage;
