import { EditOutlined, StopOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Button, Card, Col, Empty, Form, Row, Skeleton, Space, Statistic, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import CustomerDisableModal, { type CustomerDisableFormValues } from "./components/CustomerDisableModal";
import CustomerInfoSection from "./components/CustomerInfoSection";
import CustomerPageHeader from "./components/CustomerPageHeader";
import CustomerStatusTag from "./components/CustomerStatusTag";
import { getCustomerTypeLabel } from "./customer.constants";
import { displayCustomerText, formatCustomerDateTime } from "./customer.utils";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [disableForm] = Form.useForm<CustomerDisableFormValues>();

  const loadCustomerDetail = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const detail = await customerService.getDetail(id);
      setCustomer(detail);
    } catch (err) {
      const message = getErrorMessage(err, "Không thể tải chi tiết khách hàng.");
      setErrorMessage(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadCustomerDetail();
  }, [loadCustomerDetail]);

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

      notify(getErrorMessage(err, "Không thể vô hiệu hóa khách hàng."), "error");
    } finally {
      setDisabling(false);
    }
  };

  const businessInfoItems = useMemo(
    () => [
      { key: "companyName", label: "Tên công ty", value: displayCustomerText(customer?.companyName) },
      { key: "customerCode", label: "Mã khách hàng", value: displayCustomerText(customer?.customerCode) },
      { key: "taxCode", label: "Mã số thuế", value: displayCustomerText(customer?.taxCode) },
      { key: "customerType", label: "Loại khách hàng", value: getCustomerTypeLabel(customer?.customerType) },
      { key: "address", label: "Địa chỉ", value: displayCustomerText(customer?.address) },
    ],
    [customer],
  );

  const contactInfoItems = useMemo(
    () => [
      { key: "contactPerson", label: "Người liên hệ", value: displayCustomerText(customer?.contactPerson) },
      { key: "phone", label: "Số điện thoại", value: displayCustomerText(customer?.phone) },
      { key: "email", label: "Email", value: displayCustomerText(customer?.email) },
    ],
    [customer],
  );

  const financialInfoItems = useMemo(
    () => [
      { key: "priceGroup", label: "Nhóm giá", value: displayCustomerText(customer?.priceGroup) },
      { key: "paymentTerms", label: "Điều khoản thanh toán", value: displayCustomerText(customer?.paymentTerms) },
      {
        key: "creditLimit",
        label: "Hạn mức tín dụng",
        value: customer?.creditLimit != null ? toCurrency(customer.creditLimit) : "Chưa thiết lập",
      },
      {
        key: "currentDebt",
        label: "Công nợ hiện tại",
        value: customer?.currentDebt != null ? toCurrency(customer.currentDebt) : "Chưa cập nhật",
      },
    ],
    [customer],
  );

  const systemInfoItems = useMemo(
    () => [
      { key: "status", label: "Trạng thái", value: <CustomerStatusTag status={customer?.status} showBadge /> },
      { key: "createdAt", label: "Ngày tạo", value: formatCustomerDateTime(customer?.createdAt) },
      { key: "updatedAt", label: "Cập nhật gần nhất", value: formatCustomerDateTime(customer?.updatedAt) },
    ],
    [customer],
  );

  const avatarLabel = displayCustomerText(customer?.companyName).charAt(0).toUpperCase();

  return (
    <>
      <NoResizeScreenTemplate
        loading={false}
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <CustomerPageHeader
            title={
              customer ? (
                <Space size={8} wrap>
                  <span>{displayCustomerText(customer.companyName)}</span>
                  <CustomerStatusTag status={customer.status} />
                </Space>
              ) : (
                "Hồ sơ khách hàng"
              )
            }
            subtitle={customer ? `Mã khách hàng: ${displayCustomerText(customer.customerCode)}` : "Xem đầy đủ thông tin doanh nghiệp và lịch sử cập nhật."}
            breadcrumbItems={[
              { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
              { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)}>Khách hàng</span> },
              { title: "Chi tiết" },
            ]}
            actions={
              <Space wrap>
                {canUpdateCustomer ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(ROUTE_URL.CUSTOMER_EDIT.replace(":id", id ?? ""))} disabled={!id || !customer || disabling}>
                    Chỉnh sửa
                  </Button>
                ) : null}
                {canDisableCustomer ? (
                  <Button
                    danger
                    icon={<StopOutlined />}
                    onClick={() => {
                      disableForm.resetFields();
                      setIsDisableModalOpen(true);
                    }}
                    disabled={!customer || customer.status === "INACTIVE" || disabling}
                  >
                    {customer?.status === "INACTIVE" ? "Đã ngừng hoạt động" : "Vô hiệu hóa"}
                  </Button>
                ) : null}
                <Button onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} disabled={disabling}>
                  Quay lại
                </Button>
              </Space>
            }
          />
        }
        body={
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã khách hàng trên đường dẫn." /> : null}
            {customer?.status === "INACTIVE" ? (
              <Alert
                type="warning"
                showIcon
                message="Khách hàng đang ngừng hoạt động"
                description="Khách hàng này đã được vô hiệu hóa. Hãy kiểm tra trước khi thực hiện các thao tác liên quan đến hợp đồng hoặc thanh toán."
              />
            ) : null}
            {errorMessage ? <Alert type="error" showIcon message="Không thể tải hồ sơ khách hàng." description={errorMessage} /> : null}

            {loading ? (
              <>
                <Card>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={12}>
                    <Card>
                      <Skeleton active paragraph={{ rows: 6 }} />
                    </Card>
                  </Col>
                  <Col xs={24} xl={12}>
                    <Card>
                      <Skeleton active paragraph={{ rows: 6 }} />
                    </Card>
                  </Col>
                </Row>
              </>
            ) : customer ? (
              <>
                <Card>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} lg={14}>
                      <Space size={16} align="start">
                        <Avatar size={64} style={{ backgroundColor: "#1677ff" }}>
                          {avatarLabel || "K"}
                        </Avatar>
                        <Space direction="vertical" size={2}>
                          <Typography.Title level={4} style={{ margin: 0 }}>
                            {displayCustomerText(customer.companyName)}
                          </Typography.Title>
                          <Typography.Text type="secondary">Người liên hệ: {displayCustomerText(customer.contactPerson)}</Typography.Text>
                          <Typography.Text type="secondary">Email: {displayCustomerText(customer.email)}</Typography.Text>
                          <Typography.Text type="secondary">Điện thoại: {displayCustomerText(customer.phone)}</Typography.Text>
                        </Space>
                      </Space>
                    </Col>
                    <Col xs={24} lg={10}>
                      <Row gutter={[12, 12]}>
                        <Col xs={12}>
                          <Statistic
                            title="Hạn mức tín dụng"
                            value={customer.creditLimit ?? 0}
                            formatter={(value) => (customer.creditLimit != null ? toCurrency(Number(value)) : "Chưa thiết lập")}
                          />
                        </Col>
                        <Col xs={12}>
                          <Statistic
                            title="Công nợ hiện tại"
                            value={customer.currentDebt ?? 0}
                            formatter={(value) => (customer.currentDebt != null ? toCurrency(Number(value)) : "Chưa cập nhật")}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>

                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={15}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <CustomerInfoSection
                        title="Thông tin doanh nghiệp"
                        description="Các thông tin pháp lý và nhận diện của khách hàng."
                        items={businessInfoItems}
                      />
                      <CustomerInfoSection
                        title="Thông tin liên hệ"
                        description="Đầu mối liên hệ chính phục vụ chăm sóc và hỗ trợ."
                        items={contactInfoItems}
                      />
                    </Space>
                  </Col>
                  <Col xs={24} xl={9}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <CustomerInfoSection
                        title="Thông tin thương mại và thanh toán"
                        description="Phục vụ quản lý giá bán, công nợ và điều khoản thanh toán."
                        items={financialInfoItems}
                        column={1}
                      />
                      <CustomerInfoSection title="Thông tin hệ thống" items={systemInfoItems} column={1} />
                    </Space>
                  </Col>
                </Row>
              </>
            ) : (
              <Card>
                <Empty description="Không tìm thấy dữ liệu khách hàng." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Card>
            )}
          </Space>
        }
      />

      <CustomerDisableModal
        open={isDisableModalOpen}
        customerName={customer?.companyName}
        form={disableForm}
        submitting={disabling}
        onCancel={() => setIsDisableModalOpen(false)}
        onConfirm={() => void handleDisableCustomer()}
      />
    </>
  );
};

export default CustomerDetailPage;
