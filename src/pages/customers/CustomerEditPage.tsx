import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Row, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { getErrorMessage } from "../shared/page.utils";

interface CustomerEditFormValues {
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
  changeReason?: string;
}

const trimOrUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const CustomerEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm<CustomerEditFormValues>();
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setPageLoading(true);
        const detail = await customerService.getDetail(id);
        form.setFieldsValue({
          companyName: detail.companyName,
          taxCode: detail.taxCode,
          customerType: detail.customerType,
          address: detail.address,
          contactPerson: detail.contactPerson,
          phone: detail.phone,
          email: detail.email,
          priceGroup: detail.priceGroup,
          creditLimit: detail.creditLimit,
          paymentTerms: detail.paymentTerms,
        });
      } catch (err) {
        notify(getErrorMessage(err, "Không thể tải dữ liệu khách hàng để chỉnh sửa"), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, [form, id, notify]);

  const handleUpdate = async (values: CustomerEditFormValues) => {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      await customerService.update(id, {
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
        changeReason: trimOrUndefined(values.changeReason),
      });

      notify("Cập nhật khách hàng thành công.", "success");
      navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Không thể cập nhật khách hàng"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={pageLoading}
      loadingText="Đang tải thông tin khách hàng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Cập nhật khách hàng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Khách hàng", url: ROUTE_URL.CUSTOMER_LIST },
                { label: "Cập nhật" },
              ]}
            />
          }
        />
      }
      body={
        <Card>
          <Typography.Paragraph className="mb-4 text-slate-600">
            Trường bắt buộc theo BE: tên công ty, mã số thuế, loại khách hàng.
          </Typography.Paragraph>

          <Form<CustomerEditFormValues> form={form} layout="vertical" onFinish={(values) => void handleUpdate(values)}>
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
                  <Input />
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
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="customerType"
                  label="Loại khách hàng"
                  rules={[
                    { required: true, message: "Vui lòng nhập loại khách hàng" },
                    { max: 50, message: "Loại khách hàng tối đa 50 ký tự" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="contactPerson" label="Người liên hệ" rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ pattern: /^[0-9+\-()\s]{8,20}$/, message: "Số điện thoại phải từ 8-20 ký tự hợp lệ" }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: "email", message: "Email không hợp lệ" },
                    { max: 255, message: "Email tối đa 255 ký tự" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="priceGroup" label="Nhóm giá" rules={[{ max: 50, message: "Nhóm giá tối đa 50 ký tự" }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="creditLimit" label="Hạn mức tín dụng" rules={[{ type: "number", min: 0, message: "Hạn mức phải >= 0" }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="paymentTerms" label="Điều khoản thanh toán" rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="address" label="Địa chỉ" rules={[{ max: 500, message: "Địa chỉ tối đa 500 ký tự" }]}>
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="changeReason" label="Lý do chỉnh sửa" rules={[{ max: 1000, message: "Tối đa 1000 ký tự" }]}>
                  <Input.TextArea rows={3} placeholder="Không bắt buộc, nhưng nên điền để thuận tiện audit" />
                </Form.Item>
              </Col>
            </Row>

            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                Lưu thay đổi
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} disabled={saving}>
                Quay lại
              </Button>
            </Space>
          </Form>
        </Card>
      }
    />
  );
};

export default CustomerEditPage;
