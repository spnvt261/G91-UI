import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Input, Row, Select, Space, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { PriceListStatus } from "../../../models/pricing/price-list.model";

interface PriceListToolbarProps {
  keyword: string;
  status?: PriceListStatus;
  customerGroup?: string;
  validFrom?: string;
  validTo?: string;
  customerGroupOptions: Array<{ label: string; value: string }>;
  loadingCustomerGroups?: boolean;
  customerGroupHint?: string;
  onKeywordChange: (value: string) => void;
  onKeywordSearch: (value: string) => void;
  onStatusChange: (value?: PriceListStatus) => void;
  onCustomerGroupChange: (value?: string) => void;
  onValidRangeChange: (range?: { from?: string; to?: string }) => void;
  onReset: () => void;
}

const toDateValue = (value?: string): Dayjs | null => {
  if (!value?.trim()) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const PriceListToolbar = ({
  keyword,
  status,
  customerGroup,
  validFrom,
  validTo,
  customerGroupOptions,
  loadingCustomerGroups = false,
  customerGroupHint,
  onKeywordChange,
  onKeywordSearch,
  onStatusChange,
  onCustomerGroupChange,
  onValidRangeChange,
  onReset,
}: PriceListToolbarProps) => {
  const fromValue = toDateValue(validFrom);
  const toValue = toDateValue(validTo);
  const rangeValue: [Dayjs | null, Dayjs | null] | null = fromValue || toValue ? [fromValue, toValue] : null;

  return (
    <Card>
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} xl={9}>
            <Input.Search
              value={keyword}
              allowClear
              enterButton="Tìm kiếm"
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên bảng giá hoặc nhóm khách hàng"
              onChange={(event) => onKeywordChange(event.target.value)}
              onSearch={onKeywordSearch}
            />
          </Col>
          <Col xs={24} sm={12} xl={4}>
            <Select<PriceListStatus>
              className="w-full"
              placeholder="Trạng thái"
              allowClear
              value={status}
              options={[
                { label: "Đang áp dụng", value: "ACTIVE" },
                { label: "Tạm ngừng", value: "INACTIVE" },
              ]}
              onChange={(value) => onStatusChange(value)}
            />
          </Col>
          <Col xs={24} sm={12} xl={5}>
            <Select<string>
              className="w-full"
              showSearch
              optionFilterProp="label"
              loading={loadingCustomerGroups}
              placeholder="Nhóm khách hàng"
              allowClear
              value={customerGroup}
              options={customerGroupOptions}
              onChange={(value) => onCustomerGroupChange(value)}
            />
          </Col>
          <Col xs={24} sm={16} xl={4}>
            <DatePicker.RangePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder={["Hiệu lực từ", "Đến ngày"]}
              value={rangeValue}
              onChange={(rangeDates) => {
                if (!rangeDates || rangeDates.length !== 2) {
                  onValidRangeChange(undefined);
                  return;
                }

                onValidRangeChange({
                  from: rangeDates[0]?.format("YYYY-MM-DD"),
                  to: rangeDates[1]?.format("YYYY-MM-DD"),
                });
              }}
            />
          </Col>
          <Col xs={24} sm={8} xl={2}>
            <Button className="w-full" icon={<ReloadOutlined />} onClick={onReset}>
              Đặt lại
            </Button>
          </Col>
        </Row>

        {customerGroupHint ? <Typography.Text type="secondary">{customerGroupHint}</Typography.Text> : null}
      </Space>
    </Card>
  );
};

export default PriceListToolbar;
