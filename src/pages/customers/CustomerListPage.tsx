import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

interface DisableFormValues {
  reason: string;
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
  const [disablingId, setDisablingId] = useState<string | null>(null);
  const [disableTarget, setDisableTarget] = useState<CustomerModel | null>(null);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [disableForm] = Form.useForm<DisableFormValues>();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
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
      notify(getErrorMessage(err, "Không thể tải danh sách khách hàng"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query.keyword, query.page, query.pageSize, query.status]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const openDisableModal = useCallback((customer: CustomerModel) => {
    setDisableTarget(customer);
    disableForm.resetFields();
    setIsDisableModalOpen(true);
  }, [disableForm]);

  const handleDisableCustomer = async () => {
    if (!disableTarget) {
      return;
    }

    try {
      const values = await disableForm.validateFields();
      setDisablingId(disableTarget.id);
      await customerService.disable(disableTarget.id, { reason: values.reason.trim() });
      notify("Đã vô hiệu hóa khách hàng thành công.", "success");
      setItems((previous) =>
        previous.map((item) => (item.id === disableTarget.id ? { ...item, status: "INACTIVE", updatedAt: new Date().toISOString() } : item)),
      );
      setIsDisableModalOpen(false);
      setDisableTarget(null);
    } catch (err) {
      if (typeof err === "object" && err !== null && "errorFields" in err) {
        return;
      }

      notify(getErrorMessage(err, "Không thể vô hiệu hóa khách hàng"), "error");
    } finally {
      setDisablingId(null);
    }
  };

  const columns = useMemo<ColumnsType<CustomerModel>>(
    () => [
      {
        title: "Mã KH",
        dataIndex: "customerCode",
        key: "customerCode",
        render: (value: string | undefined) => value ?? "-",
      },
      {
        title: "Tên công ty",
        dataIndex: "companyName",
        key: "companyName",
        render: (value: string) => value || "-",
      },
      {
        title: "Mã số thuế",
        dataIndex: "taxCode",
        key: "taxCode",
        render: (value: string) => value || "-",
      },
      {
        title: "Loại khách hàng",
        dataIndex: "customerType",
        key: "customerType",
        render: (value: string) => value || "-",
      },
      {
        title: "Người liên hệ",
        dataIndex: "contactPerson",
        key: "contactPerson",
        render: (value: string | undefined) => value ?? "-",
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        render: (value: string | undefined) => value ?? "-",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (value: CustomerModel["status"]) =>
          value === "INACTIVE" ? <Tag color="error">INACTIVE</Tag> : <Tag color="success">ACTIVE</Tag>,
      },
      {
        title: "Hành động",
        key: "actions",
        width: 260,
        render: (_, row) => (
          <Space>
            <Button size="small" onClick={() => navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", row.id))}>
              Xem
            </Button>
            {canUpdateCustomer ? (
              <Button size="small" onClick={() => navigate(ROUTE_URL.CUSTOMER_EDIT.replace(":id", row.id))}>
                Sửa
              </Button>
            ) : null}
            {canDisableCustomer ? (
              <Button
                size="small"
                danger
                onClick={() => openDisableModal(row)}
                loading={disablingId === row.id}
                disabled={row.status === "INACTIVE"}
              >
                {row.status === "INACTIVE" ? "Đã vô hiệu" : "Vô hiệu"}
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [canDisableCustomer, canUpdateCustomer, disablingId, navigate, openDisableModal],
  );

  return (
    <>
      <NoResizeScreenTemplate
        loading={loading}
        loadingText="Đang tải danh sách khách hàng..."
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <ListScreenHeaderTemplate
            title="Quản lý khách hàng"
            className="rounded-none border-x-0 border-t-0 bg-gray-100"
            actions={
              canCreateCustomer ? (
                <Button type="primary" onClick={() => navigate(ROUTE_URL.CUSTOMER_CREATE)}>
                  Tạo khách hàng
                </Button>
              ) : undefined
            }
            breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Khách hàng" }]} />}
          />
        }
        body={
          <Card>
            <Row gutter={12} className="mb-4">
              <Col xs={24} md={14}>
                <Input.Search
                  placeholder="Tìm theo tên công ty, người liên hệ, email..."
                  allowClear
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  onSearch={(value) =>
                    setQuery((previous) => ({
                      ...previous,
                      page: 1,
                      keyword: value.trim() || undefined,
                    }))
                  }
                />
              </Col>
              <Col xs={24} md={10}>
                <Select
                  className="w-full"
                  placeholder="Lọc theo trạng thái"
                  allowClear
                  value={query.status}
                  options={[
                    { label: "ACTIVE", value: "ACTIVE" },
                    { label: "INACTIVE", value: "INACTIVE" },
                  ]}
                  onChange={(value: "ACTIVE" | "INACTIVE" | undefined) =>
                    setQuery((previous) => ({
                      ...previous,
                      page: 1,
                      status: value,
                    }))
                  }
                />
              </Col>
            </Row>

            <Table<CustomerModel>
              rowKey="id"
              columns={columns}
              dataSource={items}
              locale={{ emptyText: "Không có dữ liệu khách hàng." }}
              pagination={{
                current: query.page,
                pageSize: query.pageSize,
                total: totalItems,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} khách hàng`,
              }}
              onChange={(pagination) =>
                setQuery((previous) => ({
                  ...previous,
                  page: pagination.current ?? previous.page,
                  pageSize: pagination.pageSize ?? previous.pageSize,
                }))
              }
            />
          </Card>
        }
      />

      <Modal
        title="Vô hiệu hóa khách hàng"
        open={isDisableModalOpen}
        onCancel={() => {
          setIsDisableModalOpen(false);
          setDisableTarget(null);
        }}
        onOk={() => void handleDisableCustomer()}
        okText="Xác nhận vô hiệu"
        okButtonProps={{ danger: true, loading: disablingId === disableTarget?.id }}
        cancelText="Hủy"
      >
        <p className="mb-3 text-slate-600">
          Bạn sắp vô hiệu khách hàng <strong>{disableTarget?.companyName ?? "-"}</strong>. Vui lòng nhập lý do.
        </p>
        <Form<DisableFormValues> form={disableForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do vô hiệu"
            rules={[
              { required: true, message: "Vui lòng nhập lý do vô hiệu" },
              { max: 1000, message: "Lý do tối đa 1000 ký tự" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Ví dụ: Khách hàng yêu cầu ngừng hợp tác..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomerListPage;
