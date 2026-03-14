import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import type { InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const detail = await paymentService.getInvoiceDetail(id);
        setInvoice(detail);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load invoice detail"));
      }
    };

    void load();
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chi Tiet Hoa Don"
        rightActions={<CustomButton label="Ghi Nhan Thanh Toan" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", id ?? ""))} />}
      />
      <BaseCard>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {invoice ? (
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">So Hoa Don:</span> {invoice.id}</p>
            <p><span className="font-semibold">Hop Dong:</span> {invoice.contractId}</p>
            <p><span className="font-semibold">Khach Hang:</span> {invoice.customerId}</p>
            <p><span className="font-semibold">Tong Tien:</span> {toCurrency(invoice.totalAmount)}</p>
            <p><span className="font-semibold">Da Thanh Toan:</span> {toCurrency(invoice.paidAmount)}</p>
            <p><span className="font-semibold">Con Lai:</span> {toCurrency(invoice.dueAmount)}</p>
            <p><span className="font-semibold">Han Thanh Toan:</span> {invoice.dueDate ?? "-"}</p>
            <p><span className="font-semibold">Trang Thai:</span> {invoice.status}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Loading invoice...</p>
        )}
      </BaseCard>
    </div>
  );
};

export default PaymentDetailPage;
