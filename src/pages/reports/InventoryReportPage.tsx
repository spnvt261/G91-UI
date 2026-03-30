import { ReloadOutlined, SearchOutlined, WarningOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Empty, Input, Row, Segmented, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InventoryReportItem } from "../../models/report/report.model";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage } from "../shared/page.utils";
import { InventoryStatCard, ReportFilterBar, ReportPageHeader } from "./components";
import { formatNumber, formatPercent, getInventoryHealth, getInventoryHealthMeta, normalizeText } from "./components/report.utils";

type InventoryFilter = "ALL" | "LOW_STOCK" | "HIGH_RESERVED";

interface InventoryTableRow extends InventoryReportItem {
  key: string;
  normalizedReservedQty: number;
  reservedRatio: number;
  health: ReturnType<typeof getInventoryHealth>;
}

const InventoryReportPage = () => {
  const [items, setItems] = useState<InventoryReportItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [filterMode, setFilterMode] = useState<InventoryFilter>("ALL");
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setPageError(null);
        const report = await reportService.getInventoryReport();
        setItems(report);
      } catch (err) {
        const message = getErrorMessage(err, "Không thể tải báo cáo tồn kho.");
        setPageError(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const allRows = useMemo<InventoryTableRow[]>(
    () =>
      items.map((item) => {
        const normalizedReservedQty = item.reservedQty ?? 0;
        const reservedRatio = item.availableQty > 0 ? normalizedReservedQty / item.availableQty : 0;
        const health = getInventoryHealth(item.availableQty, normalizedReservedQty);
        return {
          ...item,
          key: item.productId,
          normalizedReservedQty,
          reservedRatio,
          health,
        };
      }),
    [items],
  );

  const filterCounts = useMemo(() => {
    const lowStockCount = allRows.filter((item) => item.health === "LOW_STOCK" || item.health === "OUT_OF_STOCK").length;
    const highReservedCount = allRows.filter((item) => item.health === "HIGH_RESERVED").length;

    return {
      ALL: allRows.length,
      LOW_STOCK: lowStockCount,
      HIGH_RESERVED: highReservedCount,
    };
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);

    return allRows.filter((item) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        normalizeText(item.productCode).includes(normalizedKeyword) ||
        normalizeText(item.productName).includes(normalizedKeyword);

      if (!matchesKeyword) {
        return false;
      }

      if (filterMode === "LOW_STOCK") {
        return item.health === "LOW_STOCK" || item.health === "OUT_OF_STOCK";
      }

      if (filterMode === "HIGH_RESERVED") {
        return item.health === "HIGH_RESERVED";
      }

      return true;
    });
  }, [allRows, filterMode, keyword]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (accumulator, row) => {
        accumulator.available += row.availableQty;
        accumulator.reserved += row.normalizedReservedQty;
        return accumulator;
      },
      { available: 0, reserved: 0 },
    );
  }, [filteredRows]);

  const mostReservedItem = useMemo(() => {
    if (filteredRows.length === 0) {
      return null;
    }

    return filteredRows.reduce((highest, current) => (current.reservedRatio > highest.reservedRatio ? current : highest), filteredRows[0]);
  }, [filteredRows]);

  const columns = useMemo<ColumnsType<InventoryTableRow>>(
    () => [
      {
        title: "Mã sản phẩm",
        dataIndex: "productCode",
        key: "productCode",
        width: 180,
        render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
      },
      {
        title: "Tên sản phẩm",
        dataIndex: "productName",
        key: "productName",
      },
      {
        title: "Tồn khả dụng",
        dataIndex: "availableQty",
        key: "availableQty",
        align: "right",
        render: (value: number) => formatNumber(value),
      },
      {
        title: "Đã giữ chỗ",
        dataIndex: "normalizedReservedQty",
        key: "normalizedReservedQty",
        align: "right",
        render: (value: number, row) => (
          <Space orientation="vertical" size={0} style={{ width: "100%", textAlign: "right" }}>
            <Typography.Text>{formatNumber(value)}</Typography.Text>
            <Typography.Text type="secondary">{formatPercent(row.reservedRatio)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái tồn kho",
        key: "health",
        render: (_, row) => {
          const meta = getInventoryHealthMeta(row.health);
          return (
            <Tooltip title={meta.description}>
              <Tag color={meta.color}>{meta.label}</Tag>
            </Tooltip>
          );
        },
      },
    ],
    [],
  );

  const lowStockCount = filteredRows.filter((row) => row.health === "LOW_STOCK" || row.health === "OUT_OF_STOCK").length;
  const isInitialLoading = loading && items.length === 0;

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ReportPageHeader
          title="Báo cáo tồn kho"
          subtitle="Theo dõi nhanh mức tồn khả dụng, tỷ lệ giữ chỗ và các sản phẩm cần ưu tiên xử lý."
          breadcrumbItems={[
            { label: "Trang chủ", url: ROUTE_URL.DASHBOARD },
            { label: "Báo cáo", url: ROUTE_URL.REPORT_INVENTORY },
            { label: "Tồn kho" },
          ]}
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {pageError ? (
            <Alert
              showIcon
              type="error"
              message="Không thể tải dữ liệu báo cáo tồn kho."
              description={pageError}
              closable
              onClose={() => setPageError(null)}
            />
          ) : null}

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} xl={6}>
              <InventoryStatCard
                label="Tổng số sản phẩm"
                value={formatNumber(filteredRows.length)}
                description="Số lượng mặt hàng đang hiển thị theo bộ lọc."
                loading={isInitialLoading}
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <InventoryStatCard
                label="Tổng tồn khả dụng"
                value={formatNumber(totals.available)}
                description="Tổng số lượng có thể xuất kho ngay."
                loading={isInitialLoading}
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <InventoryStatCard
                label="Tổng hàng giữ chỗ"
                value={formatNumber(totals.reserved)}
                description="Khối lượng đã phân bổ cho các đơn hàng."
                loading={isInitialLoading}
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <InventoryStatCard
                label="Điểm cần chú ý"
                value={mostReservedItem ? mostReservedItem.productCode : "Chưa có dữ liệu"}
                description={mostReservedItem ? `Giữ chỗ cao nhất: ${formatPercent(mostReservedItem.reservedRatio)}` : "Sẽ hiển thị khi có dữ liệu"}
                extra={
                  <Space size={8}>
                    <Tag color={lowStockCount > 0 ? "volcano" : "green"} icon={<WarningOutlined />}>
                      {`${formatNumber(lowStockCount)} sản phẩm tồn thấp`}
                    </Tag>
                  </Space>
                }
                loading={isInitialLoading}
              />
            </Col>
          </Row>

          <ReportFilterBar
            title="Bộ lọc vận hành kho"
            description="Tìm nhanh theo mã/tên sản phẩm hoặc tập trung vào nhóm rủi ro tồn kho."
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword("");
                  setFilterMode("ALL");
                }}
              >
                Đặt lại
              </Button>
            }
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} lg={14}>
                <Input
                  allowClear
                  value={keyword}
                  prefix={<SearchOutlined />}
                  placeholder="Tìm theo mã sản phẩm hoặc tên sản phẩm"
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </Col>
              <Col xs={24} lg={10}>
                <Segmented
                  block
                  value={filterMode}
                  onChange={(value) => setFilterMode(value as InventoryFilter)}
                  options={[
                    { label: `Tất cả (${filterCounts.ALL})`, value: "ALL" },
                    { label: `Tồn thấp (${filterCounts.LOW_STOCK})`, value: "LOW_STOCK" },
                    { label: `Giữ chỗ cao (${filterCounts.HIGH_RESERVED})`, value: "HIGH_RESERVED" },
                  ]}
                />
              </Col>
            </Row>
          </ReportFilterBar>

          <Card
            variant="borderless"
            title="Chi tiết tồn kho theo sản phẩm"
            extra={<Typography.Text type="secondary">{`Hiển thị ${filteredRows.length} sản phẩm`}</Typography.Text>}
            styles={{ body: { padding: 0 } }}
          >
            <Table<InventoryTableRow>
              rowKey="key"
              columns={columns}
              dataSource={filteredRows}
              loading={{ spinning: loading && items.length > 0, description: "Đang cập nhật báo cáo tồn kho..." }}
              rowClassName={(record) => (record.health === "OUT_OF_STOCK" ? "bg-red-50" : record.health === "LOW_STOCK" ? "bg-amber-50" : "")}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có sản phẩm phù hợp với điều kiện lọc hiện tại."
                  />
                ),
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} sản phẩm`,
              }}
              scroll={{ x: 980 }}
            />
          </Card>
        </Space>
      }
    />
  );
};

export default InventoryReportPage;
