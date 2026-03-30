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
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const report = await reportService.getInventoryReport();
        setItems(report);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể load inventory report"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify]);

  const filtered = items.filter(
    (item) => item.productCode.toLowerCase().includes(keyword.toLowerCase()) || item.productName.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải báo cáo tồn kho..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Inventory Report"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "Báo cáo", url: ROUTE_URL.REPORT_INVENTORY },
                { label: "T?n kho" },
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
              { key: "productCode", header: "Mã SP" },
              { key: "productName", header: "Tên s?n ph?m" },
              { key: "availableQty", header: "T?n kh? d?ng" },
              { key: "reservedQty", header: "Ðã gi? cho" },
            ]}
            data={filtered}
          />
        </BaseCard>
      }
    />
  );
};

export default InventoryReportPage;



