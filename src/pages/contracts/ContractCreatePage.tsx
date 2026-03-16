import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { contractService } from "../../services/contract/contract.service";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const ContractCreatePage = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams();

  const [quotationNumber, setQuotationNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [canCreateFromQuotation, setCanCreateFromQuotation] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("Thanh toan trong 30 ngay");
  const [deliveryAddress, setDeliveryAddress] = useState("Ha Noi");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const loadQuotation = async () => {
      if (!quotationId) {
        return;
      }

      try {
        const detail = await quotationService.getDetail(quotationId);
        setQuotationNumber(detail.quotationNumber || detail.id);
        setCustomerId(detail.customerName || detail.customerId || "");
        setTotalAmount(detail.totalAmount);
        setCanCreateFromQuotation(Boolean(detail.actions?.accountantCanCreateContract));
      } catch {
        // Keep form editable even if prefill fails.
      }
    };

    void loadQuotation();
  }, [quotationId]);

  const canCreate = useMemo(
    () => Boolean(quotationId && canCreateFromQuotation && paymentTerms.trim() && deliveryAddress.trim()),
    [canCreateFromQuotation, deliveryAddress, paymentTerms, quotationId],
  );

  const handleCreate = async () => {
    if (!quotationId) {
      notify("Quotation id is required.", "error");
      return;
    }

    try {
      setLoading(true);
      const created = await contractService.createFromQuotation(quotationId, {
        paymentTerms,
        deliveryAddress,
      });

      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", created.contract.quotationId));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot create contract from quotation"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Create Contract From Quotation" />
      <FormSectionCard title="Quotation Info">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Quotation ID" value={quotationId ?? ""} disabled />
          <CustomTextField title="Quotation Number" value={quotationNumber} disabled />
          <CustomTextField title="Customer" value={customerId} disabled />
          <CustomTextField title="Total Amount" value={toCurrency(totalAmount)} disabled />
        </div>
      </FormSectionCard>

      <FormSectionCard title="Contract Terms">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Payment Terms" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
          <CustomTextField title="Delivery Address" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} />
        </div>
        {!canCreateFromQuotation ? (
          <p className="mt-3 text-sm text-amber-600">Quotation này chưa đủ điều kiện chuyển thành contract theo nghiệp vụ backend.</p>
        ) : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Creating..." : "Create Contract"} onClick={handleCreate} disabled={loading || !canCreate} />
          <CustomButton
            label="Back"
            className="bg-slate-200 text-slate-700 hover:bg-slate-300"
            onClick={() => navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", quotationId ?? ""))}
          />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ContractCreatePage;
