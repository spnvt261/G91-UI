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
            Thông tin cơ bản
          </Typography.Title>
          <Typography.Text type="secondary">Đặt tên và mã chương trình để dễ quản lý khi tra cứu.</Typography.Text>
        </Space>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Mã khuyến mãi (không bắt buộc)">
              <Input
                placeholder="Ví dụ: SALE-THANG-4"
                value={formValues.code}
                disabled={disabled}
                onChange={(event) => onValuesChange({ code: event.target.value })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Tên chương trình"
              validateStatus={errors.name ? "error" : ""}
              help={errors.name}
              required
            >
              <Input
                placeholder="Ví dụ: Ưu đãi tháng 4 cho nhóm sản phẩm chiến lược"
                value={formValues.name}
                disabled={disabled}
                onChange={(event) => onValuesChange({ name: event.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Space direction="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
          <Typography.Title level={5} className="!mb-0">
            Cấu hình ưu đãi
          </Typography.Title>
          <Typography.Text type="secondary">Chọn hình thức giảm giá và giá trị ưu đãi tương ứng.</Typography.Text>
        </Space>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Loại khuyến mãi"
              validateStatus={errors.promotionType ? "error" : ""}
              help={errors.promotionType}
              required
            >
              <Select
                placeholder="Chọn loại khuyến mãi"
                options={PROMOTION_TYPE_OPTIONS}
                value={formValues.promotionType || undefined}
                disabled={disabled}
                onChange={(value) => onValuesChange({ promotionType: value ?? "" })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={isPercentage ? "Giá trị giảm (%)" : "Giá trị giảm (VNĐ)"}
              validateStatus={errors.discountValue ? "error" : ""}
              help={
                errors.discountValue ??
                (isPercentage
                  ? "Mức giảm hợp lệ từ 0 đến 100%."
                  : discountValueInput && discountValueInput > 0
                    ? `Giá trị quy đổi: ${toCurrency(discountValueInput)}`
                    : "Nhập số tiền giảm trực tiếp cho đơn hàng.")
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
                suffix={isPercentage ? "%" : "VNĐ"}
                placeholder={isPercentage ? "Ví dụ: 15" : "Ví dụ: 200000"}
                onChange={(value) => onValuesChange({ discountValue: value == null ? "" : String(value) })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Trạng thái"
              validateStatus={errors.status ? "error" : ""}
              help={errors.status}
              required
            >
              <Select
                placeholder="Chọn trạng thái"
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
            Thời gian áp dụng
          </Typography.Title>
          <Typography.Text type="secondary">Xác định thời điểm bắt đầu và kết thúc chương trình khuyến mãi.</Typography.Text>
        </Space>

        <Row gutter={[12, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Ngày bắt đầu"
              validateStatus={errors.startDate ? "error" : ""}
              help={errors.startDate}
              required
            >
              <DatePicker
                className="w-full"
                value={toPickerValue(formValues.startDate)}
                disabled={disabled}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày bắt đầu"
                onChange={(value) => onValuesChange({ startDate: value ? value.format("YYYY-MM-DD") : "" })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Ngày kết thúc"
              validateStatus={errors.endDate ? "error" : ""}
              help={errors.endDate}
              required
            >
              <DatePicker
                className="w-full"
                value={toPickerValue(formValues.endDate)}
                disabled={disabled}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày kết thúc"
                onChange={(value) => onValuesChange({ endDate: value ? value.format("YYYY-MM-DD") : "" })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Space direction="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
          <Typography.Title level={5} className="!mb-0">
            Phạm vi sản phẩm
          </Typography.Title>
          <Typography.Text type="secondary">Chọn các sản phẩm áp dụng để chương trình có hiệu lực đúng phạm vi mong muốn.</Typography.Text>
        </Space>

        {productLoadError ? (
          <Alert
            type="error"
            showIcon
            message="Không thể tải danh sách sản phẩm"
            description={productLoadError}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form.Item label="Sản phẩm áp dụng">
          <Select
            mode="multiple"
            showSearch
            allowClear
            optionFilterProp="label"
            options={productOptions}
            value={formValues.productIds}
            disabled={disabled}
            loading={loadingProducts}
            placeholder={loadingProducts ? "Đang tải danh sách sản phẩm..." : "Chọn một hoặc nhiều sản phẩm"}
            notFoundContent={loadingProducts ? "Đang tải dữ liệu..." : "Không tìm thấy sản phẩm phù hợp"}
            onChange={(values) => onValuesChange({ productIds: values })}
          />
        </Form.Item>
      </Card>
    </Space>
  );
};

export default PromotionFormSections;
