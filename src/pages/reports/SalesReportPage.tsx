import { useEffect, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable from "../../components/table/DataTable";
import TableFilterBar from "../../components/table/TableFilterBar";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const SalesReportPage = () => {
  const [items, setItems] = useState<{ period: string; revenue: number }[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const report = await reportService.getSalesReport();
        setItems(report);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load sales report"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const filtered = items.filter((item) => item.period.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Loading sales report..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Sales Report"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "Báo cáo", url: ROUTE_URL.REPORT_SALES },
                { label: "Doanh s?" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          <TableFilterBar searchValue={keyword} onSearchChange={setKeyword} />
          <DataTable
            columns={[
              { key: "period", header: "K? báo cáo" },
              { key: "revenue", header: "Doanh thu", render: (row) => toCurrency((row as { revenue: number }).revenue) },
            ]}
            data={filtered}
          />
        </BaseCard>
      }
    />
  );
};

export default SalesReportPage;

