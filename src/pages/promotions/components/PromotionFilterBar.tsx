import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Input, Row, Select, Space, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { PromotionStatus, PromotionType } from "../../../models/promotion/promotion.model";
import { PROMOTION_STATUS_OPTIONS, PROMOTION_TYPE_OPTIONS } from "../promotion.utils";

interface PromotionFilterBarProps {
  searchValue: string;
  status?: PromotionStatus;
  promotionType?: PromotionType;
  startFrom?: string;
  endTo?: string;
  onSearchValueChange: (value: string) => void;
  onApplySearch: (value: string) => void;
  onStatusChange: (value?: PromotionStatus) => void;
  onPromotionTypeChange: (value?: PromotionType) => void;
  onValidityRangeChange: (from?: string, to?: string) => void;
  onReset: () => void;
}

const toDayjsValue = (value?: string): Dayjs | null => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const PromotionFilterBar = ({
  searchValue,
  status,
  promotionType,
  startFrom,
  endTo,
  onSearchValueChange,
  onApplySearch,
  onStatusChange,
  onPromotionTypeChange,
  onValidityRangeChange,
  onReset,
}: PromotionFilterBarProps) => {
  return (
    <Card variant="borderless" className="shadow-sm">
      <Space orientation="vertical" size={14} style={{ width: "100%" }}>
        <Typography.Title level={5} className="!mb-0">
          Bộ lọc chương trình
        </Typography.Title>

        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} xl={8}>
            <Input.Search
              allowClear
              enterButton="Tìm"
              placeholder="Tìm theo tên hoặc mã khuyến mãi"
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              onSearch={(value) => onApplySearch(value)}
            />
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <Select
              className="w-full"
              allowClear
              placeholder="Trạng thái"
              options={PROMOTION_STATUS_OPTIONS}
              value={status}
              onChange={(value: PromotionStatus | undefined) => onStatusChange(value)}
            />
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <Select
              className="w-full"
              allowClear
              placeholder="Loại khuyến mãi"
              options={PROMOTION_TYPE_OPTIONS}
              value={promotionType}
              onChange={(value: PromotionType | undefined) => onPromotionTypeChange(value)}
            />
          </Col>

          <Col xs={24} lg={16} xl={6}>
            <DatePicker.RangePicker
              className="w-full"
              placeholder={["Bắt đầu từ", "Kết thúc đến"]}
              value={[toDayjsValue(startFrom), toDayjsValue(endTo)]}
              onChange={(dates) => {
                const fromValue = dates?.[0]?.format("YYYY-MM-DD");
                const toValue = dates?.[1]?.format("YYYY-MM-DD");
                onValidityRangeChange(fromValue, toValue);
              }}
            />
          </Col>

          <Col xs={24} lg={8} xl={2}>
            <Button icon={<ReloadOutlined />} className="w-full" onClick={onReset}>
              Đặt lại
            </Button>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default PromotionFilterBar;
