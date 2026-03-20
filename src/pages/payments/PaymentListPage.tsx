import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import FilterSearchModalBar, { type FilterModalGroup } from "../../components/table/FilterSearchModalBar";
import Pagination from "../../components/table/Pagination";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
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
  const [dueDateRange, setDueDateRange] = useState<{ from?: string; to?: string }>({});
  const [totalRange, setTotalRange] = useState<{ min?: string; max?: string }>({});
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [invoices, debts] = await Promise.all([
          paymentService.getInvoiceList({ keyword, status: status[0] as InvoiceModel["status"] | undefined }),
          paymentService.getDebtStatus({ keyword }),
        ]);
        setAllInvoices(invoices);
        setDebtItems(debts);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load payments"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const filteredInvoices = useMemo(() => {
    const fromTime = dueDateRange.from ? new Date(dueDateRange.from).getTime() : undefined;
    const toTime = dueDateRange.to ? new Date(dueDateRange.to).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined;
    const minTotal = totalRange.min ? Number(totalRange.min) : undefined;
    const maxTotal = totalRange.max ? Number(totalRange.max) : undefined;

    return allInvoices.filter((item) => {
      const dueTime = item.dueDate ? new Date(item.dueDate).getTime() : undefined;
      const validDueDate = (fromTime == null || (dueTime != null && dueTime >= fromTime)) && (toTime == null || (dueTime != null && dueTime <= toTime));
      const validTotal =
        (minTotal == null || item.totalAmount >= minTotal) &&
        (maxTotal == null || item.totalAmount <= maxTotal);

      return validDueDate && validTotal;
    });
  }, [allInvoices, dueDateRange.from, dueDateRange.to, totalRange.max, totalRange.min]);

  const pagedItems = useMemo(() => filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredInvoices, page]);
  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { label: "UNPAID", value: "UNPAID" },
        { label: "PARTIAL", value: "PARTIAL" },
        { label: "PAID", value: "PAID" },
      ],
      value: status,
    },
    {
      kind: "dateRange",
      key: "dueDateRange",
      label: "Hạn thanh toán",
      value: dueDateRange,
      fromPlaceholder: "Từ ngày",
      toPlaceholder: "Đến ngày",
    },
    {
      kind: "numberRange",
      key: "totalRange",
      label: "Tổng tiền hóa đơn",
      value: totalRange,
      minPlaceholder: "Tổng tiền tối thiểu",
      maxPlaceholder: "Tổng tiền tối đa",
    },
  ];

  const columns = useMemo<DataTableColumn<InvoiceModel>[]>(
    () => [
      { key: "id", header: "Số hóa đơn", className: "font-semibold text-blue-900" },
      { key: "contractId", header: "Hợp đồng" },
      { key: "customerId", header: "Khách hàng" },
      { key: "totalAmount", header: "Tổng tiền", render: (row) => toCurrency(row.totalAmount) },
      { key: "dueAmount", header: "Còn nợ", render: (row) => toCurrency(row.dueAmount) },
      { key: "status", header: "Trạng thái" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải danh sách hóa đơn..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản lý thanh toán"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Thanh toán" }]} />}
        />
      }
      body={
        <div className="space-y-4">
          <BaseCard>
          <FilterSearchModalBar
              searchValue={keyword}
              onSearchChange={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              onSearchReset={() => {
                setKeyword("");
                setPage(1);
              }}
              searchPlaceholder="Tìm hóa đơn"
              filters={filters}
              onApplyFilters={(values) => {
                setStatus(Array.isArray(values.status) ? (values.status as InvoiceModel["status"][]) : []);
                const dueDateValue = values.dueDateRange;
                setDueDateRange(
                  dueDateValue && !Array.isArray(dueDateValue) && ("from" in dueDateValue || "to" in dueDateValue)
                    ? { from: dueDateValue.from, to: dueDateValue.to }
                    : {},
                );
                const totalValue = values.totalRange;
                setTotalRange(
                  totalValue && !Array.isArray(totalValue) && ("min" in totalValue || "max" in totalValue)
                    ? { min: totalValue.min, max: totalValue.max }
                    : {},
                );
                setPage(1);
            }}
          />
          <DataTable
              columns={columns}
              data={pagedItems}
              actions={(row) => (
                <div className="flex gap-2">
                  <CustomButton
                    label="Chi tiết"
                    className="px-2 py-1 text-sm"
                    onClick={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", row.id))}
                  />
                  <CustomButton
                    label="Ghi nhận"
                    className="px-2 py-1 text-sm"
                    onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", row.id))}
                  />
                </div>
              )}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filteredInvoices.length} onChange={setPage} />
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
      }
    />
  );
};

export default PaymentListPage;
