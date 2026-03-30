import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();

  const canRecordPayment = canPerformAction(role, "payment.record");
  const canUpdateInvoice = canPerformAction(role, "invoice.update");
  const canCancelInvoice = canPerformAction(role, "invoice.cancel");
  const canSendReminder = canPerformAction(role, "payment.reminder.send");
  const canConfirmSettlement = canPerformAction(role, "debt.settlement.confirm");

  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await paymentService.getInvoiceDetail(id);
        setInvoice(detail);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể load invoice detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const missingBackendActions = useMemo(() => {
    const pending: string[] = [];

    if (canUpdateInvoice) {
      pending.push("C?p nh?t hóa don");
    }
    if (canCancelInvoice) {
      pending.push("H?y hóa don");
    }
    if (canSendReminder) {
      pending.push("G?i nh?c thanh toán");
    }
    if (canConfirmSettlement) {
      pending.push("Xác nh?n t?t toán");
    }

    return pending;
  }, [canCancelInvoice, canConfirmSettlement, canSendReminder, canUpdateInvoice]);

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải thông tin hóa đơn..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi ti?t hóa don"
          actions={
            <div className="flex flex-wrap gap-2">
              {canRecordPayment ? (
                <CustomButton
                  label="Ghi nh?n thanh toán"
                  onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", id ?? ""))}
                />
              ) : null}
              {canUpdateInvoice ? <CustomButton label="C?p nh?t hóa don" disabled /> : null}
              {canCancelInvoice ? <CustomButton label="H?y hóa don" className="bg-red-500 hover:bg-red-600" disabled /> : null}
              {canSendReminder ? <CustomButton label="G?i nh?c thanh toán" disabled /> : null}
              {canConfirmSettlement ? <CustomButton label="Xác nh?n t?t toán" disabled /> : null}
              <CustomButton
                label="Quay l?i"
                className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "Thanh toán", url: ROUTE_URL.PAYMENT_LIST },
                { label: "Chi ti?t" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          {missingBackendActions.length > 0 ? (
            <BaseCard>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Các action này dã du?c guard dúng role nhung dang b? khóa vì backend chua công b? API: {missingBackendActions.join(", ")}.
              </div>
            </BaseCard>
          ) : null}

          <BaseCard>
            {invoice ? (
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-semibold">S? hóa don:</span> {invoice.id}
                </p>
                <p>
                  <span className="font-semibold">H?p d?ng:</span> {invoice.contractId}
                </p>
                <p>
                  <span className="font-semibold">Khách hàng:</span> {invoice.customerId}
                </p>
                <p>
                  <span className="font-semibold">T?ng ti?n:</span> {toCurrency(invoice.totalAmount)}
                </p>
                <p>
                  <span className="font-semibold">Ðã thanh toán:</span> {toCurrency(invoice.paidAmount)}
                </p>
                <p>
                  <span className="font-semibold">Còn l?i:</span> {toCurrency(invoice.dueAmount)}
                </p>
                <p>
                  <span className="font-semibold">H?n thanh toán:</span> {invoice.dueDate ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Tr?ng thái:</span> {invoice.status}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Không có d? li?u hóa don.</p>
            )}
          </BaseCard>
        </div>
      }
    />
  );
};

export default PaymentDetailPage;



