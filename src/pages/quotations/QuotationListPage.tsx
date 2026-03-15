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
  const [items, setItems] = useState<QuotationModel[]>([]);
  const [total, setTotal] = useState(0);
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
        const response = await quotationService.getCustomerList({
          page,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
          status: status[0] as QuotationModel["status"] | undefined,
        });

        setItems(
          response.items.map((item) => ({
            id: item.id,
            quotationNumber: item.quotationNumber,
            customerId: "",
            items: [],
            totalAmount: item.totalAmount,
            status: item.status,
            validUntil: item.validUntil,
            createdAt: item.createdAt,
          })),
        );
        setTotal(response.pagination.totalItems);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load quotations"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, page, status]);

  const columns = useMemo<DataTableColumn<QuotationModel>[]>(
    () => [
      {
        key: "quotationNumber",
        header: "Quotation No",
        className: "font-semibold text-blue-900",
        render: (row) => row.quotationNumber || row.id,
      },
      { key: "status", header: "Status" },
      {
        key: "totalAmount",
        header: "Total",
        render: (row) => toCurrency(row.totalAmount),
      },
      { key: "validUntil", header: "Valid Until" },
      { key: "createdAt", header: "Created At" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quotation Management"
        rightActions={<CustomButton label="Create Quotation" onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)} />}
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
              placeholder: "Status",
              options: [
                { label: "Draft", value: "DRAFT" },
                { label: "Pending", value: "PENDING" },
                { label: "Converted", value: "CONVERTED" },
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
          data={items}
          actions={(row) => (
            <CustomButton
              label="View"
              className="px-2 py-1 text-sm"
              onClick={() => navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", row.id))}
            />
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </BaseCard>
    </div>
  );
};

export default QuotationListPage;
