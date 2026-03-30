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
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { DebtModel, InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PAGE_SIZE = 8;

const PaymentListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();

  const canRecordPayment = canPerformAction(role, "payment.record");
  const canCreateInvoice = canPerformAction(role, "invoice.create");
  const canUpdateInvoice = canPerformAction(role, "invoice.update");
  const canCancelInvoice = canPerformAction(role, "invoice.cancel");
  const canSendReminder = canPerformAction(role, "payment.reminder.send");
  const canConfirmSettlement = canPerformAction(role, "debt.settlement.confirm");

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
        notify(getErrorMessage(err, "Không thể load payments"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const missingBackendActions = useMemo(() => {
    const pending: string[] = [];

    if (canCreateInvoice) {
      pending.push("Create Invoice");
    }
    if (canUpdateInvoice) {
      pending.push("Update Invoice");
    }
    if (canCancelInvoice) {
      pending.push("Cancel Invoice");
    }
    if (canSendReminder) {
      pending.push("Send Payment Reminder");
    }
    if (canConfirmSettlement) {
      pending.push("Confirm Debt Settlement");
    }

    return pending;
  }, [canCancelInvoice, canConfirmSettlement, canCreateInvoice, canSendReminder, canUpdateInvoice]);

  const filteredInvoices = useMemo(() => {
    const fromTime = dueDateRange.from ? new Date(dueDateRange.from).getTime() : undefined;
    const toTime = dueDateRange.to ? new Date(dueDateRange.to).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined;
    const minTotal = totalRange.min ? Number(totalRange.min) : undefined;
    const maxTotal = totalRange.max ? Number(totalRange.max) : undefined;

    return allInvoices.filter((item) => {
      const dueTime = item.dueDate ? new Date(item.dueDate).getTime() : undefined;
      const validDueDate = (fromTime == null || (dueTime != null && dueTime >= fromTime)) && (toTime == null || (dueTime != null && dueTime <= toTime));
      const validTotal = (minTotal == null || item.totalAmount >= minTotal) && (maxTotal == null || item.totalAmount <= maxTotal);

      return validDueDate && validTotal;
    });
  }, [allInvoices, dueDateRange.from, dueDateRange.to, totalRange.max, totalRange.min]);

  const pagedItems = useMemo(() => filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredInvoices, page]);

  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Status",
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
      label: "Due Date",
      value: dueDateRange,
      fromPlaceholder: "From",
      toPlaceholder: "To",
    },
    {
      kind: "numberRange",
      key: "totalRange",
      label: "Invoice Total",
      value: totalRange,
      minPlaceholder: "Minimum",
      maxPlaceholder: "Maximum",
    },
  ];

  const columns = useMemo<DataTableColumn<InvoiceModel>[]>(
    () => [
      { key: "id", header: "Invoice No", className: "font-semibold text-blue-900" },
      { key: "contractId", header: "Contract" },
      { key: "customerId", header: "Customer" },
      { key: "totalAmount", header: "Total", render: (row) => toCurrency(row.totalAmount) },
      { key: "dueAmount", header: "Due", render: (row) => toCurrency(row.dueAmount) },
      { key: "status", header: "Status" },
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
          title="Payment Management"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={canCreateInvoice ? <CustomButton label="Create Invoice" disabled /> : undefined}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Home" }, { label: "Payments" }]} />}
        />
      }
      body={
        <div className="space-y-4">
          {missingBackendActions.length > 0 ? (
            <BaseCard>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                These actions are correctly permission-gated but disabled because backend APIs are not available: {missingBackendActions.join(", ")}.
              </div>
            </BaseCard>
          ) : null}

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
              searchPlaceholder="Search invoice"
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
                    label="Detail"
                    className="px-2 py-1 text-sm"
                    onClick={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", row.id))}
                  />
                  {canRecordPayment ? (
                    <CustomButton
                      label="Record"
                      className="px-2 py-1 text-sm"
                      onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", row.id))}
                    />
                  ) : null}
                  {canUpdateInvoice ? <CustomButton label="Edit" className="px-2 py-1 text-sm" disabled /> : null}
                  {canCancelInvoice ? <CustomButton label="Cancel" className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600" disabled /> : null}
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


