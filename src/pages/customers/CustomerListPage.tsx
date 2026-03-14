import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import { ROUTE_URL } from "../../const/route_url.const";
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const CustomerListPage = () => {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<CustomerModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await customerService.getList({ keyword, status: status[0] as "ACTIVE" | "INACTIVE" | undefined });
        setAllItems(result);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load customers"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, status]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);

  const columns = useMemo<DataTableColumn<CustomerModel>[]>(
    () => [
      { key: "id", header: "ID", className: "font-semibold text-blue-900" },
      { key: "fullName", header: "Ten Khach Hang" },
      { key: "email", header: "Email" },
      { key: "phone", header: "So Dien Thoai" },
      { key: "status", header: "Trang Thai" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Quan Ly Khach Hang" rightActions={<CustomButton label="Tao Khach Hang" onClick={() => navigate(ROUTE_URL.CUSTOMER_CREATE)} />} />
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
              placeholder: "Trang Thai",
              options: [
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ],
              value: status,
              onChange: (values) => {
                setStatus(values);
                setPage(1);
              },
            },
          ]}
        />
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading customers...</p> : null}
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <DataTable
          columns={columns}
          data={pagedItems}
          actions={(row) => (
            <CustomButton label="Xem" className="px-2 py-1 text-sm" onClick={() => navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", row.id))} />
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
      </BaseCard>
    </div>
  );
};

export default CustomerListPage;
