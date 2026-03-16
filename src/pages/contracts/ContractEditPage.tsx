import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import type { ContractUpdateRequest } from "../../models/contract/contract.model";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { contractService } from "../../services/contract/contract.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const ContractEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();

  const [quotationId, setQuotationId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("");
  const [note, setNote] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [confidential, setConfidential] = useState("false");
  const [status, setStatus] = useState("DRAFT");
  const [changeReason, setChangeReason] = useState("Updated from UI");
  const [loading, setLoading] = useState(false);
  const isAccountant = getStoredUserRole() === "ACCOUNTANT";

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
        setDeliveryAddress(detail.deliveryAddress ?? "");
        setDeliveryTerms(detail.deliveryTerms ?? "");
        setNote(detail.note ?? "");
        setExpectedDeliveryDate(detail.expectedDeliveryDate?.slice(0, 10) ?? "");
        setConfidential(String(Boolean(detail.confidential)));
        setStatus(detail.status);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load contract for editing"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleSave = async () => {
    if (!id) {
      return;
    }

    const normalizedQuotationId = quotationId.trim();
    if (!normalizedQuotationId) {
      notify("Quotation ID is required.", "error");
      return;
    }

    try {
      setLoading(true);
      const payload: ContractUpdateRequest = {
        quotationId: normalizedQuotationId,
        customerId,
        paymentTerms: paymentTerms.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryTerms: deliveryTerms.trim() || undefined,
        note: note.trim() || undefined,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        confidential: confidential.trim().toLowerCase() === "true",
        changeReason: changeReason.trim() || "Updated from UI",
        items: [
          {
            productId,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
          },
        ],
      };

      await contractService.update(id, payload);
      navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot update contract"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Chinh Sua Hop Dong" />
      <FormSectionCard title="Thong Tin Hop Dong">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Quotation ID" value={quotationId} onChange={(event) => setQuotationId(event.target.value)} />
          <CustomTextField title="Customer ID" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          <CustomTextField title="Product ID" value={productId} onChange={(event) => setProductId(event.target.value)} />
          <CustomTextField title="Quantity" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <CustomTextField title="Unit Price" type="number" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
          <CustomTextField title="Status" value={status} onChange={(event) => setStatus(event.target.value)} disabled={isAccountant} />
          <CustomTextField title="Expected Delivery Date" value={expectedDeliveryDate} onChange={(event) => setExpectedDeliveryDate(event.target.value)} />
          <CustomTextField title="Confidential (true/false)" value={confidential} onChange={(event) => setConfidential(event.target.value)} />
        </div>
      </FormSectionCard>

      <FormSectionCard title="Dieu Khoan">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Payment Terms" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
          <CustomTextField title="Delivery Address" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} />
          <CustomTextField title="Delivery Terms" value={deliveryTerms} onChange={(event) => setDeliveryTerms(event.target.value)} />
          <CustomTextField title="Change Reason" value={changeReason} onChange={(event) => setChangeReason(event.target.value)} />
        </div>
        <div className="mt-4">
          <CustomTextField title="Note" value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Dang luu..." : "Luu Thay Doi"} onClick={handleSave} disabled={loading} />
          <CustomButton label="Quay Lai" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ContractEditPage;
