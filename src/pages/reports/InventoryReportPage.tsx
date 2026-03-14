import { useEffect, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/table/DataTable";
import TableFilterBar from "../../components/table/TableFilterBar";
import { reportService } from "../../services/report/report.service";
import { getErrorMessage } from "../shared/page.utils";

const InventoryReportPage = () => {
  const [items, setItems] = useState<{
    productId: string;
    productCode: string;
    productName: string;
    availableQty: number;
    reservedQty?: number;
  }[]>([]);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const report = await reportService.getInventoryReport();
        setItems(report);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load inventory report"));
      }
    };

    void load();
  }, []);

  const filtered = items.filter(
    (item) => item.productCode.toLowerCase().includes(keyword.toLowerCase()) || item.productName.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Inventory Report" />
      <BaseCard>
        <TableFilterBar searchValue={keyword} onSearchChange={setKeyword} />
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <DataTable
          columns={[
            { key: "productCode", header: "Ma SP" },
            { key: "productName", header: "Ten San Pham" },
            { key: "availableQty", header: "Ton Kha Dung" },
            { key: "reservedQty", header: "Da Giu Cho" },
          ]}
          data={filtered}
        />
      </BaseCard>
    </div>
  );
};

export default InventoryReportPage;
