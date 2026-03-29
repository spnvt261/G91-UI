import { useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Switch, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { getErrorMessage } from "../shared/page.utils";

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

const CUSTOMER_TYPE_OPTIONS = [
  { label: "RETAIL", value: "RETAIL" },
  { label: "CONTRACTOR", value: "CONTRACTOR" },
  { label: "DISTRIBUTOR", value: "DISTRIBUTOR" },
];

const trimOrUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<CustomerCreateFormValues>();
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();
  const createPortalAccount = Form.useWatch("createPortalAccount", form);

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
      notify(getErrorMessage(err, "Không thể tạo khách hàng"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tạo khách hàng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Khách hàng", url: ROUTE_URL.CUSTOMER_LIST },
                { label: "Tạo mới" },
              ]}
            />
          }
        />
      }
      body={
        <Card>
          <Typography.Paragraph className="mb-4 text-slate-600">
            Điền đầy đủ thông tin bắt buộc để tránh lỗi validate từ BE.
          </Typography.Paragraph>

          <Form<CustomerCreateFormValues>
            form={form}
            layout="vertical"
            initialValues={{ createPortalAccount: false }}
            onFinish={(values) => void handleCreate(values)}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyName"
                  label="Tên công ty"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên công ty" },
                    { max: 255, message: "Tên công ty tối đa 255 ký tự" },
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
                    { required: true, message: "Vui lòng nhập mã số thuế" },
                    { pattern: /^\d{10,13}$/, message: "Mã số thuế phải gồm 10-13 chữ số" },
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
                    { required: true, message: "Vui lòng chọn loại khách hàng" },
                    { max: 50, message: "Loại khách hàng tối đa 50 ký tự" },
                  ]}
                >
                  <Select options={CUSTOMER_TYPE_OPTIONS} placeholder="Chọn loại khách hàng" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="contactPerson" label="Người liên hệ" rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}>
                  <Input placeholder="Ví dụ: Nguyễn Văn A" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ pattern: /^[0-9+\-()\s]{8,20}$/, message: "Số điện thoại phải từ 8-20 ký tự hợp lệ" }]}
                >
                  <Input placeholder="Ví dụ: 0901234567" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  dependencies={["createPortalAccount"]}
                  rules={[
                    { type: "email", message: "Email không hợp lệ" },
                    { max: 255, message: "Email tối đa 255 ký tự" },
                    () => ({
                      validator(_, value) {
                        if (!createPortalAccount || (typeof value === "string" && value.trim())) {
                          return Promise.resolve();
                        }

                        return Promise.reject(new Error("Email là bắt buộc khi tạo tài khoản portal"));
                      },
                    }),
                  ]}
                >
                  <Input placeholder="contact@g91.com" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="priceGroup" label="Nhóm giá" rules={[{ max: 50, message: "Nhóm giá tối đa 50 ký tự" }]}>
                  <Input placeholder="Ví dụ: DEFAULT" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="creditLimit" label="Hạn mức tín dụng" rules={[{ type: "number", min: 0, message: "Hạn mức phải >= 0" }]}>
                  <InputNumber className="w-full" min={0} placeholder="0" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="paymentTerms" label="Điều khoản thanh toán" rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}>
                  <Input placeholder="Ví dụ: Thanh toán trong vòng 30 ngày" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="address" label="Địa chỉ" rules={[{ max: 500, message: "Địa chỉ tối đa 500 ký tự" }]}>
                  <Input.TextArea rows={3} placeholder="Nhập địa chỉ công ty" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="createPortalAccount" label="Tạo tài khoản portal cho khách hàng" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu khách hàng
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} disabled={loading}>
                Quay lại
              </Button>
            </Space>
          </Form>
        </Card>
      }
    />
  );
};

export default CustomerCreatePage;
