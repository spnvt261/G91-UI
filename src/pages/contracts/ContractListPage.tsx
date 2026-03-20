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

const ContractListPage = () => {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<ContractModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await contractService.getList({ keyword, status: status[0] as ContractModel["status"] | undefined });
        setAllItems(result);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load contracts"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);

  const columns = useMemo<DataTableColumn<ContractModel>[]>(
    () => [
      { key: "id", header: "Số hợp đồng", className: "font-semibold text-blue-900" },
      { key: "quotationId", header: "Báo giá" },
      { key: "customerId", header: "Khách hàng" },
      { key: "status", header: "Trạng thái" },
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
          title="Quản lý hợp đồng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Hợp đồng" }]} />}
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
            filters={[
              {
                key: "status",
                placeholder: "Trạng thái",
                options: [
                  { label: "Draft", value: "DRAFT" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Approved", value: "APPROVED" },
                  { label: "Rejected", value: "REJECTED" },
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Completed", value: "COMPLETED" },
                ],
                value: status,
                onChange: (values) => {
                  setStatus(values);
                  setPage(1);
                },
              },
            ]}
          />
          {loading ? <p className="mb-3 text-sm text-slate-500">Đang tải danh sách hợp đồng...</p> : null}
          <DataTable
            columns={columns}
            data={pagedItems}
            actions={(row) => (
              <div className="flex gap-2">
                <CustomButton
                  label="Chi tiết"
                  className="px-2 py-1 text-sm"
                  onClick={() => navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", row.id))}
                />
                <CustomButton
                  label="Sửa"
                  className="px-2 py-1 text-sm"
                  onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", row.id))}
                />
              </div>
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default ContractListPage;
