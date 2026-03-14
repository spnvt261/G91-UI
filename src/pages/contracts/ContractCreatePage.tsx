import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { contractService } from "../../services/contract/contract.service";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage } from "../shared/page.utils";

const ContractCreatePage = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams();

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("Thanh toan trong 30 ngay");
  const [deliveryAddress, setDeliveryAddress] = useState("Ha Noi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuotation = async () => {
      if (!quotationId) {
        return;
      }

      try {
        const quotation = await quotationService.getDetail(quotationId);
        setCustomerId(quotation.customerId);
        setProductId(quotation.items[0]?.productId ?? "");
        setQuantity(String(quotation.items[0]?.quantity ?? 1));
        setUnitPrice(String(quotation.items[0]?.unitPrice ?? 0));
      } catch {
        // Keep form editable even if quotation prefill fails.
      }
    };

    void loadQuotation();
  }, [quotationId]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError("");
      const created = await contractService.create({
        quotationId: quotationId ?? "manual-quotation",
        customerId,
        items: [
          {
            productId,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
          },
        ],
        totalAmount: Number(quantity) * Number(unitPrice),
        paymentTerms: `${paymentTerms} | ${deliveryAddress}`,
        status: "DRAFT",
      });
      navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", created.id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot create contract"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Tao Hop Dong" />
      <FormSectionCard title="Thong Tin Co Ban">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Bao Gia" value={quotationId ?? "manual"} disabled />
          <CustomTextField title="Khach Hang" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
        </div>
      </FormSectionCard>

      <FormSectionCard title="Chi Tiet Hang Hoa">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CustomTextField title="Product ID" value={productId} onChange={(event) => setProductId(event.target.value)} />
          <CustomTextField title="So Luong" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <CustomTextField title="Don Gia" type="number" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
        </div>
      </FormSectionCard>

      <FormSectionCard title="Dieu Khoan">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Payment Terms" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
          <CustomTextField title="Delivery Address" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Dang tao..." : "Luu Hop Dong"} onClick={handleCreate} disabled={loading} />
          <CustomButton label="Quay Lai" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ContractCreatePage;
