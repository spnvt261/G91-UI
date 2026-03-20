import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
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
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const items = await contractService.getList({ keyword, status: "PENDING" });
        setAllItems(items);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load pending contracts"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);

  const columns = useMemo<DataTableColumn<ContractModel>[]>(
    () => [
      { key: "id", header: "Số hợp đồng", className: "font-semibold text-blue-900" },
      { key: "customerId", header: "Khách hàng" },
      { key: "quotationId", header: "Báo giá" },
      { key: "totalAmount", header: "Tổng tiền", render: (row) => toCurrency(row.totalAmount) },
      { key: "createdAt", header: "Ngày tạo" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Danh sách chờ phê duyệt"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Phê duyệt hợp đồng" }]} />}
        />
      }
      body={
        <BaseCard>
          <TableFilterBar
            searchValue={keyword}
            onSearchChange={(value) => {
              setKeyword(value);
              setPage(1);
            }}
          />
          {loading ? <p className="mb-3 text-sm text-slate-500">Đang tải danh sách phê duyệt...</p> : null}
          <DataTable
            columns={columns}
            data={pagedItems}
            actions={(row) => (
              <CustomButton
                label="Phê duyệt"
                className="px-2 py-1 text-sm"
                onClick={() => navigate(ROUTE_URL.CONTRACT_APPROVAL_DETAIL.replace(":id", row.id))}
              />
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default ContractApprovalListPage;
