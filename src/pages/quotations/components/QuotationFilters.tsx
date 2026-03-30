import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from "antd";
import type { Dayjs } from "dayjs";
import type { QuotationStatus } from "../../../models/quotation/quotation.model";
import { QUOTATION_STATUS_OPTIONS } from "../quotation.ui";

interface QuotationFiltersProps {
  keyword: string;
  status?: QuotationStatus;
  createdRange: [Dayjs, Dayjs] | null;
  onKeywordChange: (value: string) => void;
  onKeywordSearch: (value: string) => void;
  onStatusChange: (value?: QuotationStatus) => void;
  onCreatedRangeChange: (value: [Dayjs, Dayjs] | null) => void;
  onReset: () => void;
}

const QuotationFilters = ({
  keyword,
  status,
  createdRange,
  onKeywordChange,
  onKeywordSearch,
  onStatusChange,
  onCreatedRangeChange,
  onReset,
}: QuotationFiltersProps) => {
  return (
    <Space direction="vertical" size={14} style={{ width: "100%" }}>
      <Typography.Text type="secondary">Tìm nhanh theo mã báo giá, khách hàng hoặc mốc thời gian quan trọng.</Typography.Text>

      <Form layout="vertical">
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} lg={10}>
            <Form.Item label="Tìm kiếm" style={{ marginBottom: 0 }}>
              <Input.Search
                placeholder="Nhập mã báo giá hoặc tên khách hàng"
                allowClear
                enterButton="Tìm"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                onSearch={onKeywordSearch}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Trạng thái" style={{ marginBottom: 0 }}>
              <Select<QuotationStatus>
                allowClear
                placeholder="Chọn trạng thái"
                value={status}
                options={QUOTATION_STATUS_OPTIONS}
                onChange={(value) => onStatusChange(value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Khoảng ngày tạo" style={{ marginBottom: 0 }}>
              <DatePicker.RangePicker
                className="w-full"
                value={createdRange}
                format="DD/MM/YYYY"
                onChange={(range) => {
                  if (!range || !range[0] || !range[1]) {
                    onCreatedRangeChange(null);
                    return;
                  }

                  onCreatedRangeChange([range[0], range[1]]);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={2}>
            <Button block onClick={onReset}>
              Đặt lại
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
};

export default QuotationFilters;
