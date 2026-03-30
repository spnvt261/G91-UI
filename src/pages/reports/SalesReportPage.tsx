import { CalendarOutlined, ReloadOutlined, RiseOutlined, SearchOutlined, StarFilled } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Empty, Input, Row, Segmented, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { SalesReportItem } from "../../models/report/report.model";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { ReportFilterBar, ReportPageHeader, ReportSummaryCards, RevenueStatCard } from "./components";
import { formatPercent, normalizeText } from "./components/report.utils";

type SalesPeriodKind = "ALL" | "MONTH" | "QUARTER" | "YEAR" | "OTHER";

interface SalesTableRow extends SalesReportItem {
  key: string;
  periodKind: Exclude<SalesPeriodKind, "ALL">;
  shareRatio: number;
  isTopPeriod: boolean;
}

const PERIOD_KIND_LABEL: Record<Exclude<SalesPeriodKind, "ALL">, string> = {
  MONTH: "Theo tháng",
  QUARTER: "Theo quý",
  YEAR: "Theo năm",
  OTHER: "Khác",
};

const detectPeriodKind = (period: string): SalesPeriodKind => {
  const normalized = period.trim().toUpperCase();

  if (/^\d{4}[-/](0[1-9]|1[0-2])$/.test(normalized) || /^T(HÁNG|HANG)\s*\d{1,2}[/-]\d{4}$/i.test(normalized)) {
    return "MONTH";
  }

  if (/^Q[1-4][-/ ]?\d{4}$/.test(normalized) || /^\d{4}[-/ ]?Q[1-4]$/.test(normalized)) {
    return "QUARTER";
  }

  if (/^\d{4}$/.test(normalized)) {
    return "YEAR";
  }

  return "OTHER";
};

