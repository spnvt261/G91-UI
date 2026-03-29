import { useEffect, useMemo, useState } from "react";
import { Button, Card, Descriptions, Form, Input, Modal, Space, Tag, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

interface DisableFormValues {
  reason: string;
}

const formatStatusTag = (status: CustomerModel["status"]) => {
  if (status === "INACTIVE") {
    return <Tag color="error">INACTIVE</Tag>;
  }

  return <Tag color="success">ACTIVE</Tag>;
};

const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const canUpdateCustomer = canPerformAction(role, "customer.update");
  const canDisableCustomer = canPerformAction(role, "customer.delete-disable");
  const { notify } = useNotify();

  const [customer, setCustomer] = useState<CustomerModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [disableForm] = Form.useForm<DisableFormValues>();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await customerService.getDetail(id);
        setCustomer(detail);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể tải chi tiết khách hàng"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const detailItems = useMemo(
    () => [
      { key: "customerCode", label: "Mã khách hàng", children: customer?.customerCode ?? "-" },
      { key: "companyName", label: "Tên công ty", children: customer?.companyName ?? "-" },
      { key: "taxCode", label: "Mã số thuế", children: customer?.taxCode ?? "-" },
      { key: "customerType", label: "Loại khách hàng", children: customer?.customerType ?? "-" },
      { key: "contactPerson", label: "Người liên hệ", children: customer?.contactPerson ?? "-" },
      { key: "email", label: "Email", children: customer?.email ?? "-" },
      { key: "phone", label: "Số điện thoại", children: customer?.phone ?? "-" },
      { key: "address", label: "Địa chỉ", children: customer?.address ?? "-" },
      { key: "priceGroup", label: "Nhóm giá", children: customer?.priceGroup ?? "-" },
      { key: "paymentTerms", label: "Điều khoản thanh toán", children: customer?.paymentTerms ?? "-" },
      { key: "creditLimit", label: "Hạn mức tín dụng", children: customer?.creditLimit != null ? toCurrency(customer.creditLimit) : "-" },
      { key: "currentDebt", label: "Công nợ hiện tại", children: customer?.currentDebt != null ? toCurrency(customer.currentDebt) : "-" },
      { key: "status", label: "Trạng thái", children: formatStatusTag(customer?.status) },
    ],
    [customer],
  );

  const handleDisableCustomer = async () => {
    if (!id || !customer || customer.status === "INACTIVE") {
      return;
    }

    try {
      const values = await disableForm.validateFields();
      setDisabling(true);
      const statusResult = await customerService.disable(id, { reason: values.reason.trim() });
      notify("Đã vô hiệu hóa khách hàng thành công.", "success");
      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              status: statusResult.status ?? "INACTIVE",
              updatedAt: statusResult.updatedAt ?? previous.updatedAt,
            }
          : previous,
      );
      setIsDisableModalOpen(false);
    } catch (err) {
      if (typeof err === "object" && err !== null && "errorFields" in err) {
        return;
      }

      notify(getErrorMessage(err, "Không thể vô hiệu hóa khách hàng"), "error");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <>
      <NoResizeScreenTemplate
        loading={loading}
        loadingText="Đang tải thông tin khách hàng..."
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <ListScreenHeaderTemplate
            title="Chi tiết khách hàng"
            className="rounded-none border-x-0 border-t-0 bg-gray-100"
            actions={
              <Space wrap>
                {canUpdateCustomer ? (
                  <Button onClick={() => navigate(ROUTE_URL.CUSTOMER_EDIT.replace(":id", id ?? ""))} disabled={!customer || disabling}>
                    Chỉnh sửa
                  </Button>
                ) : null}
                {canDisableCustomer ? (
                  <Button
                    danger
                    onClick={() => {
                      disableForm.resetFields();
                      setIsDisableModalOpen(true);
                    }}
                    disabled={!customer || customer.status === "INACTIVE" || disabling}
                  >
                    {customer?.status === "INACTIVE" ? "Đã vô hiệu" : "Vô hiệu hóa"}
                  </Button>
                ) : null}
                <Button onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} disabled={disabling}>
                  Quay lại
                </Button>
              </Space>
            }
            breadcrumb={
              <CustomBreadcrumb
                breadcrumbs={[
                  { label: "Trang chủ" },
                  { label: "Khách hàng", url: ROUTE_URL.CUSTOMER_LIST },
                  { label: "Chi tiết" },
                ]}
              />
            }
          />
        }
        body={
          <Card>
            {customer ? (
              <Descriptions bordered size="middle" column={{ xs: 1, sm: 1, md: 2 }}>
                {detailItems.map((item) => (
                  <Descriptions.Item key={item.key} label={item.label}>
                    {item.children}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : (
              <Typography.Text type="secondary">Không có dữ liệu khách hàng.</Typography.Text>
            )}
          </Card>
        }
      />

      <Modal
        title="Vô hiệu hóa khách hàng"
        open={isDisableModalOpen}
        onCancel={() => setIsDisableModalOpen(false)}
        onOk={() => void handleDisableCustomer()}
        okText="Xác nhận vô hiệu"
        okButtonProps={{ danger: true, loading: disabling }}
        cancelText="Hủy"
      >
        <p className="mb-3 text-slate-600">
          Bạn sắp vô hiệu khách hàng <strong>{customer?.companyName ?? "-"}</strong>. Vui lòng nhập lý do để tiếp tục.
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
            <Input.TextArea rows={4} placeholder="Ví dụ: Khách hàng tạm dừng hợp tác..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomerDetailPage;
