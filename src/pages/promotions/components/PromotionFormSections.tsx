import { Alert, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Typography } from "antd";
import dayjs from "dayjs";
import { toCurrency } from "../../shared/page.utils";
import type { PromotionFormErrors, PromotionFormValues } from "../promotionForm.utils";
import { PROMOTION_STATUS_OPTIONS, PROMOTION_TYPE_OPTIONS } from "../promotion.utils";

export interface PromotionProductOption {
  label: string;
  value: string;
}

interface PromotionFormSectionsProps {
  formValues: PromotionFormValues;
  errors: PromotionFormErrors;
  productOptions: PromotionProductOption[];
  loadingProducts: boolean;
  productLoadError?: string | null;
  disabled?: boolean;
  onValuesChange: (patch: Partial<PromotionFormValues>) => void;
}

const toPickerValue = (value: string) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const PromotionFormSections = ({
  formValues,
  errors,
  productOptions,
  loadingProducts,
  productLoadError,
  disabled = false,
  onValuesChange,
}: PromotionFormSectionsProps) => {
  const discountNumber = Number(formValues.discountValue);
  const discountValueInput = Number.isFinite(discountNumber) && formValues.discountValue.trim() ? discountNumber : null;
  const isPercentage = formValues.promotionType === "PERCENTAGE";

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card bordered={false} className="shadow-sm">
        <Space direction="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
          <Typography.Title level={5} className="!mb-0">
            Thong tin co ban
          </Typography.Title>
          <Typography.Text type="secondary">Dat ten va ma chuong trinh de de quan ly khi tra cuu.</Typography.Text>
        </Space>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Ma khuyen mai (khong bat buoc)">
              <Input
                placeholder="Vi du: SALE-THANG-4"
                value={formValues.code}
                disabled={disabled}
                onChange={(event) => onValuesChange({ code: event.target.value })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Ten chuong trinh"
              validateStatus={errors.name ? "error" : ""}
              help={errors.name}
              required
            >
              <Input
                placeholder="Vi du: Uu dai thang 4 cho nhom san pham"
                value={formValues.name}
                disabled={disabled}
                onChange={(event) => onValuesChange({ name: event.target.value })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Priority" validateStatus={errors.priority ? "error" : ""} help={errors.priority}>
              <InputNumber
                className="w-full"
                min={0}
                precision={0}
                placeholder="Vi du: 10"
                value={formValues.priority ?? undefined}
                disabled={disabled}
                onChange={(value) => onValuesChange({ priority: typeof value === "number" ? value : null })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item label="Nhom khach hang ap dung">
              <Select
                mode="tags"
                allowClear
                value={formValues.customerGroups}
                disabled={disabled}
                placeholder="Nhap va Enter de them nhom khach hang"
                onChange={(value) => onValuesChange({ customerGroups: value })}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Mo ta" validateStatus={errors.description ? "error" : ""} help={errors.description}>
              <Input.TextArea
                rows={3}
                maxLength={1000}
                showCount
                value={formValues.description}
                disabled={disabled}
                onChange={(event) => onValuesChange({ description: event.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Space direction="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
          <Typography.Title level={5} className="!mb-0">
            Cau hinh uu dai
          </Typography.Title>
          <Typography.Text type="secondary">Chon hinh thuc giam gia va gia tri uu dai tuong ung.</Typography.Text>
        </Space>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Loai khuyen mai"
              validateStatus={errors.promotionType ? "error" : ""}
              help={errors.promotionType}
              required
            >
              <Select
                placeholder="Chon loai khuyen mai"
                options={PROMOTION_TYPE_OPTIONS}
                value={formValues.promotionType || undefined}
                disabled={disabled}
                onChange={(value) => onValuesChange({ promotionType: value ?? "" })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={isPercentage ? "Gia tri giam (%)" : "Gia tri giam (VND)"}
              validateStatus={errors.discountValue ? "error" : ""}
              help={
                errors.discountValue ??
                (isPercentage
                  ? "Muc giam hop le tu 0 den 100%."
                  : discountValueInput && discountValueInput > 0
                    ? `Gia tri quy doi: ${toCurrency(discountValueInput)}`
                    : "Nhap so tien giam truc tiep cho don hang.")
              }
              required
            >
              <InputNumber
                className="w-full"
                min={0}
                value={discountValueInput}
                disabled={disabled}
                step={isPercentage ? 0.5 : 1000}
                precision={isPercentage ? 2 : 0}
                max={isPercentage ? 100 : undefined}
                suffix={isPercentage ? "%" : "VND"}
                placeholder={isPercentage ? "Vi du: 15" : "Vi du: 200000"}
                onChange={(value) => onValuesChange({ discountValue: value == null ? "" : String(value) })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Trang thai"
              validateStatus={errors.status ? "error" : ""}
              help={errors.status}
              required
            >
              <Select
                placeholder="Chon trang thai"
                options={PROMOTION_STATUS_OPTIONS}
                value={formValues.status || undefined}
                disabled={disabled}
                onChange={(value) => onValuesChange({ status: value ?? "" })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Space direction="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
          <Typography.Title level={5} className="!mb-0">
            Thoi gian ap dung
          </Typography.Title>
          <Typography.Text type="secondary">Xac dinh thoi diem bat dau va ket thuc chuong trinh khuyen mai.</Typography.Text>
        </Space>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Ngay bat dau"
              validateStatus={errors.startDate ? "error" : ""}
              help={errors.startDate}
              required
            >
              <DatePicker
                className="w-full"
                value={toPickerValue(formValues.startDate)}
                disabled={disabled}
                format="DD/MM/YYYY"
                placeholder="Chon ngay bat dau"
                onChange={(value) => onValuesChange({ startDate: value ? value.format("YYYY-MM-DD") : "" })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Ngay ket thuc"
              validateStatus={errors.endDate ? "error" : ""}
              help={errors.endDate}
              required
            >
              <DatePicker
                className="w-full"
                value={toPickerValue(formValues.endDate)}
                disabled={disabled}
                format="DD/MM/YYYY"
                placeholder="Chon ngay ket thuc"
                onChange={(value) => onValuesChange({ endDate: value ? value.format("YYYY-MM-DD") : "" })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Space direction="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
          <Typography.Title level={5} className="!mb-0">
            Pham vi san pham
          </Typography.Title>
          <Typography.Text type="secondary">Chon cac san pham ap dung de chuong trinh co hieu luc dung pham vi mong muon.</Typography.Text>
        </Space>

        {productLoadError ? (
          <Alert
            type="error"
            showIcon
            message="Khong the tai danh sach san pham"
            description={productLoadError}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form.Item label="San pham ap dung">
          <Select
            mode="multiple"
            showSearch
            allowClear
            optionFilterProp="label"
            options={productOptions}
            value={formValues.productIds}
            disabled={disabled}
            loading={loadingProducts}
            placeholder={loadingProducts ? "Dang tai danh sach san pham..." : "Chon mot hoac nhieu san pham"}
            notFoundContent={loadingProducts ? "Dang tai du lieu..." : "Khong tim thay san pham phu hop"}
            onChange={(values) => onValuesChange({ productIds: values })}
          />
        </Form.Item>
      </Card>
    </Space>
  );
};

export default PromotionFormSections;
