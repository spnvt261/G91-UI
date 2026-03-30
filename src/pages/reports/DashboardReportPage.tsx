import { AlertOutlined, ApartmentOutlined, FundOutlined, ReloadOutlined, RiseOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Empty, Progress, Row, Space, Tag, Typography } from "antd";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { DashboardReport, SalesReportItem } from "../../models/report/report.model";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { DashboardMetricGrid, type DashboardMetricItem, ReportPageHeader } from "./components";
import { formatNumber, formatPercent } from "./components/report.utils";

interface TrendRow extends SalesReportItem {
  key: string;
  share: number;
}

const DashboardReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardReport | null>(null);
  const { notify } = useNotify();

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const response = await reportService.getDashboard();
      setDashboard(response);
    } catch (err) {
      const message = getErrorMessage(err, "Không thể tải báo cáo tổng quan.");
      setPageError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.summary;
  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalContracts = summary?.totalContracts ?? 0;
  const totalOrders = summary?.totalOrders ?? 0;
  const totalDebt = summary?.totalDebt ?? 0;
  const inventoryAlertCount = dashboard?.inventoryAlertCount ?? 0;
  const openProjectCount = dashboard?.openProjectCount ?? 0;
  const salesTrend = useMemo(() => dashboard?.salesTrend ?? [], [dashboard?.salesTrend]);

  const trendRows = useMemo<TrendRow[]>(() => {
    const totalTrendRevenue = salesTrend.reduce((sum, item) => sum + item.revenue, 0);
    return salesTrend.map((item) => ({
      ...item,
      key: item.period,
      share: totalTrendRevenue > 0 ? item.revenue / totalTrendRevenue : 0,
    }));
  }, [salesTrend]);

  const maxTrendRevenue = useMemo(() => Math.max(0, ...trendRows.map((item) => item.revenue)), [trendRows]);
  const debtRatio = totalRevenue > 0 ? totalDebt / totalRevenue : 0;
  const orderContractRatio = totalContracts > 0 ? totalOrders / totalContracts : 0;
  const riskScore = Math.max(0, Math.min(100, inventoryAlertCount * 8 + openProjectCount * 3));

  const metricItems = useMemo<DashboardMetricItem[]>(
    () => [
      {
        key: "revenue",
        title: "Tổng doanh thu",
        value: toCurrency(totalRevenue),
        note: "Doanh thu cộng dồn trong kỳ báo cáo.",
        percent: Math.min(100, Math.max(12, orderContractRatio * 30)),
        icon: <RiseOutlined style={{ color: "#1677ff" }} />,
      },
      {
        key: "contracts",
        title: "Tổng hợp đồng",
        value: formatNumber(totalContracts),
        note: "Số hợp đồng đang quản lý.",
        percent: Math.min(100, Math.max(10, openProjectCount * 5)),
        icon: <ApartmentOutlined style={{ color: "#13a8a8" }} />,
      },
      {
        key: "orders",
        title: "Tổng đơn hàng",
        value: formatNumber(totalOrders),
        note: "Khối lượng đơn đã ghi nhận.",
        percent: Math.min(100, Math.max(10, orderContractRatio * 35)),
        icon: <FundOutlined style={{ color: "#389e0d" }} />,
      },
      {
        key: "debt",
        title: "Tổng công nợ",
        value: toCurrency(totalDebt),
        note: "Giá trị cần theo dõi thu hồi.",
        percent: Math.min(100, Math.max(0, debtRatio * 100)),
        icon: <AlertOutlined style={{ color: "#fa8c16" }} />,
      },
    ],
    [debtRatio, openProjectCount, orderContractRatio, totalContracts, totalDebt, totalOrders, totalRevenue],
  );

  const isInitialLoading = loading && !dashboard;

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ReportPageHeader
          title="Dashboard báo cáo điều hành"
          subtitle="Tổng quan đa chiều về doanh thu, hợp đồng, đơn hàng và công nợ để hỗ trợ quyết định cấp cao."
          breadcrumbItems={[
            { label: "Trang chủ", url: ROUTE_URL.DASHBOARD },
            { label: "Báo cáo", url: ROUTE_URL.REPORT_DASHBOARD },
            { label: "Dashboard" },
          ]}
          actions={
            <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadDashboard()}>
              Làm mới nhanh
            </Button>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {pageError ? (
            <Alert
              showIcon
              type="error"
              message="Không thể tải dữ liệu dashboard báo cáo."
              description={pageError}
              closable
              onClose={() => setPageError(null)}
            />
          ) : null}

          <Card bordered={false} loading={isInitialLoading}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space size={8} wrap>
                <Tag color="blue">Tổng quan điều hành</Tag>
                <Tag color={debtRatio >= 0.5 ? "volcano" : "green"}>
                  {debtRatio >= 0.5 ? "Áp lực công nợ cao" : "Mức công nợ trong ngưỡng theo dõi"}
                </Tag>
              </Space>
              <Typography.Title level={4} className="!mb-0">
                {`Doanh thu ${toCurrency(totalRevenue)} | Công nợ ${toCurrency(totalDebt)}`}
              </Typography.Title>
              <Typography.Text type="secondary">
                Tỷ lệ công nợ trên doanh thu hiện tại: {formatPercent(debtRatio)}. Dữ liệu này dùng để đánh giá mức độ an toàn tài chính tổng thể.
              </Typography.Text>
              <Progress
                percent={Math.min(100, debtRatio * 100)}
                status={debtRatio >= 0.5 ? "exception" : "active"}
                strokeColor={debtRatio >= 0.5 ? "#ff4d4f" : "#1677ff"}
                format={(percent) => `Tỷ lệ nợ: ${formatPercent((percent ?? 0) / 100)}`}
              />
            </Space>
          </Card>

          <DashboardMetricGrid items={metricItems} loading={isInitialLoading} />

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={14}>
              <Card bordered={false} title="Xu hướng doanh thu theo kỳ" loading={isInitialLoading}>
                {trendRows.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu xu hướng doanh thu để hiển thị." />
                ) : (
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    {trendRows.map((row) => (
                      <div key={row.key}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Typography.Text strong>{row.period}</Typography.Text>
                          </Col>
                          <Col>
                            <Typography.Text>{toCurrency(row.revenue)}</Typography.Text>
                          </Col>
                        </Row>
                        <Progress
                          percent={maxTrendRevenue > 0 ? (row.revenue / maxTrendRevenue) * 100 : 0}
                          size="small"
                          format={() => formatPercent(row.share)}
                        />
                      </div>
                    ))}
                  </Space>
                )}
              </Card>
            </Col>

            <Col xs={24} xl={10}>
              <Card bordered={false} title="Theo dõi rủi ro vận hành" loading={isInitialLoading}>
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                  <div>
                    <Typography.Text type="secondary">Cảnh báo tồn kho</Typography.Text>
                    <Typography.Title level={4} className="!mb-0" style={{ color: inventoryAlertCount > 0 ? "#d4380d" : undefined }}>
                      {`${formatNumber(inventoryAlertCount)} cảnh báo`}
                    </Typography.Title>
                  </div>
                  <div>
                    <Typography.Text type="secondary">Dự án đang mở</Typography.Text>
                    <Typography.Title level={4} className="!mb-0">
                      {`${formatNumber(openProjectCount)} dự án`}
                    </Typography.Title>
                  </div>
                  <div>
                    <Typography.Text type="secondary">Điểm rủi ro tổng hợp</Typography.Text>
                    <Progress
                      percent={riskScore}
                      strokeColor={riskScore >= 70 ? "#ff4d4f" : riskScore >= 40 ? "#faad14" : "#52c41a"}
                      status={riskScore >= 70 ? "exception" : "active"}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>
      }
    />
  );
};

export default DashboardReportPage;
