import { CalendarOutlined, DollarOutlined, FileTextOutlined, InfoCircleOutlined, WalletOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import type { Dayjs } from "dayjs";
import type { ReactNode } from "react";
import { PAYMENT_METHOD_OPTIONS } from "../payment.ui";

export interface RecordPaymentFormValues {
  amount: number;
  paidAt: Dayjs;
  method: string;
  note?: string;
}

interface RecordPaymentFormProps {
  form: FormInstance<RecordPaymentFormValues>;
  submitting: boolean;
  onSubmit: (values: RecordPaymentFormValues) => void;
  onBack: () => void;
  maxAmount?: number;
  summaryCard?: ReactNode;
}

const RecordPaymentForm = ({ form, submitting, onSubmit, onBack, maxAmount, summaryCard }: RecordPaymentFormProps) => {
  return (
    <Row gutter={[16, 16]} align="top">
      <Col xs={24} lg={16}>
        <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark="optional" initialValues={{ method: "BANK_TRANSFER" }}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Card title="Thông tin thanh toán">
              <Row gutter={[16, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="amount"
                    label={
                      <Space size={6}>
                        <DollarOutlined />
                        <span>Số tiền thanh toán</span>
                      </Space>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập số tiền thanh toán." },
                      {
                        validator: (_, value: number | undefined) => {
                          if (value == null || Number(value) <= 0) {
                            return Promise.reject(new Error("Số tiền phải lớn hơn 0."));
                          }

                          if (maxAmount != null && Number(value) > maxAmount) {
                            return Promise.reject(new Error("Số tiền không được lớn hơn số còn phải thu."));
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      className="w-full"
                      min={1}
                      step={1000}
                      addonAfter="VNĐ"
                      placeholder="Nhập số tiền khách hàng thanh toán"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="paidAt"
                    label={
                      <Space size={6}>
                        <CalendarOutlined />
                        <span>Ngày thanh toán</span>
                      </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn ngày thanh toán." }]}
                  >
                    <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày thanh toán" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="method"
                    label={
                      <Space size={6}>
                        <WalletOutlined />
                        <span>Phương thức thanh toán</span>
                      </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán." }]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn phương thức thanh toán"
                      optionFilterProp="label"
                      options={PAYMENT_METHOD_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Ghi chú nghiệp vụ" extra={<InfoCircleOutlined style={{ color: "#94a3b8" }} />}>
              <Form.Item
                name="note"
                label={
                  <Space size={6}>
                    <FileTextOutlined />
                    <span>Ghi chú</span>
                  </Space>
                }
                rules={[{ max: 500, message: "Ghi chú tối đa 500 ký tự." }]}
              >
                <Input.TextArea rows={4} maxLength={500} showCount placeholder="Bổ sung nội dung đối soát, nội dung chuyển khoản hoặc thông tin liên quan." />
              </Form.Item>
            </Card>

            <Card>
              <Space wrap>
                <Button onClick={onBack}>Quay lại</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Xác nhận ghi nhận thanh toán
                </Button>
              </Space>
              <Typography.Paragraph type="secondary" className="!mb-0 !mt-3">
                Sau khi xác nhận, hệ thống sẽ cập nhật số đã thu và trạng thái công nợ của hóa đơn.
              </Typography.Paragraph>
            </Card>
          </Space>
        </Form>
      </Col>

      <Col xs={24} lg={8}>
        {summaryCard}
      </Col>
    </Row>
  );
};

export default RecordPaymentForm;
