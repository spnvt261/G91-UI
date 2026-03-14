import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage } from "../shared/page.utils";

const ContractEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [quotationId, setQuotationId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await contractService.getDetail(id);
        setQuotationId(detail.quotationId);
        setCustomerId(detail.customerId);
        setProductId(detail.items[0]?.productId ?? "");
        setQuantity(String(detail.items[0]?.quantity ?? 1));
        setUnitPrice(String(detail.items[0]?.unitPrice ?? 0));
        setPaymentTerms(detail.paymentTerms ?? "");
        setStatus(detail.status);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load contract for editing"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleSave = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await contractService.update(id, {
        quotationId,
        customerId,
        items: [
          {
            productId,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
          },
        ],
        totalAmount: Number(quantity) * Number(unitPrice),
        paymentTerms,
        status: status as "DRAFT",
      });
      navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot update contract"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Chỉnh Sửa Hợp Đồng" />
      <FormSectionCard title="Thông Tin Hợp Đồng">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Báo Giá" value={quotationId} onChange={(event) => setQuotationId(event.target.value)} />
          <CustomTextField title="Khách Hàng" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          <CustomTextField title="Product ID" value={productId} onChange={(event) => setProductId(event.target.value)} />
          <CustomTextField title="Số Lượng" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <CustomTextField title="Don Giá" type="number" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
          <CustomTextField title="Trạng Thái" value={status} onChange={(event) => setStatus(event.target.value)} />
        </div>
      </FormSectionCard>
      <FormSectionCard title="Điều Khoản Thanh Toán">
        <CustomTextField title="Payment Terms" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Đang lưu..." : "Lưu Thay Đổi"} onClick={handleSave} disabled={loading} />
          <CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ContractEditPage;