const SalesReportPage = () => {
  const [items, setItems] = useState<SalesReportItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [periodKindFilter, setPeriodKindFilter] = useState<SalesPeriodKind>("ALL");
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setPageError(null);
        const report = await reportService.getSalesReport();
        setItems(report);
      } catch (err) {
        const message = getErrorMessage(err, "Không thể tải báo cáo doanh số.");
        setPageError(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const periodCounts = useMemo(
    () =>
      items.reduce<Record<Exclude<SalesPeriodKind, "ALL">, number>>(
        (accumulator, item) => {
          const kind = detectPeriodKind(item.period);
          if (kind !== "ALL") {
            accumulator[kind] += 1;
          }
          return accumulator;
        },
        { MONTH: 0, QUARTER: 0, YEAR: 0, OTHER: 0 },
      ),
    [items],
  );

  const periodFilterOptions = useMemo(() => {
    const options: { label: string; value: SalesPeriodKind }[] = [{ label: `Tất cả (${items.length})`, value: "ALL" }];

    (Object.keys(PERIOD_KIND_LABEL) as Exclude<SalesPeriodKind, "ALL">[]).forEach((kind) => {
      const count = periodCounts[kind];
      if (count > 0) {
        options.push({
          label: `${PERIOD_KIND_LABEL[kind]} (${count})`,
          value: kind,
        });
      }
    });

    return options;
  }, [items.length, periodCounts]);

  useEffect(() => {
    const selectedAvailable = periodFilterOptions.some((option) => option.value === periodKindFilter);
    if (!selectedAvailable) {
      setPeriodKindFilter("ALL");
    }
  }, [periodKindFilter, periodFilterOptions]);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);

    return items.filter((item) => {
      const matchesKeyword = normalizedKeyword.length === 0 || normalizeText(item.period).includes(normalizedKeyword);
      const kind = detectPeriodKind(item.period);
      const matchesPeriodKind = periodKindFilter === "ALL" || kind === periodKindFilter;

      return matchesKeyword && matchesPeriodKind;
    });
  }, [items, keyword, periodKindFilter]);

  const topRevenue = useMemo(() => Math.max(0, ...filteredItems.map((item) => item.revenue)), [filteredItems]);
  const totalRevenue = useMemo(() => filteredItems.reduce((sum, item) => sum + item.revenue, 0), [filteredItems]);

  const topPeriod = useMemo(() => filteredItems.find((item) => item.revenue === topRevenue) ?? null, [filteredItems, topRevenue]);

  const growthRate = useMemo(() => {
    if (filteredItems.length < 2) {
      return 0;
    }

    const firstRevenue = filteredItems[0]?.revenue ?? 0;
    const latestRevenue = filteredItems[filteredItems.length - 1]?.revenue ?? 0;

    if (firstRevenue <= 0) {
      return 0;
    }

    return (latestRevenue - firstRevenue) / firstRevenue;
  }, [filteredItems]);

  const tableRows = useMemo<SalesTableRow[]>(
    () =>
      filteredItems.map((item) => {
        const kind = detectPeriodKind(item.period);
        return {
          ...item,
          key: item.period,
          periodKind: kind === "ALL" ? "OTHER" : kind,
          shareRatio: totalRevenue > 0 ? item.revenue / totalRevenue : 0,
          isTopPeriod: item.revenue === topRevenue && topRevenue > 0,
        };
      }),
    [filteredItems, topRevenue, totalRevenue],
  );

  const columns = useMemo<ColumnsType<SalesTableRow>>(
    () => [
      {
        title: "Kỳ báo cáo",
        dataIndex: "period",
        key: "period",
        render: (_, row) => (
          <Space direction="vertical" size={2}>
            <Typography.Text strong>{row.period}</Typography.Text>
            <Typography.Text type="secondary">{PERIOD_KIND_LABEL[row.periodKind]}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Doanh thu",
        dataIndex: "revenue",
        key: "revenue",
        align: "right",
        render: (value: number, row) => (
          <Space direction="vertical" size={0} style={{ width: "100%", textAlign: "right" }}>
            <Typography.Text strong style={{ color: row.isTopPeriod ? "#d46b08" : undefined }}>
              {toCurrency(value)}
            </Typography.Text>
            {row.isTopPeriod ? (
              <Tag color="gold" icon={<StarFilled />}>
                Cao nhất
              </Tag>
            ) : null}
          </Space>
        ),
      },
      {
        title: "Tỷ trọng",
        dataIndex: "shareRatio",
        key: "shareRatio",
        align: "right",
        render: (value: number) => <Typography.Text>{formatPercent(value)}</Typography.Text>,
      },
      {
        title: "Nhận định nhanh",
        key: "insight",
        render: (_, row) => (
          <Badge
            status={row.isTopPeriod ? "warning" : "processing"}
            text={row.isTopPeriod ? "Đóng góp doanh thu cao nhất" : `Đóng góp ${formatPercent(row.shareRatio)} tổng doanh thu`}
          />
        ),
      },
    ],
    [],
  );

  const isInitialLoading = loading && items.length === 0;

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ReportPageHeader
          title="Báo cáo doanh số"
          subtitle="Theo dõi bức tranh doanh thu theo từng kỳ để nhận diện xu hướng và ra quyết định nhanh."
          breadcrumbItems={[
            { label: "Trang chủ", url: ROUTE_URL.DASHBOARD },
            { label: "Báo cáo", url: ROUTE_URL.REPORT_SALES },
            { label: "Doanh số" },
          ]}
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {pageError ? (
            <Alert
              showIcon
              type="error"
              message="Không thể tải dữ liệu báo cáo doanh số."
              description={pageError}
              closable
              onClose={() => setPageError(null)}
            />
          ) : null}

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} xl={6}>
              <RevenueStatCard
                title="Tổng doanh thu"
                value={totalRevenue}
                trendRatio={Math.min(Math.abs(growthRate), 1)}
                trendLabel={
                  filteredItems.length >= 2
                    ? growthRate >= 0
                      ? `Xu hướng tăng ${formatPercent(growthRate)} so với kỳ đầu`
                      : `Xu hướng giảm ${formatPercent(Math.abs(growthRate))} so với kỳ đầu`
                    : "Cần từ 2 kỳ trở lên để đánh giá xu hướng"
                }
                loading={isInitialLoading}
              />
            </Col>
            <Col xs={24} sm={12} xl={18}>
              <ReportSummaryCards
                loading={isInitialLoading}
                items={[
                  {
                    key: "peak",
                    title: "Kỳ doanh thu cao nhất",
                    value: topPeriod?.period ?? "Chưa có dữ liệu",
                    description: topPeriod ? toCurrency(topPeriod.revenue) : "Dữ liệu sẽ hiển thị sau khi có báo cáo.",
                    icon: <StarFilled style={{ color: "#faad14" }} />,
                  },
                  {
                    key: "count",
                    title: "Số kỳ báo cáo",
                    value: filteredItems.length.toLocaleString("vi-VN"),
                    description: "Tổng số kỳ đang hiển thị theo bộ lọc hiện tại.",
                    icon: <CalendarOutlined style={{ color: "#1677ff" }} />,
                  },
                  {
                    key: "average",
                    title: "Doanh thu trung bình / kỳ",
                    value: toCurrency(filteredItems.length > 0 ? totalRevenue / filteredItems.length : 0),
                    description: "Giúp đánh giá mức doanh thu nền theo chu kỳ.",
                    icon: <RiseOutlined style={{ color: "#52c41a" }} />,
                  },
                ]}
              />
            </Col>
          </Row>

          <ReportFilterBar
            title="Bộ lọc báo cáo"
            description="Kết hợp tìm kiếm theo kỳ và nhóm thời gian để đọc báo cáo nhanh hơn."
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword("");
                  setPeriodKindFilter("ALL");
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
                  placeholder="Tìm kiếm theo kỳ báo cáo"
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </Col>
              <Col xs={24} lg={10}>
                <Segmented
                  block
                  options={periodFilterOptions}
                  value={periodKindFilter}
                  onChange={(value) => setPeriodKindFilter(value as SalesPeriodKind)}
                />
              </Col>
            </Row>
          </ReportFilterBar>

          <Card
            bordered={false}
            title="Chi tiết doanh thu theo kỳ"
            extra={<Typography.Text type="secondary">{`Hiển thị ${tableRows.length} kỳ`}</Typography.Text>}
            styles={{ body: { padding: 0 } }}
          >
            <Table<SalesTableRow>
              rowKey="key"
              columns={columns}
              dataSource={tableRows}
              loading={{ spinning: loading && items.length > 0, tip: "Đang cập nhật báo cáo doanh số..." }}
              rowClassName={(record) => (record.isTopPeriod ? "bg-amber-50" : "")}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không tìm thấy kỳ báo cáo phù hợp. Hãy thử thay đổi bộ lọc hoặc từ khóa."
                  />
                ),
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} kỳ`,
              }}
              scroll={{ x: 900 }}
            />
          </Card>
        </Space>
      }
    />
  );
};

export default SalesReportPage;
