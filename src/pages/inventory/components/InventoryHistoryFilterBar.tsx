import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Input, Row, Select, Space } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { InventoryTransactionType } from "../../../models/inventory/inventory.model";
import { INVENTORY_TRANSACTION_OPTIONS } from "../inventory.ui";

interface InventoryHistoryFilterBarProps {
  searchValue: string;
  transactionType?: InventoryTransactionType;
  fromDate?: string;
  toDate?: string;
  onSearch: (value: string) => void;
  onTransactionTypeChange: (value?: InventoryTransactionType) => void;
  onDateRangeChange: (fromDate?: string, toDate?: string) => void;
  onReset: () => void;
}

const InventoryHistoryFilterBar = ({
  searchValue,
  transactionType,
  fromDate,
  toDate,
  onSearch,
  onTransactionTypeChange,
  onDateRangeChange,
  onReset,
}: InventoryHistoryFilterBarProps) => {
  const [searchText, setSearchText] = useState(searchValue);

  useEffect(() => {
    setSearchText(searchValue);
  }, [searchValue]);

  const dateRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    if (!fromDate || !toDate) {
      return null;
    }

    const start = dayjs(fromDate);
    const end = dayjs(toDate);
    if (!start.isValid() || !end.isValid()) {
      return null;
    }

    return [start, end];
  }, [fromDate, toDate]);

  return (
    <Row gutter={[12, 12]} align="middle">
      <Col xs={24} lg={10}>
        <Input
          allowClear
          value={searchText}
          prefix={<SearchOutlined />}
          placeholder="Tìm theo mã sản phẩm, tên sản phẩm hoặc nội dung giao dịch"
          onChange={(event) => setSearchText(event.target.value)}
          onPressEnter={() => onSearch(searchText)}
        />
      </Col>
      <Col xs={24} sm={12} lg={5}>
        <Select
          className="w-full"
          allowClear
          placeholder="Loại giao dịch"
          value={transactionType}
          options={INVENTORY_TRANSACTION_OPTIONS}
          onChange={(value: InventoryTransactionType | undefined) => onTransactionTypeChange(value)}
        />
      </Col>
      <Col xs={24} sm={12} lg={7}>
        <DatePicker.RangePicker
          className="w-full"
          format="DD/MM/YYYY"
          value={dateRange}
          placeholder={["Từ ngày", "Đến ngày"]}
          onChange={(value) => {
            const start = value?.[0]?.format("YYYY-MM-DD");
            const end = value?.[1]?.format("YYYY-MM-DD");
            onDateRangeChange(start, end);
          }}
        />
      </Col>
      <Col xs={24}>
        <Space wrap>
          <Button type="primary" onClick={() => onSearch(searchText)}>
            Lọc
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onReset}>
            Đặt lại
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default InventoryHistoryFilterBar;
