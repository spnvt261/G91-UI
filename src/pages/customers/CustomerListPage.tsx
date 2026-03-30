import { MoreOutlined, PlusOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Button, Card, Col, Dropdown, Empty, Form, Input, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import CustomerDisableModal, { type CustomerDisableFormValues } from "./components/CustomerDisableModal";
import CustomerPageHeader from "./components/CustomerPageHeader";
import CustomerStatusTag from "./components/CustomerStatusTag";
import CustomerSummaryCards from "./components/CustomerSummaryCards";
import { CUSTOMER_STATUS_OPTIONS, getCustomerTypeLabel } from "./customer.constants";
import { displayCustomerText } from "./customer.utils";

interface CustomerSummaryState {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

interface CustomerListQueryState {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: "ACTIVE" | "INACTIVE";
}

const CustomerListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canCreateCustomer = canPerformAction(role, "customer.create");
  const canUpdateCustomer = canPerformAction(role, "customer.update");
  const canDisableCustomer = canPerformAction(role, "customer.delete-disable");
  const { notify } = useNotify();

  const [query, setQuery] = useState<CustomerListQueryState>({ page: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState<CustomerModel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CustomerSummaryState>({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [disablingId, setDisablingId] = useState<string | null>(null);
  const [disableTarget, setDisableTarget] = useState<CustomerModel | null>(null);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [disableForm] = Form.useForm<CustomerDisableFormValues>();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await customerService.getList({
        page: query.page,
        pageSize: query.pageSize,
        keyword: query.keyword,
        status: query.status,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      setItems(response.items);
      setTotalItems(response.pagination.totalItems);
    } catch (err) {
      const message = getErrorMessage(err, "Không thể tải danh sách khách hàng.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query.keyword, query.page, query.pageSize, query.status]);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const [totalResponse, activeResponse, inactiveResponse] = await Promise.all([
        customerService.getList({ page: 1, pageSize: 1, sortBy: "createdAt", sortDir: "desc" }),
        customerService.getList({ page: 1, pageSize: 1, status: "ACTIVE", sortBy: "createdAt", sortDir: "desc" }),
        customerService.getList({ page: 1, pageSize: 1, status: "INACTIVE", sortBy: "createdAt", sortDir: "desc" }),
      ]);

      setSummary({
        totalCustomers: totalResponse.pagination.totalItems,
        activeCustomers: activeResponse.pagination.totalItems,
        inactiveCustomers: inactiveResponse.pagination.totalItems,
      });
    } catch (err) {
      notify(getErrorMessage(err, "Không thể tải thống kê khách hàng."), "warning");
    } finally {
      setSummaryLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const openDisableModal = useCallback(
    (customer: CustomerModel) => {
      setDisableTarget(customer);
      disableForm.resetFields();
      setIsDisableModalOpen(true);
    },
    [disableForm],
  );

  const handleSearch = useCallback((value: string) => {
    const normalized = value.trim();
    setSearchText(value);
    setQuery((previous) => ({
      ...previous,
      page: 1,
      keyword: normalized || undefined,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchText("");
    setQuery((previous) => ({
      ...previous,
      page: 1,
      keyword: undefined,
      status: undefined,
    }));
  }, []);

  const handleDisableCustomer = async () => {
    if (!disableTarget) {
      return;
    }

    try {
      const values = await disableForm.validateFields();
      setDisablingId(disableTarget.id);
      await customerService.disable(disableTarget.id, { reason: values.reason.trim() });
      notify("Đã vô hiệu hóa khách hàng thành công.", "success");

      const wasActive = disableTarget.status !== "INACTIVE";
      setItems((previous) =>
        previous.map((item) => (item.id === disableTarget.id ? { ...item, status: "INACTIVE", updatedAt: new Date().toISOString() } : item)),
      );

      if (wasActive) {
        setSummary((previous) => ({
          ...previous,
          activeCustomers: Math.max(previous.activeCustomers - 1, 0),
          inactiveCustomers: previous.inactiveCustomers + 1,
        }));
      }

      setIsDisableModalOpen(false);
      setDisableTarget(null);
    } catch (err) {
      if (typeof err === "object" && err !== null && "errorFields" in err) {
        return;
      }

      notify(getErrorMessage(err, "Không thể vô hiệu hóa khách hàng."), "error");
    } finally {
      setDisablingId(null);
    }
  };

  const columns = useMemo<ColumnsType<CustomerModel>>(
    () => [
      {
        title: "Khách hàng",
        key: "customer",
        render: (_, row) => {
          const customerCode = row.customerCode?.trim();
          const subInfo = [row.contactPerson, row.email, row.phone].map((value) => value?.trim()).filter(Boolean) as string[];

          return (
            <Space size={12} align="start">
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#e6f4ff", color: "#1677ff" }} />
              <Space orientation="vertical" size={2}>
                <Typography.Text strong>{displayCustomerText(row.companyName)}</Typography.Text>
                <Typography.Text type="secondary">{customerCode ? `Mã khách hàng: ${customerCode}` : "Mã khách hàng: Chưa cập nhật"}</Typography.Text>
                <Typography.Text type="secondary">{subInfo.length > 0 ? subInfo.join(" • ") : "Chưa có thông tin liên hệ nổi bật."}</Typography.Text>
              </Space>
            </Space>
          );
        },
      },
      {
        title: "Mã số thuế",
        dataIndex: "taxCode",
        key: "taxCode",
        render: (value: string) => displayCustomerText(value),
      },
      {
        title: "Phân loại",
        dataIndex: "customerType",
        key: "customerType",
        render: (value: string, row) => (
          <Space orientation="vertical" size={2}>
            <Typography.Text>{getCustomerTypeLabel(value)}</Typography.Text>
            <Typography.Text type="secondary">Nhóm giá: {displayCustomerText(row.priceGroup)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Tài chính",
        key: "financial",
        render: (_, row) => (
          <Space orientation="vertical" size={2}>
            <Typography.Text>Hạn mức: {row.creditLimit != null ? toCurrency(row.creditLimit) : "Chưa thiết lập"}</Typography.Text>
            <Typography.Text type="secondary">Công nợ: {row.currentDebt != null ? toCurrency(row.currentDebt) : "Chưa cập nhật"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (value: CustomerModel["status"]) => <CustomerStatusTag status={value} />,
      },
      {
        title: "Hành động",
        key: "actions",
        width: 160,
        render: (_, row) => {
          const actionItems: MenuProps["items"] = [];

          if (canUpdateCustomer) {
            actionItems.push({
              key: "edit",
              label: "Chỉnh sửa",
              onClick: () => navigate(ROUTE_URL.CUSTOMER_EDIT.replace(":id", row.id)),
            });
          }

          if (canDisableCustomer) {
            if (actionItems.length > 0) {
              actionItems.push({ type: "divider" });
            }

            actionItems.push({
              key: "disable",
              label: row.status === "INACTIVE" ? "Đã ngừng hoạt động" : "Vô hiệu hóa",
              danger: true,
              disabled: row.status === "INACTIVE" || disablingId === row.id,
              onClick: () => openDisableModal(row),
            });
          }

          return (
            <Space>
              <Button type="link" onClick={() => navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", row.id))}>
                Xem hồ sơ
              </Button>
              {actionItems.length > 0 ? (
                <Dropdown menu={{ items: actionItems }} trigger={["click"]}>
                  <Button icon={<MoreOutlined />} loading={disablingId === row.id} />
                </Dropdown>
              ) : null}
            </Space>
          );
        },
      },
    ],
    [canDisableCustomer, canUpdateCustomer, disablingId, navigate, openDisableModal],
  );

  return (
    <>
      <NoResizeScreenTemplate
        loading={false}
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <CustomerPageHeader
            title="Quản lý khách hàng"
            // subtitle="Theo dõi danh sách khách hàng, trạng thái hợp tác và thông tin liên hệ quan trọng."
            actions={
              canCreateCustomer ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.CUSTOMER_CREATE)}>
                  Tạo khách hàng
                </Button>
              ) : undefined
            }
            breadcrumbItems={[
              { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
              { title: "Khách hàng" },
            ]}
          />
        }
        body={
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <CustomerSummaryCards
              totalCustomers={summary.totalCustomers}
              activeCustomers={summary.activeCustomers}
              inactiveCustomers={summary.inactiveCustomers}
              loading={summaryLoading}
            />

            <Card>
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} lg={12}>
                    <Input.Search
                      placeholder="Tìm theo tên công ty, mã khách hàng, email hoặc số điện thoại"
                      allowClear
                      enterButton="Tìm kiếm"
                      value={searchText}
                      prefix={<SearchOutlined />}
                      onChange={(event) => setSearchText(event.target.value)}
                      onSearch={handleSearch}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={7}>
                    <Select
                      className="w-full"
                      placeholder="Lọc theo trạng thái"
                      allowClear
                      value={query.status}
                      options={CUSTOMER_STATUS_OPTIONS}
                      onChange={(value: "ACTIVE" | "INACTIVE" | undefined) =>
                        setQuery((previous) => ({
                          ...previous,
                          page: 1,
                          status: value,
                        }))
                      }
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={5}>
                    <Button className="w-full" onClick={resetFilters}>
                      Đặt lại bộ lọc
                    </Button>
                  </Col>
                </Row>

                {listError ? <Alert type="error" showIcon message="Không thể tải danh sách khách hàng." description={listError} /> : null}

                <Table<CustomerModel>
                  rowKey="id"
                  columns={columns}
                  dataSource={items}
                  loading={{ spinning: loading, description: "Đang tải danh sách khách hàng..." }}
                  locale={{
                    emptyText: (
                      <Empty
                        description="Chưa có khách hàng phù hợp với bộ lọc hiện tại."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                  }}
                  pagination={{
                    current: query.page,
                    pageSize: query.pageSize,
                    total: totalItems,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} khách hàng`,
                  }}
                  onChange={(pagination) =>
                    setQuery((previous) => ({
                      ...previous,
                      page: pagination.current ?? previous.page,
                      pageSize: pagination.pageSize ?? previous.pageSize,
                    }))
                  }
                  scroll={{ x: 1100 }}
                />
              </Space>
            </Card>
          </Space>
        }
      />

      <CustomerDisableModal
        open={isDisableModalOpen}
        customerName={disableTarget?.companyName}
        form={disableForm}
        submitting={disablingId === disableTarget?.id}
        onCancel={() => {
          setIsDisableModalOpen(false);
          setDisableTarget(null);
        }}
        onConfirm={() => void handleDisableCustomer()}
      />
    </>
  );
};

export default CustomerListPage;
