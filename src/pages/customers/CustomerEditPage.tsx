import { SaveOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Skeleton, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { priceListService } from "../../services/pricing/price-list.service";
import { getErrorMessage } from "../shared/page.utils";
import CustomerFormSection from "./components/CustomerFormSection";
import CustomerPageHeader from "./components/CustomerPageHeader";
import { CUSTOMER_TYPE_OPTIONS } from "./customer.constants";
import { buildPriceGroupOptionsFromPriceLists, trimOrUndefined } from "./customer.utils";

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

const CustomerEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm<CustomerEditFormValues>();
  const [pageLoading, setPageLoading] = useState(false);
  const [priceGroupLoading, setPriceGroupLoading] = useState(false);
  const [priceGroupOptions, setPriceGroupOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setPageLoading(true);
        setErrorMessage(null);
        const detail = await customerService.getDetail(id);

        try {
          setPriceGroupLoading(true);
          const response = await priceListService.getList({ page: 1, size: 100, status: "ACTIVE" });
          setPriceGroupOptions(buildPriceGroupOptionsFromPriceLists(response.items, detail.priceGroup));
        } catch (lookupError) {
          setPriceGroupOptions(buildPriceGroupOptionsFromPriceLists([], detail.priceGroup));
          notify(getErrorMessage(lookupError, "Không thể tải danh sách nhóm giá từ bảng giá."), "warning");
        } finally {
          setPriceGroupLoading(false);
        }

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
        const message = getErrorMessage(err, "Không thể tải dữ liệu khách hàng để chỉnh sửa.");
        setErrorMessage(message);
        notify(message, "error");
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

      notify("Lưu thay đổi khách hàng thành công.", "success");
      navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Không thể cập nhật khách hàng."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <CustomerPageHeader
          title="Cập nhật khách hàng"
          subtitle="Điều chỉnh hồ sơ khách hàng với trải nghiệm nhập liệu đồng nhất và dễ kiểm soát."
          breadcrumbItems={[
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)}>Khách hàng</span> },
            { title: "Chỉnh sửa" },
          ]}
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã khách hàng để cập nhật." /> : null}
          {errorMessage ? <Alert type="error" showIcon message="Không thể tải dữ liệu khách hàng." description={errorMessage} /> : null}

          {pageLoading ? (
            <>
              <CustomerFormSection title="Đang tải dữ liệu" description="Vui lòng chờ trong giây lát.">
                <Skeleton active paragraph={{ rows: 4 }} />
              </CustomerFormSection>
              <CustomerFormSection title="Đang tải dữ liệu" description="Hệ thống đang chuẩn bị biểu mẫu cập nhật.">
                <Skeleton active paragraph={{ rows: 4 }} />
              </CustomerFormSection>
            </>
          ) : (
            <Form<CustomerEditFormValues> form={form} layout="vertical" onFinish={(values) => void handleUpdate(values)}>
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                <CustomerFormSection
                  title="Thông tin cơ bản"
                  description="Thông tin nhận diện doanh nghiệp của khách hàng."
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
                  description="Cập nhật thông tin liên hệ để hỗ trợ chăm sóc khách hàng chính xác."
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
                        rules={[
                          { type: "email", message: "Email không đúng định dạng." },
                          { max: 255, message: "Email tối đa 255 ký tự." },
                        ]}
                      >
                        <Input placeholder="contact@g91.com" />
                      </Form.Item>
                    </Col>
                  </Row>
                </CustomerFormSection>

                <CustomerFormSection
                  title="Thông tin thương mại và thanh toán"
                  description="Giữ đồng nhất với biểu mẫu tạo mới để thao tác chỉnh sửa nhanh và dễ hiểu."
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
                  title="Thông tin cập nhật"
                  description="Mô tả ngắn lý do chỉnh sửa để đội ngũ liên quan dễ theo dõi thay đổi."
                >
                  <Form.Item
                    name="changeReason"
                    label="Lý do cập nhật"
                    rules={[{ max: 1000, message: "Lý do cập nhật tối đa 1000 ký tự." }]}
                    extra="Không bắt buộc, nhưng nên nhập khi thay đổi thông tin quan trọng như mã số thuế, nhóm giá hoặc hạn mức tín dụng."
                  >
                    <Input.TextArea rows={4} placeholder="Ví dụ: Cập nhật người liên hệ mới theo thông báo từ khách hàng." showCount maxLength={1000} />
                  </Form.Item>
                </CustomerFormSection>

                <CustomerFormSection title="Hoàn tất" description="Xác nhận và lưu lại các thay đổi vừa cập nhật.">
                  <Row justify="space-between" align="middle" gutter={[12, 12]}>
                    <Col xs={24} md={14}>
                      <Typography.Text type="secondary">
                        Sau khi lưu thành công, hệ thống sẽ quay lại trang hồ sơ khách hàng để bạn tiếp tục theo dõi.
                      </Typography.Text>
                    </Col>
                    <Col xs={24} md={10}>
                      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                          Lưu thay đổi
                        </Button>
                        <Button onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} disabled={saving}>
                          Quay lại
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </CustomerFormSection>
              </Space>
            </Form>
          )}
        </Space>
      }
    />
  );
};

export default CustomerEditPage;
