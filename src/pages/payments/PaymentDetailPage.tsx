import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const detail = await paymentService.getInvoiceDetail(id);
        setInvoice(detail);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load invoice detail"), "error");
      }
    };

    void load();
  }, [id, notify]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi tiết hóa đơn"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={<CustomButton label="Ghi nhận thanh toán" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", id ?? ""))} />}
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Thanh toán", url: ROUTE_URL.PAYMENT_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          {invoice ? (
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold">Số hóa đơn:</span> {invoice.id}
              </p>
              <p>
                <span className="font-semibold">Hợp đồng:</span> {invoice.contractId}
              </p>
              <p>
                <span className="font-semibold">Khách hàng:</span> {invoice.customerId}
              </p>
              <p>
                <span className="font-semibold">Tổng tiền:</span> {toCurrency(invoice.totalAmount)}
              </p>
              <p>
                <span className="font-semibold">Đã thanh toán:</span> {toCurrency(invoice.paidAmount)}
              </p>
              <p>
                <span className="font-semibold">Còn lại:</span> {toCurrency(invoice.dueAmount)}
              </p>
              <p>
                <span className="font-semibold">Hạn thanh toán:</span> {invoice.dueDate ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Trạng thái:</span> {invoice.status}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Đang tải thông tin hóa đơn...</p>
          )}
        </BaseCard>
      }
    />
  );
};

export default PaymentDetailPage;
