import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ContractItemModel, ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const ContractDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contract, setContract] = useState<ContractModel | null>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await contractService.getDetail(id);
        setContract(detail);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load contract detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const columns = useMemo<DataTableColumn<ContractItemModel>[]>(
    () => [
      { key: "productCode", header: "Mã SP" },
      { key: "productName", header: "Tên Sản Phẩm" },
      { key: "quantity", header: "Số Lượng" },
      { key: "unitPrice", header: "Don Giá", render: (row) => toCurrency(row.unitPrice) },
      { key: "amount", header: "Thành Tiền", render: (row) => toCurrency(row.amount) },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chi Tiết Hợp Đồng"
        rightActions={
          <div className="flex gap-2">
            <CustomButton
              label="Theo Dõi"
              onClick={() => navigate(ROUTE_URL.CONTRACT_TRACKING.replace(":id", contract?.id ?? ""))}
              disabled={!contract}
            />
            <CustomButton
              label="Chỉnh Sửa"
              onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", contract?.id ?? ""))}
              disabled={!contract}
            />
          </div>
        }
      />
      <BaseCard>
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading contract...</p> : null}
        {contract ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p><span className="font-semibold">Số Hợp Đồng:</span> {contract.id}</p>
              <p><span className="font-semibold">Báo Giá:</span> {contract.quotationId}</p>
              <p><span className="font-semibold">Khách Hàng:</span> {contract.customerId}</p>
              <p><span className="font-semibold">Trạng Thái:</span> {contract.status}</p>
              <p><span className="font-semibold">Payment Terms:</span> {contract.paymentTerms ?? "-"}</p>
              <p><span className="font-semibold">Tổng Tiền:</span> {toCurrency(contract.totalAmount)}</p>
            </div>
            <DataTable columns={columns} data={contract.items} />
          </div>
        ) : null}
      </BaseCard>
    </div>
  );
};

export default ContractDetailPage;
