import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import { ROUTE_URL } from "../../const/route_url.const";
import type { QuotationItemModel, QuotationModel } from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const QuotationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quotation, setQuotation] = useState<QuotationModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        const detail = await quotationService.getDetail(id);
        setQuotation(detail);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load quotation detail"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const columns = useMemo<DataTableColumn<QuotationItemModel>[]>(
    () => [
      { key: "productCode", header: "Ma SP" },
      { key: "productName", header: "Ten San Pham" },
      { key: "quantity", header: "So Luong" },
      { key: "unitPrice", header: "Don Gia", render: (row) => toCurrency(row.unitPrice) },
      { key: "amount", header: "Thanh Tien", render: (row) => toCurrency(row.amount) },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chi Tiet Bao Gia"
        rightActions={
          <div className="flex gap-2">
            <CustomButton
              label="Tao Hop Dong"
              onClick={() => navigate(ROUTE_URL.CONTRACT_CREATE.replace(":quotationId", quotation?.id ?? ""))}
              disabled={!quotation}
            />
            <CustomButton
              label="Quay Lai"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}
            />
          </div>
        }
      />
      <BaseCard>
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading quotation...</p> : null}
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        {quotation ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p><span className="font-semibold">So Bao Gia:</span> {quotation.id}</p>
              <p><span className="font-semibold">Khach Hang:</span> {quotation.customerId}</p>
              <p><span className="font-semibold">Trang Thai:</span> {quotation.status}</p>
              <p><span className="font-semibold">Tong Tien:</span> {toCurrency(quotation.totalAmount)}</p>
            </div>
            <DataTable columns={columns} data={quotation.items} />
          </div>
        ) : null}
      </BaseCard>
    </div>
  );
};

export default QuotationDetailPage;
