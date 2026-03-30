import { InboxOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Form, Row, Select, Space, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import type { ReactNode } from "react";
import type { InventoryProductOption } from "../inventoryForm.utils";

interface InventoryTransactionSummaryItem {
  key: string;
  label: string;
  value: ReactNode;
}

interface InventoryTransactionFormProps<TValues extends object> {
  form: FormInstance<TValues>;
  productOptions: InventoryProductOption[];
  loadingProducts: boolean;
  productLoadError?: string | null;
  saving: boolean;
  submitLabel: string;
  onSubmit: (values: TValues) => void;
  onBack: () => void;
  sectionTwoTitle: string;
  sectionThreeTitle: string;
  sectionFourTitle: string;
  sectionTwo: ReactNode;
  sectionThree: ReactNode;
  sectionFour: ReactNode;
  helperAlert?: ReactNode;
  summaryTitle: string;
  summaryItems: InventoryTransactionSummaryItem[];
}

const InventoryTransactionForm = <TValues extends object>({
  form,
  productOptions,
  loadingProducts,
  productLoadError,
  saving,
  submitLabel,
  onSubmit,
  onBack,
  sectionTwoTitle,
  sectionThreeTitle,
  sectionFourTitle,
  sectionTwo,
  sectionThree,
  sectionFour,
  helperAlert,
  summaryTitle,
  summaryItems,
}: InventoryTransactionFormProps<TValues>) => {
  return (
    <Row gutter={[16, 16]} align="top">
      <Col xs={24} lg={16}>
        <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark="optional">
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card title="1. Chọn sản phẩm">
              {productLoadError ? (
                <Alert
                  type="error"
                  showIcon
                  message="Không thể tải danh sách sản phẩm."
                  description={productLoadError}
                  style={{ marginBottom: 12 }}
                />
              ) : null}

              <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true, message: "Vui lòng chọn sản phẩm." }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Tìm theo mã hoặc tên sản phẩm"
                  options={productOptions}
                  loading={loadingProducts}
                  disabled={loadingProducts || Boolean(productLoadError)}
                  notFoundContent={loadingProducts ? "Đang tải sản phẩm..." : "Không tìm thấy sản phẩm phù hợp"}
                />
              </Form.Item>
            </Card>

            <Card title={`2. ${sectionTwoTitle}`}>{sectionTwo}</Card>
            <Card title={`3. ${sectionThreeTitle}`}>{sectionThree}</Card>
            <Card title={`4. ${sectionFourTitle}`}>
              {helperAlert}
              {sectionFour}
            </Card>

            <Card>
              <Space wrap>
                <Button onClick={onBack}>Quay lại</Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  {submitLabel}
                </Button>
              </Space>
            </Card>
          </Space>
        </Form>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={summaryTitle} extra={<InboxOutlined style={{ color: "#94a3b8" }} />}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {summaryItems.map((item) => (
              <div key={item.key}>
                <Typography.Text type="secondary">{item.label}</Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0, marginTop: 2 }}>{item.value}</Typography.Paragraph>
              </div>
            ))}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default InventoryTransactionForm;
