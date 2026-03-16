import { useEffect, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import TableFilterBar from "../../components/table/TableFilterBar";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const SalesReportPage = () => {
  const [items, setItems] = useState<{ period: string; revenue: number }[]>([]);
  const [keyword, setKeyword] = useState("");
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        const report = await reportService.getSalesReport();
        setItems(report);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load sales report"), "error");
      }
    };

    void load();
  }, []);

  const filtered = items.filter((item) => item.period.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <div className="space-y-4">
      <PageHeader title="Sales Report" />
      <BaseCard>
        <TableFilterBar searchValue={keyword} onSearchChange={setKeyword} />
        <DataTable
          columns={[
            { key: "period", header: "Ky Bao Cao" },
            { key: "revenue", header: "Doanh Thu", render: (row) => toCurrency((row as { revenue: number }).revenue) },
          ]}
          data={filtered}
        />
      </BaseCard>
    </div>
  );
};

export default SalesReportPage;
