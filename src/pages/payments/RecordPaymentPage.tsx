import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { paymentService } from "../../services/payment/payment.service";
import { getErrorMessage } from "../shared/page.utils";

const RecordPaymentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const handleRecord = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      await paymentService.recordPayment(id, {
        amount: Number(amount),
        paidAt,
        method,
        note,
      });
      navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Không thể record payment"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Ghi nhận thanh toán"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Thanh toán", url: ROUTE_URL.PAYMENT_LIST },
                { label: "Ghi nhận" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Thông tin thanh toán">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomTextField title="Số tiền" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <CustomTextField title="Ngày thanh toán" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
            <CustomTextField title="Hình thức" value={method} onChange={(event) => setMethod(event.target.value)} />
            <CustomTextField title="Ghi chú" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <div className="mt-4 flex gap-3">
            <CustomButton label={loading ? "Đang ghi nhận..." : "Xác nhận"} onClick={handleRecord} disabled={loading || !amount} />
            <CustomButton label="Quay lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)} />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default RecordPaymentPage;

