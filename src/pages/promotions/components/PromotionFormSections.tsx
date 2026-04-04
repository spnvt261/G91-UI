import { DeleteOutlined, EyeOutlined, PictureOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Flex, Form, Input, InputNumber, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../../const/route_url.const";
import ProductImage from "../../products/components/ProductImage";
import { toCurrency } from "../../shared/page.utils";
import type { PromotionFormErrors, PromotionFormValues } from "../promotionForm.utils";
import { PROMOTION_STATUS_OPTIONS, PROMOTION_TYPE_OPTIONS } from "../promotion.utils";

export interface PromotionProductOption {
  label: string;
  value: string;
  productCode?: string;
  productName?: string;
  type?: string;
  size?: string;
  thickness?: string;
  unit?: string;
  mainImage?: string;
  imageUrls?: string[];
  images?: string[];
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

interface PromotionSelectedProductRow {
  key: string;
  productId: string;
  productCode: string;
  productName: string;
  productMeta?: string;
  unit?: string;
  imageUrl?: string;
}

const toPickerValue = (value: string) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const getProductImage = (item: PromotionProductOption): string | undefined =>
  item.mainImage || item.imageUrls?.[0] || item.images?.[0];

const PromotionFormSections = ({
  formValues,
  errors,
  productOptions,
  loadingProducts,
  productLoadError,
  disabled = false,
  onValuesChange,
}: PromotionFormSectionsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const discountNumber = Number(formValues.discountValue);
  const discountValueInput = Number.isFinite(discountNumber) && formValues.discountValue.trim() ? discountNumber : null;
  const isPercentage = formValues.promotionType === "PERCENTAGE";
  const selectedProductIds = formValues.productIds ?? [];
  const [pendingProductId, setPendingProductId] = useState<string | undefined>(undefined);
  const isEditMode = useMemo(() => new URLSearchParams(location.search).get("mode") === "edit", [location.search]);

  const navigateToProductDetail = (productId: string) => {
    navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", productId), {
      state: {
        returnTo: `${location.pathname}${location.search}`,
        returnLabel: "Quay lại khuyến mãi",
        restoreDraft: {
          formValues,
          editMode: isEditMode,
        },
      },
    });
  };

  const productOptionMap = useMemo(() => new Map(productOptions.map((item) => [item.value, item])), [productOptions]);

  const handleAddProduct = () => {
    if (!pendingProductId) {
      return;
    }

    if (selectedProductIds.includes(pendingProductId)) {
      setPendingProductId(undefined);
      return;
    }

    onValuesChange({
      productIds: [...selectedProductIds, pendingProductId],
    });
    setPendingProductId(undefined);
  };

  const selectedProductRows = useMemo<PromotionSelectedProductRow[]>(
    () =>
      selectedProductIds.map((productId, index) => {
        const selected = productOptionMap.get(productId);
        return {
          key: productId,
          productId,
          productCode: selected?.productCode || selected?.label?.split(" - ")?.[0] || productId,
          productName: selected?.productName || selected?.label?.split(" - ")?.slice(1).join(" - ") || `Sản phẩm #${index + 1}`,
          productMeta: [selected?.type, selected?.size, selected?.thickness].filter(Boolean).join(" • "),
          unit: selected?.unit || "-",
          imageUrl: selected ? getProductImage(selected) : undefined,
        };
      }),
    [productOptionMap, selectedProductIds],
  );

  const selectedProductColumns = useMemo<ColumnsType<PromotionSelectedProductRow>>(
    () => [
      {
        title: "Sản phẩm",
        key: "product",
        render: (_, row) => (
          <Space size={10} align="start">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "#f5f5f5",
              }}
            >
              {row.imageUrl ? (
                <ProductImage
                  src={row.imageUrl}
                  alt={row.productName}
                  preview={false}
                  width={42}
                  height={42}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <PictureOutlined style={{ color: "#8c8c8c" }} />
              )}
            </div>

            <Space direction="vertical" size={2}>
              <Typography.Text strong>{row.productName}</Typography.Text>
              <Typography.Text type="secondary">{row.productCode}</Typography.Text>
              {row.productMeta ? <Typography.Text type="secondary">{row.productMeta}</Typography.Text> : null}
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                style={{ paddingInline: 0 }}
                onClick={() => {
                  navigateToProductDetail(row.productId);
                }}
              >
                Xem chi tiết
              </Button>
            </Space>
          </Space>
        ),
      },
      {
        title: "Đơn vị",
        dataIndex: "unit",
        key: "unit",
        width: 120,
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 120,
        align: "center",
        render: (_, row) => (
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={disabled}
            onClick={() => {
              onValuesChange({
                productIds: selectedProductIds.filter((item) => item !== row.productId),
              });
            }}
          >
            Bỏ chọn
          </Button>
        ),
      },
    ],
    [disabled, navigateToProductDetail, onValuesChange, selectedProductIds],
  );

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card variant="borderless" className="shadow-sm">
        <Space orientation="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
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
                placeholder="Ví dụ: Ưu đãi tháng 4 cho nhóm sản phẩm"
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
                placeholder="Ví dụ: 10"
                value={formValues.priority ?? undefined}
                disabled={disabled}
                onChange={(value) => onValuesChange({ priority: typeof value === "number" ? value : null })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item label="Nhóm khách hàng áp dụng">
              <Select
                mode="tags"
                allowClear
                value={formValues.customerGroups}
                disabled={disabled}
                placeholder="Nhập và Enter để thêm nhóm khách hàng"
                onChange={(value) => onValuesChange({ customerGroups: value })}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Mô tả" validateStatus={errors.description ? "error" : ""} help={errors.description}>
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

      <Card variant="borderless" className="shadow-sm">
        <Space orientation="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
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
              label={isPercentage ? "Giá trị giảm (%)" : "Giá trị giảm (VND)"}
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
                suffix={isPercentage ? "%" : "VND"}
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

      <Card variant="borderless" className="shadow-sm">
        <Space orientation="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
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

      <Card variant="borderless" className="shadow-sm">
        <Space orientation="vertical" size={2} style={{ width: "100%", marginBottom: 16 }}>
          <Typography.Title level={5} className="!mb-0">
            Phạm vi sản phẩm
          </Typography.Title>
          <Typography.Text type="secondary">Chọn các sản phẩm áp dụng để chương trình có hiệu lực đúng phạm vi mong muốn.</Typography.Text>
        </Space>

        {productLoadError ? (
          <Alert
            type="error"
            showIcon
            title="Không thể tải danh sách sản phẩm"
            description={productLoadError}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form.Item label="Tìm sản phẩm để thêm">
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} md={16}>
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                value={pendingProductId}
                disabled={disabled}
                loading={loadingProducts}
                placeholder={loadingProducts ? "Đang tải danh sách sản phẩm..." : "Tìm kiếm sản phẩm theo mã hoặc tên"}
                notFoundContent={loadingProducts ? "Đang tải dữ liệu..." : "Không tìm thấy sản phẩm phù hợp"}
                onChange={(value) => setPendingProductId(typeof value === "string" ? value : undefined)}
              >
                {productOptions.map((product) => {
                  const imageUrl = getProductImage(product);
                  const productMeta = [product.type, product.size, product.thickness].filter(Boolean).join(" • ");

                  return (
                    <Select.Option key={product.value} value={product.value} label={product.label}>
                      <Flex align="center" justify="space-between" gap={12} style={{ width: "100%", padding: "4px 8px", borderRadius: 8 }}>
                        <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              border: "1px solid #d9d9d9",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              background: "#f5f5f5",
                            }}
                          >
                            {imageUrl ? (
                              <ProductImage
                                src={imageUrl}
                                alt={product.productName || product.label}
                                preview={false}
                                width={36}
                                height={36}
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <PictureOutlined style={{ color: "#8c8c8c" }} />
                            )}
                          </div>

                          <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
                            <Typography.Text ellipsis style={{ maxWidth: 280 }}>
                              {product.label}
                            </Typography.Text>
                            <Typography.Text type="secondary" ellipsis style={{ maxWidth: 280 }}>
                              {productMeta || "Chưa có thông tin kỹ thuật"}
                            </Typography.Text>
                          </Space>
                        </Flex>

                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            navigateToProductDetail(product.value);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Flex>
                    </Select.Option>
                  );
                })}
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Button type="default" block disabled={!pendingProductId || disabled} onClick={handleAddProduct}>
                Thêm vào danh sách
              </Button>
            </Col>
          </Row>
        </Form.Item>

        {selectedProductRows.length === 0 ? (
          <Alert
            type="info"
            showIcon
            message="Chưa có sản phẩm nào được chọn"
            description="Hãy chọn ít nhất một sản phẩm để xác định phạm vi áp dụng."
          />
        ) : (
          <Table<PromotionSelectedProductRow>
            rowKey="key"
            columns={selectedProductColumns}
            dataSource={selectedProductRows}
            pagination={false}
            scroll={{ x: 880 }}
            size="middle"
          />
        )}
      </Card>
    </Space>
  );
};

export default PromotionFormSections;
