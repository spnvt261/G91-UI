import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { QuotationHistoryResponseData, QuotationItemModel, QuotationModel } from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const QuotationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quotation, setQuotation] = useState<QuotationModel | null>(null);
  const [history, setHistory] = useState<QuotationHistoryResponseData["events"]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const isCustomerRole = role === "CUSTOMER";
  const canShowCreateContract = role === "ACCOUNTANT";

  const loadData = async (quotationId: string) => {
    const [detail, historyResponse] = await Promise.all([
      quotationService.getDetail(quotationId),
      quotationService.getHistory(quotationId),
    ]);

    setQuotation(detail);
    setHistory(historyResponse.events ?? []);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        await loadData(id);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load quotation detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleSubmitDraft = async () => {
    if (!id) {
      return;
    }

    try {
      setSubmitting(true);
      await quotationService.submit(id);
      await loadData(id);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot submit draft quotation"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<DataTableColumn<QuotationItemModel>[]>(
    () => [
      { key: "productCode", header: "Product Code" },
      { key: "productName", header: "Product Name" },
      { key: "quantity", header: "Quantity" },
      { key: "unitPrice", header: "Unit Price", render: (row) => toCurrency(row.unitPrice) },
      { key: "amount", header: "Amount", render: (row) => toCurrency(row.amount ?? row.totalPrice) },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quotation Detail"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex gap-2">
              {!isCustomerRole ? (
                <CustomButton
                  label={submitting ? "Submitting..." : "Submit Draft"}
                  onClick={handleSubmitDraft}
                  disabled={!quotation || quotation.status !== "DRAFT" || submitting}
                />
              ) : null}
              {canShowCreateContract ? (
                <CustomButton
                  label="Create Contract"
                  onClick={() => navigate(ROUTE_URL.CONTRACT_CREATE.replace(":quotationId", quotation?.id ?? ""))}
                  disabled={!quotation || !quotation.actions?.accountantCanCreateContract}
                />
              ) : null}
              <CustomButton
                label="Back"
                className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Báo giá", url: ROUTE_URL.QUOTATION_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          {loading ? <p className="mb-3 text-sm text-slate-500">Đang tải báo giá...</p> : null}
          {quotation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-semibold">Quotation:</span> {quotation.quotationNumber || quotation.id}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {quotation.status}
                </p>
                <p>
                  <span className="font-semibold">Customer:</span> {quotation.customerName || quotation.customerId || "-"}
                </p>
                <p>
                  <span className="font-semibold">Total:</span> {toCurrency(quotation.totalAmount)}
                </p>
                <p>
                  <span className="font-semibold">Valid Until:</span> {quotation.validUntil || "-"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold">Delivery Requirements:</span> {quotation.deliveryRequirements || "-"}
                </p>
              </div>

              <DataTable columns={columns} data={quotation.items} />

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">History</h3>
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-sm text-slate-500">No history yet.</p>
                  ) : (
                    history.map((event) => (
                      <div key={event.id} className="rounded border border-slate-200 px-3 py-2 text-sm">
                        <p className="font-medium text-slate-800">{event.action}</p>
                        <p className="text-slate-500">{event.createdAt}</p>
                        {event.note ? <p className="text-slate-600">{event.note}</p> : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </BaseCard>
      }
    />
  );
};

export default QuotationDetailPage;
