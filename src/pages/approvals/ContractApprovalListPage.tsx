import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PAGE_SIZE = 8;

const ContractApprovalListPage = () => {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<ContractModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await contractService.getList({ keyword, status: "PENDING" });
        setAllItems(items);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load pending contracts"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);

  const columns = useMemo<DataTableColumn<ContractModel>[]>(
    () => [
      { key: "id", header: "Số Hợp Đồng", className: "font-semibold text-blue-900" },
      { key: "customerId", header: "Khách Hàng" },
      { key: "quotationId", header: "Báo Giá" },
      { key: "totalAmount", header: "Tổng Tiền", render: (row) => toCurrency(row.totalAmount) },
      { key: "createdAt", header: "Ngày Tạo" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Danh Sách Chờ Phê Duyệt" />
      <BaseCard>
        <TableFilterBar
          searchValue={keyword}
          onSearchChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
        />
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading approvals...</p> : null}
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <DataTable
          columns={columns}
          data={pagedItems}
          actions={(row) => (
            <CustomButton
              label="Phê Duyệt"
              className="px-2 py-1 text-sm"
              onClick={() => navigate(ROUTE_URL.CONTRACT_APPROVAL_DETAIL.replace(":id", row.id))}
            />
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
      </BaseCard>
    </div>
  );
};

export default ContractApprovalListPage;
