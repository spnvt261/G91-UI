import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerModel | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const detail = await customerService.getDetail(id);
        setCustomer(detail);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load customer detail"), "error");
      }
    };

    void load();
  }, [id, notify]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi tiết khách hàng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex gap-2">
              <CustomButton label="Chỉnh sửa" onClick={() => navigate(ROUTE_URL.CUSTOMER_EDIT.replace(":id", id ?? ""))} />
              <CustomButton label="Quay lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Khách hàng", url: ROUTE_URL.CUSTOMER_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          {customer ? (
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold">ID:</span> {customer.id}
              </p>
              <p>
                <span className="font-semibold">Company Name:</span> {customer.companyName ?? customer.fullName ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Contact Person:</span> {customer.contactPerson ?? customer.fullName ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Customer Type:</span> {customer.customerType ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {customer.email ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {customer.phone ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {customer.address ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Credit Limit:</span> {customer.creditLimit != null ? toCurrency(customer.creditLimit) : "-"}
              </p>
              <p>
                <span className="font-semibold">Current Debt:</span> {customer.currentDebt != null ? toCurrency(customer.currentDebt) : "-"}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {customer.status ?? "-"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Đang tải thông tin khách hàng...</p>
          )}
        </BaseCard>
      }
    />
  );
};

export default CustomerDetailPage;
