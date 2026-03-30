import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Space, Statistic, Tag, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import type { PriceListStatus } from "../../models/pricing/price-list.model";
import PriceListItemsTable, { type PriceListItemRowView } from "./components/PriceListItemsTable";
import { formatDateVi, type PriceListProductOption } from "./priceList.ui";
import { createEmptyPriceListItem, type PriceListFormErrors, type PriceListFormItemValues, type PriceListFormValues } from "./priceListForm.utils";

interface PriceListFormSectionProps {
  title?: string;
  subtitle?: string;
  values: PriceListFormValues;
  errors: PriceListFormErrors;
  readOnly?: boolean;
  productOptions?: PriceListProductOption[];
  loadingProducts?: boolean;
  productLoadError?: string | null;
  onRetryLoadProducts?: () => void;
  onChange: (updater: (previous: PriceListFormValues) => PriceListFormValues) => void;
  onRemoveItem: (rowId: string) => void;
}

type ItemDraftErrors = {
  productId?: string;
  unitPrice?: string;
};

const STATUS_OPTIONS: Array<{ label: string; value: PriceListStatus }> = [
  { label: "Đang áp dụng", value: "ACTIVE" },
  { label: "Tạm ngừng", value: "INACTIVE" },
];

const parseAmount = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toDateValue = (value: string): Dayjs | null => {
  if (!value.trim()) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const updateItem = (
  currentItems: PriceListFormItemValues[],
  targetRowId: string,
  field: keyof Omit<PriceListFormItemValues, "rowId">,
  value: string,
): PriceListFormItemValues[] => {
  return currentItems.map((item) => (item.rowId === targetRowId ? { ...item, [field]: value } : item));
};

const PriceListFormSection = ({
  title = "Biểu mẫu bảng giá",
  subtitle = "Điền thông tin chung, phạm vi áp dụng và danh sách sản phẩm trước khi lưu.",
  values,
  errors,
  readOnly = false,
  productOptions = [],
  loadingProducts = false,
  productLoadError,
  onRetryLoadProducts,
  onChange,
  onRemoveItem,
}: PriceListFormSectionProps) => {
  const [draftProductId, setDraftProductId] = useState("");
  const [draftUnitPrice, setDraftUnitPrice] = useState<number | null>(null);
  const [draftErrors, setDraftErrors] = useState<ItemDraftErrors>({});

  const validFromDate = toDateValue(values.validFrom);
  const validToDate = toDateValue(values.validTo);
  const optionMap = useMemo(() => new Map(productOptions.map((option) => [option.value, option])), [productOptions]);
  const selectedProductIds = new Set(values.items.map((item) => item.productId.trim()).filter(Boolean));
  const availableProductOptions = productOptions.filter((option) => option.value === draftProductId || !selectedProductIds.has(option.value));
  const noAvailableProducts = !loadingProducts && !productLoadError && productOptions.length === 0;
  const noRemainingProducts = productOptions.length > 0 && selectedProductIds.size >= productOptions.length;
  const blockAddItem = readOnly || loadingProducts || noAvailableProducts || noRemainingProducts;

  const itemRows = useMemo<PriceListItemRowView[]>(() => {
    return values.items.map((item) => {
      const option = optionMap.get(item.productId);
      return {
        key: item.rowId,
        productId: item.productId,
        productCode: option?.productCode,
        productName: option?.productName,
        unitPriceVnd: parseAmount(item.unitPrice),
      };
    });
  }, [optionMap, values.items]);

  const totalProducts = values.items.length;
  const totalEstimatedValue = values.items.reduce((sum, item) => {
    const amount = parseAmount(item.unitPrice);
    return amount && amount > 0 ? sum + amount : sum;
  }, 0);
  const effectivePeriodText = values.validFrom && values.validTo ? `${formatDateVi(values.validFrom)} - ${formatDateVi(values.validTo)}` : "Chưa thiết lập";

  const clearDraftError = (field: keyof ItemDraftErrors) => {
    setDraftErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleAddItem = () => {
    if (blockAddItem) {
      return;
    }

    const nextErrors: ItemDraftErrors = {};
    const productId = draftProductId.trim();

    if (!productId) {
      nextErrors.productId = "Vui lòng chọn sản phẩm.";
    } else if (values.items.some((item) => item.productId.trim() === productId)) {
      nextErrors.productId = "Sản phẩm đã có trong bảng giá.";
    }

    if (!draftUnitPrice || draftUnitPrice <= 0) {
      nextErrors.unitPrice = "Đơn giá phải lớn hơn 0.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setDraftErrors(nextErrors);
      return;
    }

    const newItem = createEmptyPriceListItem();
    onChange((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          ...newItem,
          productId,
          unitPrice: String(draftUnitPrice),
        },
      ],
    }));

    setDraftProductId("");
    setDraftUnitPrice(null);
    setDraftErrors({});
  };

  const itemValidationRows = values.items
    .map((item, index) => ({
      index: index + 1,
      productError: errors.itemProductMap?.[item.rowId],
      unitPriceError: errors.itemUnitPriceMap?.[item.rowId],
    }))
    .filter((row) => row.productError || row.unitPriceError);

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card>
        <Space orientation="vertical" size={4}>
          <Typography.Title level={4} style={{ marginBottom: 0 }}>
            {title}
          </Typography.Title>
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        </Space>
      </Card>

      <Card title="1. Thông tin chung">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Tên bảng giá"
                required
                validateStatus={errors.name ? "error" : undefined}
                help={errors.name}
              >
                <Input
                  placeholder="Ví dụ: Bảng giá dự án quý II/2026"
                  value={values.name}
                  disabled={readOnly}
                  onChange={(event) => onChange((previous) => ({ ...previous, name: event.target.value }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label="Nhóm khách hàng áp dụng">
                <Input
                  placeholder="Ví dụ: Đại lý cấp 1, khách doanh nghiệp"
                  value={values.customerGroup}
                  disabled={readOnly}
                  onChange={(event) => onChange((previous) => ({ ...previous, customerGroup: event.target.value }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="2. Nhóm áp dụng và thời gian hiệu lực">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Hiệu lực từ"
                required
                validateStatus={errors.validFrom ? "error" : undefined}
                help={errors.validFrom}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày bắt đầu"
                  value={validFromDate}
                  disabled={readOnly}
                  onChange={(dateValue) =>
                    onChange((previous) => ({
                      ...previous,
                      validFrom: dateValue ? dateValue.format("YYYY-MM-DD") : "",
                    }))
                  }
                  disabledDate={(current) => (validToDate ? current.endOf("day").isAfter(validToDate.endOf("day")) : false)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Hiệu lực đến"
                required
                validateStatus={errors.validTo ? "error" : undefined}
                help={errors.validTo}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày kết thúc"
                  value={validToDate}
                  disabled={readOnly}
                  onChange={(dateValue) =>
                    onChange((previous) => ({
                      ...previous,
                      validTo: dateValue ? dateValue.format("YYYY-MM-DD") : "",
                    }))
                  }
                  disabledDate={(current) => (validFromDate ? current.startOf("day").isBefore(validFromDate.startOf("day")) : false)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="3. Danh sách sản phẩm và đơn giá"
        extra={
          <Space size={8}>
            <Tag color="blue">{`Đã thêm ${totalProducts} sản phẩm`}</Tag>
          </Space>
        }
      >
        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
          {productLoadError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải danh sách sản phẩm"
              description={
                <Space orientation="vertical" size={8}>
                  <Typography.Text>{productLoadError}</Typography.Text>
                  {onRetryLoadProducts ? (
                    <Button icon={<ReloadOutlined />} onClick={onRetryLoadProducts} loading={loadingProducts}>
                      Thử tải lại
                    </Button>
                  ) : null}
                </Space>
              }
            />
          ) : null}

          {!readOnly ? (
            <Row gutter={[12, 12]} align="bottom">
              <Col xs={24} xl={12}>
                <Form.Item
                  label="Chọn sản phẩm"
                  required
                  validateStatus={draftErrors.productId ? "error" : undefined}
                  help={draftErrors.productId}
                >
                  <Select<string>
                    showSearch
                    optionFilterProp="label"
                    loading={loadingProducts}
                    value={draftProductId || undefined}
                    options={availableProductOptions}
                    placeholder={
                      loadingProducts
                        ? "Đang tải sản phẩm..."
                        : noRemainingProducts
                          ? "Tất cả sản phẩm đã được thêm"
                          : "Chọn sản phẩm để thêm vào bảng giá"
                    }
                    disabled={blockAddItem}
                    onChange={(value) => {
                      setDraftProductId(value);
                      clearDraftError("productId");
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={14} xl={7}>
                <Form.Item
                  label="Đơn giá (VND)"
                  required
                  validateStatus={draftErrors.unitPrice ? "error" : undefined}
                  help={draftErrors.unitPrice}
                >
                  <InputNumber<number>
                    className="w-full"
                    min={1}
                    precision={0}
                    placeholder="Ví dụ: 125000"
                    value={draftUnitPrice ?? undefined}
                    disabled={blockAddItem}
                    onChange={(value) => {
                      setDraftUnitPrice(typeof value === "number" ? value : null);
                      clearDraftError("unitPrice");
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={10} xl={5}>
                <Button
                  type="primary"
                  className="w-full"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  disabled={blockAddItem}
                >
                  Thêm sản phẩm
                </Button>
              </Col>
            </Row>
          ) : null}

          {noAvailableProducts ? (
            <Alert
              type="info"
              showIcon
              message="Không có sản phẩm đang hoạt động"
              description="Hiện chưa có sản phẩm khả dụng để thêm vào bảng giá."
            />
          ) : null}

          <PriceListItemsTable
            items={itemRows}
            editableUnitPrice={!readOnly}
            unitPriceErrors={errors.itemUnitPriceMap}
            onUnitPriceChange={
              readOnly
                ? undefined
                : (rowId, value) => {
                    onChange((previous) => ({
                      ...previous,
                      items: updateItem(previous.items, rowId, "unitPrice", value ? String(value) : ""),
                    }));
                  }
            }
            onRemoveItem={readOnly ? undefined : onRemoveItem}
            emptyDescription="Chưa có sản phẩm nào trong bảng giá."
          />

          {itemValidationRows.length > 0 ? (
            <Alert
              type="error"
              showIcon
              message="Danh sách sản phẩm còn dữ liệu chưa hợp lệ"
              description={
                <Space orientation="vertical" size={2}>
                  {itemValidationRows.map((row) => (
                    <Typography.Text key={`item-validation-${row.index}`}>
                      Sản phẩm #{row.index}: {[row.productError, row.unitPriceError].filter(Boolean).join(" ")}
                    </Typography.Text>
                  ))}
                </Space>
              }
            />
          ) : null}

          {errors.items ? <Alert type="error" showIcon message={errors.items} /> : null}
        </Space>
      </Card>

      <Card title="4. Trạng thái áp dụng">
        <Form layout="vertical">
          <Form.Item label="Trạng thái bảng giá">
            <Select<PriceListStatus>
              value={values.status}
              disabled={readOnly}
              options={STATUS_OPTIONS}
              onChange={(status) => onChange((previous) => ({ ...previous, status }))}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Tóm tắt trước khi lưu">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Statistic title="Số sản phẩm đã thêm" value={totalProducts} />
          </Col>
          <Col xs={24} md={8}>
            <Statistic title="Tổng đơn giá tham chiếu" value={totalEstimatedValue} suffix="VND" />
          </Col>
          <Col xs={24} md={8}>
            <Statistic title="Khoảng hiệu lực" value={effectivePeriodText} />
          </Col>
        </Row>
        <Divider />
        <Typography.Text type="secondary">
          Mẹo: kiểm tra kỹ nhóm khách hàng, thời gian hiệu lực và đơn giá trước khi lưu để tránh phải chỉnh sửa lại nhiều lần.
        </Typography.Text>
      </Card>
    </Space>
  );
};

export default PriceListFormSection;
