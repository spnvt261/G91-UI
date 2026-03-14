import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import { ROUTE_URL } from "../../const/route_url.const";
import type { QuotationModel } from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PAGE_SIZE = 8;

const QuotationListPage = () => {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<QuotationModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await quotationService.getList({ keyword, status: status[0] as QuotationModel["status"] | undefined });
        setAllItems(items);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load quotations"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, status]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);

  const columns = useMemo<DataTableColumn<QuotationModel>[]>(
    () => [
      { key: "id", header: "So Bao Gia", className: "font-semibold text-blue-900" },
      { key: "customerId", header: "Khach Hang" },
      { key: "status", header: "Trang Thai" },
      {
        key: "totalAmount",
        header: "Tong Tien",
        render: (row) => toCurrency(row.totalAmount),
      },
      { key: "createdAt", header: "Ngay Tao" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quan Ly Bao Gia"
        rightActions={<CustomButton label="Tao Yeu Cau" onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)} />}
      />
      <BaseCard>
        <TableFilterBar
          searchValue={keyword}
          onSearchChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          filters={[
            {
              key: "status",
              placeholder: "Trang Thai",
              options: [
                { label: "Draft", value: "DRAFT" },
                { label: "Pending", value: "PENDING" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
              ],
              value: status,
              onChange: (values) => {
                setStatus(values);
                setPage(1);
              },
            },
          ]}
        />
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading quotations...</p> : null}
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <DataTable
          columns={columns}
          data={pagedItems}
          actions={(row) => (
            <CustomButton
              label="Xem Chi Tiet"
              className="px-2 py-1 text-sm"
              onClick={() => navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", row.id))}
            />
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
      </BaseCard>
    </div>
  );
};

export default QuotationListPage;
