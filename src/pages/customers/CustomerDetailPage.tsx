import { EditOutlined, StopOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Card, Col, Empty, Form, List, Row, Space, Statistic, Tag, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { CustomerDetailModel, CustomerSummaryResponse } from "../../models/customer/customer.model";
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

  const [detail, setDetail] = useState<CustomerDetailModel | null>(null);
  const [summary, setSummary] = useState<CustomerSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [disableForm] = Form.useForm<CustomerDisableFormValues>();

  const customer = detail?.customer ?? null;

  const loadCustomerDetail = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSummaryError(null);

      const detailResponse = await customerService.getDetail(id);
      setDetail(detailResponse);

      try {
        const summaryResponse = await customerService.getSummary(id);
        setSummary(summaryResponse);
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải tóm tắt khách hàng.");
        setSummaryError(message);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết khách hàng.");
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
      setDetail((previous) =>
        previous
          ? {
              ...previous,
              customer: {
                ...previous.customer,
                status: statusResult.status ?? "INACTIVE",
                updatedAt: statusResult.updatedAt ?? previous.customer.updatedAt,
              },
            }
          : previous,
      );
      setSummary((previous) =>
        previous
          ? {
              ...previous,
              status: statusResult.status ?? "INACTIVE",
              canDisable: false,
            }
          : previous,
      );
      setIsDisableModalOpen(false);
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }

      if (error instanceof ApiClientError && error.fieldErrors?.reason?.length) {
        disableForm.setFields([
          {
            name: "reason",
            errors: error.fieldErrors.reason,
          },
        ]);
      }

      notify(getErrorMessage(error, "Không thể vô hiệu hóa khách hàng."), "error");
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
      { key: "email", label: "Thư điện tử", value: displayCustomerText(customer?.email) },
    ],
    [customer],
  );

  const financeAndActivityItems = useMemo(
    () => [
      { key: "creditLimit", label: "Hạn mức tín dụng", value: summary?.creditLimit != null ? toCurrency(summary.creditLimit) : "Chưa thiết lập" },
      { key: "paymentTerms", label: "Điều khoản thanh toán", value: displayCustomerText(summary?.paymentTerms ?? customer?.paymentTerms) },
      { key: "currentDebt", label: "Công nợ hiện tại", value: summary?.outstandingDebt != null ? toCurrency(summary.outstandingDebt) : "Chưa cập nhật" },
      { key: "invoiceCount", label: "Số hóa đơn", value: summary?.invoiceCount ?? 0 },
      { key: "contractCount", label: "Số hợp đồng", value: summary?.contractCount ?? 0 },
      { key: "projectCount", label: "Số dự án", value: summary?.projectCount ?? 0 },
      { key: "activeProjectCount", label: "Số dự án đang hoạt động", value: summary?.activeProjectCount ?? 0 },
      { key: "openContractCount", label: "Số hợp đồng mở", value: summary?.openContractCount ?? 0 },
      {
        key: "canDisable",
        label: "Có thể vô hiệu hóa",
        value: summary?.canDisable == null ? "Chưa xác định" : summary.canDisable ? "Có" : "Không",
      },
    ],
    [customer?.paymentTerms, summary],
  );

  const systemInfoItems = useMemo(
    () => [
      { key: "status", label: "Trạng thái", value: <CustomerStatusTag status={customer?.status} showBadge /> },
      { key: "createdAt", label: "Ngày tạo", value: formatCustomerDateTime(customer?.createdAt) },
      { key: "updatedAt", label: "Cập nhật gần nhất", value: formatCustomerDateTime(customer?.updatedAt) },
      { key: "lastTransactionAt", label: "Giao dịch gần nhất", value: formatCustomerDateTime(summary?.lastTransactionAt) },
    ],
    [customer, summary?.lastTransactionAt],
  );

  const avatarLabel = displayCustomerText(customer?.companyName).charAt(0).toUpperCase();

  return (
    <>
      <NoResizeScreenTemplate
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
                "Chi tiết khách hàng"
              )
            }
            subtitle={customer ? `Mã khách hàng: ${displayCustomerText(customer.customerCode)}` : "Theo dõi thông tin hồ sơ và công nợ khách hàng."}
            breadcrumbItems={[
              { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
              { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)}>Khách hàng</span> },
              { title: "Chi tiết" },
            ]}
            actions={
              <Space wrap>
                {canUpdateCustomer ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(ROUTE_URL.CUSTOMER_EDIT.replace(":id", id ?? ""))} disabled={!id || !customer || disabling}>
                    Cập nhật
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
                    disabled={!customer || customer.status === "INACTIVE" || disabling || summary?.canDisable === false}
                  >
                    {customer?.status === "INACTIVE" ? "Đã vô hiệu hóa" : "Vô hiệu hóa"}
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
                message="Khách hàng đang ở trạng thái vô hiệu hóa."
                description="Các thao tác nghiệp vụ như tạo hợp đồng/hóa đơn mới có thể bị hạn chế."
              />
            ) : null}
            {summary?.disableBlockers?.length ? (
              <Alert
                type="warning"
                showIcon
                message="Danh sách lý do chặn vô hiệu hóa"
                description={
                  <Space size={[6, 6]} wrap>
                    {summary.disableBlockers.map((item) => (
                      <Tag color="orange" key={item}>
                        {item}
                      </Tag>
                    ))}
                  </Space>
                }
              />
            ) : null}
            {errorMessage ? <Alert type="error" showIcon message="Không thể tải hồ sơ khách hàng." description={errorMessage} /> : null}
            {summaryError ? <Alert type="warning" showIcon message="Không thể tải dữ liệu tóm tắt khách hàng." description={summaryError} /> : null}

            {loading ? (
              <Card loading />
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
                          <Typography.Text type="secondary">Thư điện tử: {displayCustomerText(customer.email)}</Typography.Text>
                          <Typography.Text type="secondary">Điện thoại: {displayCustomerText(customer.phone)}</Typography.Text>
                        </Space>
                      </Space>
                    </Col>
                    <Col xs={24} lg={10}>
                      <Row gutter={[12, 12]}>
                        <Col xs={12}>
                          <Statistic title="Hạn mức tín dụng" value={summary?.creditLimit ?? customer.creditLimit ?? 0} formatter={(value) => toCurrency(Number(value))} />
                        </Col>
                        <Col xs={12}>
                          <Statistic title="Công nợ hiện tại" value={summary?.outstandingDebt ?? customer.currentDebt ?? 0} formatter={(value) => toCurrency(Number(value))} />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>

                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={15}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <CustomerInfoSection title="Thông tin doanh nghiệp" items={businessInfoItems} />
                      <CustomerInfoSection title="Thông tin liên hệ" items={contactInfoItems} />
                    </Space>
                  </Col>
                  <Col xs={24} xl={9}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <CustomerInfoSection title="Tóm tắt tài chính và hoạt động" items={financeAndActivityItems} column={1} />
                      <CustomerInfoSection title="Thông tin hệ thống" items={systemInfoItems} column={1} />
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={8}>
                    <Card title="Danh sách người liên hệ">
                      {detail?.contactPersons?.length ? (
                        <List
                          size="small"
                          dataSource={detail.contactPersons}
                          renderItem={(item) => (
                            <List.Item>
                              <Space direction="vertical" size={0}>
                                <Typography.Text strong>
                                  {displayCustomerText(item.fullName)} {item.primary ? <Tag color="blue">Liên hệ chính</Tag> : null}
                                </Typography.Text>
                                <Typography.Text type="secondary">{displayCustomerText(item.phone)}</Typography.Text>
                                <Typography.Text type="secondary">{displayCustomerText(item.email)}</Typography.Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu người liên hệ." />
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} xl={8}>
                    <Card title="Giao dịch gần đây">
                      {detail?.recentTransactions?.length ? (
                        <List
                          size="small"
                          dataSource={detail.recentTransactions}
                          renderItem={(item) => (
                            <List.Item>
                              <Space direction="vertical" size={0}>
                                <Typography.Text strong>{displayCustomerText(item.referenceNo)}</Typography.Text>
                                <Typography.Text type="secondary">
                                  {[displayCustomerText(item.type), displayCustomerText(item.status)].join(" • ")}
                                </Typography.Text>
                                <Typography.Text type="secondary">
                                  {item.amount != null ? toCurrency(item.amount) : "Chưa cập nhật"} • {formatCustomerDateTime(item.eventAt)}
                                </Typography.Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có giao dịch gần đây." />
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} xl={8}>
                    <Card title="Tài liệu khách hàng">
                      {detail?.documents?.length ? (
                        <List
                          size="small"
                          dataSource={detail.documents}
                          renderItem={(item) => (
                            <List.Item>
                              <Space direction="vertical" size={0}>
                                <Typography.Text strong>{displayCustomerText(item.fileName)}</Typography.Text>
                                <Typography.Text type="secondary">
                                  {[displayCustomerText(item.type), formatCustomerDateTime(item.uploadedAt)].join(" • ")}
                                </Typography.Text>
                                {item.fileUrl ? (
                                  <Typography.Link href={item.fileUrl} target="_blank">
                                    Mở tài liệu
                                  </Typography.Link>
                                ) : null}
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tài liệu." />
                      )}
                    </Card>
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
        outstandingDebt={summary?.outstandingDebt ?? customer?.currentDebt}
        activeProjectCount={summary?.activeProjectCount}
        openContractCount={summary?.openContractCount}
        disableBlockers={summary?.disableBlockers}
        form={disableForm}
        submitting={disabling}
        onCancel={() => setIsDisableModalOpen(false)}
        onConfirm={() => void handleDisableCustomer()}
      />
    </>
  );
};

export default CustomerDetailPage;
