import { InfoCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Space, Switch, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { priceListService } from "../../services/pricing/price-list.service";
import { getErrorMessage } from "../shared/page.utils";
import CustomerFormSection from "./components/CustomerFormSection";
import CustomerPageHeader from "./components/CustomerPageHeader";
import { CUSTOMER_TYPE_OPTIONS } from "./customer.constants";
import { buildPriceGroupOptionsFromPriceLists, trimOrUndefined } from "./customer.utils";

interface CustomerCreateFormValues {
  companyName: string;
  taxCode: string;
  customerType: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  priceGroup?: string;
  creditLimit?: number | null;
  paymentTerms?: string;
  createPortalAccount?: boolean;
}

const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<CustomerCreateFormValues>();
  const [loading, setLoading] = useState(false);
  const [priceGroupLoading, setPriceGroupLoading] = useState(false);
  const [priceGroupOptions, setPriceGroupOptions] = useState<Array<{ label: string; value: string }>>([]);
  const { notify } = useNotify();
  const createPortalAccount = Form.useWatch("createPortalAccount", form);

  useEffect(() => {
    const loadPriceGroupOptions = async () => {
      try {
        setPriceGroupLoading(true);
        const response = await priceListService.getList({ page: 1, size: 100, status: "ACTIVE" });
        setPriceGroupOptions(buildPriceGroupOptionsFromPriceLists(response.items));
      } catch (error) {
        setPriceGroupOptions([]);
        notify(getErrorMessage(error, "Không thể tải danh sách nhóm giá từ bảng giá."), "warning");
      } finally {
        setPriceGroupLoading(false);
      }
    };

    void loadPriceGroupOptions();
  }, [notify]);

  const handleCreate = async (values: CustomerCreateFormValues) => {
    try {
      setLoading(true);
      const created = await customerService.create({
        companyName: values.companyName.trim(),
        taxCode: values.taxCode.trim(),
        customerType: values.customerType.trim(),
        address: trimOrUndefined(values.address),
        contactPerson: trimOrUndefined(values.contactPerson),
        phone: trimOrUndefined(values.phone),
        email: trimOrUndefined(values.email),
        priceGroup: trimOrUndefined(values.priceGroup),
        creditLimit: values.creditLimit ?? undefined,
        paymentTerms: trimOrUndefined(values.paymentTerms),
        createPortalAccount: Boolean(values.createPortalAccount),
      });

      notify("Tạo khách hàng thành công.", "success");
      navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", created.id));
    } catch (err) {
      if (err instanceof ApiClientError && err.fieldErrors) {
        const fieldErrors = Object.entries(err.fieldErrors)
          .filter(([field, messages]) => field !== "_global" && messages.length > 0)
          .map(([field, messages]) => ({
            name: field as keyof CustomerCreateFormValues,
            errors: messages,
          }));

        if (fieldErrors.length > 0) {
          form.setFields(fieldErrors);
        }
      }
      notify(getErrorMessage(err, "Không thể tạo khách hàng."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <CustomerPageHeader
          title="Tạo khách hàng"
          // subtitle="Thiết lập hồ sơ khách hàng mới với đầy đủ thông tin doanh nghiệp và thanh toán."
          breadcrumbItems={[
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)}>Khách hàng</span> },
            { title: "Tạo mới" },
          ]}
        />
      }
      body={
        <Form<CustomerCreateFormValues>
          form={form}
          layout="vertical"
          initialValues={{ createPortalAccount: false }}
          onFinish={(values) => void handleCreate(values)}
        >
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Alert
              type="info"
              showIcon
              message="Mẹo nhập nhanh"
              description="Ưu tiên nhập đầy đủ tên công ty, mã số thuế và loại khách hàng để hệ thống xử lý chính xác ngay từ đầu."
            />

            <CustomerFormSection
              title="Thông tin cơ bản"
              description="Thông tin nhận diện chính của khách hàng trong hệ thống."
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="companyName"
                    label="Tên công ty"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên công ty." },
                      { max: 255, message: "Tên công ty tối đa 255 ký tự." },
                    ]}
                  >
                    <Input placeholder="Ví dụ: Công ty TNHH G91" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="taxCode"
                    label="Mã số thuế"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã số thuế." },
                      { pattern: /^\d{10,13}$/, message: "Mã số thuế phải gồm 10 đến 13 chữ số." },
                    ]}
                  >
                    <Input placeholder="Ví dụ: 0312345678" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="customerType"
                    label="Loại khách hàng"
                    rules={[
                      { required: true, message: "Vui lòng chọn loại khách hàng." },
                      { max: 50, message: "Loại khách hàng tối đa 50 ký tự." },
                    ]}
                  >
                    <Select
                      placeholder="Chọn loại khách hàng"
                      options={CUSTOMER_TYPE_OPTIONS}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="address" label="Địa chỉ" rules={[{ max: 500, message: "Địa chỉ tối đa 500 ký tự." }]}>
                    <Input.TextArea rows={3} placeholder="Nhập địa chỉ công ty" />
                  </Form.Item>
                </Col>
              </Row>
            </CustomerFormSection>

            <CustomerFormSection
              title="Thông tin liên hệ"
              description="Dùng để chăm sóc khách hàng và trao đổi nghiệp vụ."
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item name="contactPerson" label="Người liên hệ" rules={[{ max: 255, message: "Tối đa 255 ký tự." }]}>
                    <Input placeholder="Ví dụ: Nguyễn Văn A" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      {
                        pattern: /^[0-9+\-()\s]{8,20}$/,
                        message: "Số điện thoại cần từ 8 đến 20 ký tự hợp lệ.",
                      },
                    ]}
                  >
                    <Input placeholder="Ví dụ: 0901234567" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="email"
                    label="Email"
                    dependencies={["createPortalAccount"]}
                    extra={createPortalAccount ? "Email này sẽ được dùng để tạo tài khoản portal cho khách hàng." : undefined}
                    rules={[
                      { type: "email", message: "Email không đúng định dạng." },
                      { max: 255, message: "Email tối đa 255 ký tự." },
                      () => ({
                        validator(_, value) {
                          if (!createPortalAccount || (typeof value === "string" && value.trim())) {
                            return Promise.resolve();
                          }

                          return Promise.reject(new Error("Vui lòng nhập email khi bật tạo tài khoản portal."));
                        },
                      }),
                    ]}
                  >
                    <Input placeholder="contact@g91.com" />
                  </Form.Item>
                </Col>
              </Row>
            </CustomerFormSection>

            <CustomerFormSection
              title="Thông tin thương mại và thanh toán"
              description="Phục vụ cấu hình nhóm giá và quản lý công nợ."
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item name="priceGroup" label="Nhóm giá" rules={[{ max: 50, message: "Nhóm giá tối đa 50 ký tự." }]}>
                    <Select
                      showSearch
                      optionFilterProp="label"
                      allowClear
                      options={priceGroupOptions}
                      loading={priceGroupLoading}
                      placeholder={priceGroupLoading ? "Đang tải nhóm giá..." : "Chọn nhóm giá"}
                      notFoundContent="Chưa có dữ liệu nhóm giá từ bảng giá."
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="creditLimit"
                    label="Hạn mức tín dụng"
                    rules={[{ type: "number", min: 0, message: "Hạn mức tín dụng phải lớn hơn hoặc bằng 0." }]}
                  >
                    <InputNumber className="w-full" min={0} placeholder="Nhập hạn mức" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item name="paymentTerms" label="Điều khoản thanh toán" rules={[{ max: 255, message: "Tối đa 255 ký tự." }]}>
                    <Input placeholder="Ví dụ: Thanh toán trong 30 ngày" />
                  </Form.Item>
                </Col>
              </Row>
            </CustomerFormSection>

            <CustomerFormSection
              title="Thiết lập tài khoản"
              description="Bật tùy chọn này nếu bạn muốn khách hàng có tài khoản truy cập portal ngay khi tạo hồ sơ."
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Form.Item name="createPortalAccount" label="Tạo tài khoản portal cho khách hàng" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>

                {createPortalAccount ? (
                  <Alert
                    type="success"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    message="Hệ thống sẽ tạo tài khoản portal sau khi lưu khách hàng."
                    description="Vui lòng kiểm tra email liên hệ để đảm bảo khách hàng nhận được thông tin đăng nhập."
                  />
                ) : (
                  <Typography.Text type="secondary">
                    Bạn có thể bật tính năng này bất cứ lúc nào trước khi bấm lưu.
                  </Typography.Text>
                )}
              </Space>
            </CustomerFormSection>

            <CustomerFormSection title="Hoàn tất" description="Kiểm tra lại thông tin trước khi lưu hồ sơ khách hàng.">
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
                <Col xs={24} md={14}>
                  <Typography.Text type="secondary">
                    Sau khi lưu thành công, hệ thống sẽ chuyển sang trang hồ sơ chi tiết của khách hàng mới tạo.
                  </Typography.Text>
                </Col>
                <Col xs={24} md={10}>
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                      Lưu khách hàng
                    </Button>
                    <Button onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} disabled={loading}>
                      Quay lại
                    </Button>
                  </Space>
                </Col>
              </Row>
            </CustomerFormSection>
          </Space>
        </Form>
      }
    />
  );
};

export default CustomerCreatePage;
