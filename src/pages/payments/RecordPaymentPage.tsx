import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
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
  const [error, setError] = useState("");

  const handleRecord = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await paymentService.recordPayment(id, {
        amount: Number(amount),
        paidAt,
        method,
        note,
      });
      navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot record payment"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Ghi Nhận Thanh Toán" />
      <FormSectionCard title="Thông Tin Thanh Toán">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Số Tiền" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
          <CustomTextField title="Ngày Thanh Toán" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
          <CustomTextField title="Hình Thức" value={method} onChange={(event) => setMethod(event.target.value)} />
          <CustomTextField title="Ghi Chú" value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Đang ghi nhận..." : "Xác Nhận"} onClick={handleRecord} disabled={loading || !amount} />
          <CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default RecordPaymentPage;
