import { FilterOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Select, Space, Typography } from "antd";
import type { ProductStatus } from "../../../models/product/product.model";

interface ProductCatalogToolbarProps {
  keyword: string;
  typeValue?: string;
  statusValue?: ProductStatus;
  unitValue?: string;
  thicknessValue?: string;
  typeOptions: Array<{ label: string; value: string }>;
  unitOptions: Array<{ label: string; value: string }>;
  thicknessOptions: Array<{ label: string; value: string }>;
  onKeywordChange: (value: string) => void;
  onTypeChange: (value?: string) => void;
  onStatusChange: (value?: ProductStatus) => void;
  onUnitChange: (value?: string) => void;
  onThicknessChange: (value?: string) => void;
  onReset: () => void;
}

const ProductCatalogToolbar = ({
  keyword,
  typeValue,
  statusValue,
  unitValue,
  thicknessValue,
  typeOptions,
  unitOptions,
  thicknessOptions,
  onKeywordChange,
  onTypeChange,
  onStatusChange,
  onUnitChange,
  onThicknessChange,
  onReset,
}: ProductCatalogToolbarProps) => {
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={10}>
          <Input
            value={keyword}
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên sản phẩm, mã sản phẩm hoặc loại"
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Select
            allowClear
            value={typeValue}
            placeholder="Loại sản phẩm"
            options={typeOptions}
            onChange={(value) => onTypeChange(value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Select
            allowClear
            value={statusValue}
            placeholder="Trạng thái"
            options={[
              { label: "Đang kinh doanh", value: "ACTIVE" },
              { label: "Ngừng kinh doanh", value: "INACTIVE" },
            ]}
            onChange={(value) => onStatusChange(value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Select
            allowClear
            value={unitValue}
            placeholder="Đơn vị"
            options={unitOptions}
            onChange={(value) => onUnitChange(value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Select
            allowClear
            value={thicknessValue}
            placeholder="Độ dày"
            options={thicknessOptions}
            onChange={(value) => onThicknessChange(value)}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>

      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Typography.Text type="secondary">
          <FilterOutlined /> Dùng bộ lọc để thu hẹp danh mục theo nhu cầu bán hàng hoặc báo giá.
        </Typography.Text>
        <Button icon={<ReloadOutlined />} onClick={onReset}>
          Đặt lại bộ lọc
        </Button>
      </Space>
    </Space>
  );
};

export default ProductCatalogToolbar;
