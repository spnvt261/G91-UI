import { BankOutlined, DollarCircleOutlined, PercentageOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { toCurrency } from "../../shared/page.utils";
import ReportSummaryCards from "./ReportSummaryCards";
import { formatPercent } from "./report.utils";

interface FinancialOverviewCardsProps {
  totalRevenue: number;
  totalDebt: number;
  loading?: boolean;
}

const FinancialOverviewCards = ({ totalRevenue, totalDebt, loading = false }: FinancialOverviewCardsProps) => {
  const debtRatio = totalRevenue > 0 ? totalDebt / totalRevenue : 0;
  const debtHealthText = debtRatio >= 0.5 ? "Cần theo dõi sát công nợ" : "Cân đối tài chính đang ổn định";

  return (
    <ReportSummaryCards
      loading={loading}
      items={[
        {
          key: "revenue",
          title: "Tổng doanh thu",
          value: toCurrency(totalRevenue),
          description: "Tổng giá trị doanh thu ghi nhận từ báo cáo.",
          icon: <DollarCircleOutlined style={{ color: "#1677ff" }} />,
        },
        {
          key: "debt",
          title: "Tổng công nợ",
          value: toCurrency(totalDebt),
          description: "Công nợ phải thu đang chờ xử lý.",
          icon: <BankOutlined style={{ color: "#fa8c16" }} />,
        },
        {
          key: "debt-ratio",
          title: "Tỷ lệ nợ / doanh thu",
          value: formatPercent(debtRatio),
          description: "Dùng để đánh giá mức độ an toàn tài chính tổng thể.",
          icon: <PercentageOutlined style={{ color: "#13a8a8" }} />,
          extra: <Tag color={debtRatio >= 0.5 ? "volcano" : "green"}>{debtHealthText}</Tag>,
        },
      ]}
    />
  );
};

export default FinancialOverviewCards;
