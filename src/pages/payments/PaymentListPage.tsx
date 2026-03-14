import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import { ROUTE_URL } from "../../const/route_url.const";
import type { DebtModel, InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PAGE_SIZE = 8;

const PaymentListPage = () => {
  const navigate = useNavigate();
  const [allInvoices, setAllInvoices] = useState<InvoiceModel[]>([]);
  const [debtItems, setDebtItems] = useState<DebtModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [invoices, debts] = await Promise.all([
          paymentService.getInvoiceList({ keyword, status: status[0] as InvoiceModel["status"] | undefined }),
          paymentService.getDebtStatus({ keyword }),
        ]);
        setAllInvoices(invoices);
        setDebtItems(debts);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load payments"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, status]);

  const pagedItems = useMemo(() => allInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allInvoices, page]);

  const columns = useMemo<DataTableColumn<InvoiceModel>[]>(
    () => [
      { key: "id", header: "So Hoa Don", className: "font-semibold text-blue-900" },
      { key: "contractId", header: "Hop Dong" },
      { key: "customerId", header: "Khach Hang" },
      { key: "totalAmount", header: "Tong Tien", render: (row) => toCurrency(row.totalAmount) },
      { key: "dueAmount", header: "Con No", render: (row) => toCurrency(row.dueAmount) },
      { key: "status", header: "Trang Thai" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Quan Ly Thanh Toan" />
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
                { label: "UNPAID", value: "UNPAID" },
                { label: "PARTIAL", value: "PARTIAL" },
                { label: "PAID", value: "PAID" },
              ],
              value: status,
              onChange: (values) => {
                setStatus(values);
                setPage(1);
              },
            },
          ]}
        />
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading invoices...</p> : null}
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <DataTable
          columns={columns}
          data={pagedItems}
          actions={(row) => (
            <div className="flex gap-2">
              <CustomButton label="Chi Tiet" className="px-2 py-1 text-sm" onClick={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", row.id))} />
              <CustomButton label="Ghi Nhan" className="px-2 py-1 text-sm" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", row.id))} />
            </div>
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={allInvoices.length} onChange={setPage} />
      </BaseCard>

      <BaseCard title="Debt Status">
        <DataTable
          columns={[
            { key: "customerId", header: "Customer ID" },
            { key: "customerName", header: "Customer" },
            { key: "totalDebt", header: "Total Debt", render: (row: DebtModel) => toCurrency(row.totalDebt) },
            { key: "overdueDebt", header: "Overdue", render: (row: DebtModel) => toCurrency(row.overdueDebt) },
          ]}
          data={debtItems}
        />
      </BaseCard>
    </div>
  );
};

export default PaymentListPage;
