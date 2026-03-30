import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { contractService } from "../../services/contract/contract.service";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";
import type { QuotationItemModel, QuotationModel } from "../../models/quotation/quotation.model";

const PAYMENT_TERMS_MAX_LENGTH = 255;
const DELIVERY_ADDRESS_MAX_LENGTH = 500;

const ContractCreatePage = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams();

  const [quotation, setQuotation] = useState<QuotationModel | null>(null);
  const [quotationNumber, setQuotationNumber] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [canCreateFromQuotation, setCanCreateFromQuotation] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("70% on delivery, 30% within 30 days");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();
  const quotationDetailPath = quotationId
    ? ROUTE_URL.QUOTATION_DETAIL.replace(":id", quotationId)
    : ROUTE_URL.QUOTATION_LIST;

  useEffect(() => {
    const loadQuotation = async () => {
      if (!quotationId) {
        return;
      }

      try {
        setPageLoading(true);
        const detail = await quotationService.getDetail(quotationId);
        setQuotation(detail);
        setQuotationNumber(detail.quotationNumber || detail.id);
        setCustomerLabel(detail.customerName || detail.customerId || "");
        setTotalAmount(detail.totalAmount);
        setCanCreateFromQuotation(Boolean(detail.actions?.accountantCanCreateContract));
      } catch {
        setQuotation(null);
      } finally {
        setPageLoading(false);
      }
    };

    void loadQuotation();
  }, [quotationId]);

  const canCreate = useMemo(() => {
    if (!quotationId || !canCreateFromQuotation) {
      return false;
    }

    const payment = paymentTerms.trim();
    const delivery = deliveryAddress.trim();
    if (!payment || !delivery) {
      return false;
    }

    return payment.length <= PAYMENT_TERMS_MAX_LENGTH && delivery.length <= DELIVERY_ADDRESS_MAX_LENGTH;
  }, [canCreateFromQuotation, deliveryAddress, paymentTerms, quotationId]);

  const itemColumns = useMemo<DataTableColumn<QuotationItemModel>[]>(
    () => [
      { key: "productCode", header: "Product Code" },
      { key: "productName", header: "Product Name" },
      { key: "quantity", header: "Quantity" },
      { key: "unitPrice", header: "Unit Price", render: (row) => toCurrency(row.unitPrice) },
      { key: "totalPrice", header: "Amount", render: (row) => toCurrency(row.totalPrice ?? row.amount) },
    ],
    [],
  );

  const getCreateBlockedReason = () => {
    if (!quotationId) {
      return "Quotation id is required.";
    }
    if (!canCreateFromQuotation) {
      return "This quotation is not eligible for contract creation (already converted or invalid status).";
    }

    const payment = paymentTerms.trim();
    const delivery = deliveryAddress.trim();

    if (!payment) {
      return "Payment terms is required.";
    }
    if (!delivery) {
      return "Delivery address is required.";
    }
    if (payment.length > PAYMENT_TERMS_MAX_LENGTH) {
      return `Payment terms must be at most ${PAYMENT_TERMS_MAX_LENGTH} characters.`;
    }
    if (delivery.length > DELIVERY_ADDRESS_MAX_LENGTH) {
      return `Delivery address must be at most ${DELIVERY_ADDRESS_MAX_LENGTH} characters.`;
    }

    return null;
  };

  const handleCreate = async () => {
    const blockedReason = getCreateBlockedReason();
    if (blockedReason) {
      notify(blockedReason, "error");
      return;
    }

    if (!quotation?.customerId) {
      notify("Không thể create contract: missing customerId from quotation detail.", "error");
      return;
    }

    try {
      setLoading(true);
      const items = (quotation?.items ?? []).reduce<Array<{ productId: string; quantity: number; unitPrice: number }>>((acc, item) => {
        const fallbackUnitPrice = item.unitPrice ?? (item.quantity ? (item.totalPrice ?? item.amount ?? 0) / item.quantity : undefined);

        if (!item.productId || item.quantity <= 0 || typeof fallbackUnitPrice !== "number") {
          return acc;
        }

        acc.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: fallbackUnitPrice,
        });

        return acc;
      }, []);

      const created = await contractService.create({
        customerId: quotation.customerId,
        quotationId: quotationId as string,
        paymentTerms: paymentTerms.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items,
      });

      notify("Contract created successfully.", "success");
      navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", created.id));
    } catch (err) {
      notify(getErrorMessage(err, "Không thể create contract"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={pageLoading}
      loadingText="Đang tải thông tin báo giá..."
      header={
        <ListScreenHeaderTemplate
          title="Create Contract From Quotation"
          actions={
            <div className="flex flex-wrap gap-2">
              <CustomButton
                label="Back To Quotation"
                className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                onClick={() => navigate(quotationDetailPath)}
              />
              <CustomButton
                label={loading ? "Creating..." : "Create Contract"}
                onClick={handleCreate}
                disabled={loading || !canCreate}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Hợp đồng", url: ROUTE_URL.CONTRACT_LIST },
                { label: "Tạo hợp đồng" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          <FormSectionCard title="Quotation Info">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomTextField title="Quotation ID" value={quotationId ?? ""} disabled />
              <CustomTextField title="Quotation Number" value={quotationNumber} disabled />
              <CustomTextField title="Customer" value={customerLabel} disabled />
              <CustomTextField title="Total Amount" value={toCurrency(totalAmount)} disabled />
              <CustomTextField title="Quotation Status" value={quotation?.status ?? ""} disabled />
              <CustomTextField title="Valid Until" value={quotation?.validUntil ?? ""} disabled />
            </div>
          </FormSectionCard>

          <FormSectionCard title="Quotation Items">
            <DataTable columns={itemColumns} data={quotation?.items ?? []} />
          </FormSectionCard>

          <FormSectionCard title="Contract Terms">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomTextField title="Payment Terms" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
              <CustomTextField title="Delivery Address" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Payment terms max {PAYMENT_TERMS_MAX_LENGTH} chars. Delivery address max {DELIVERY_ADDRESS_MAX_LENGTH} chars.
            </p>

            {!canCreateFromQuotation ? (
              <p className="mt-3 text-sm text-amber-600">This quotation does not meet backend policy for contract conversion.</p>
            ) : null}
          </FormSectionCard>
        </div>
      }
    />
  );
};

export default ContractCreatePage;


