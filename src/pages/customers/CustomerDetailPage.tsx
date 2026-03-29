import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();

  const canUpdateCustomer = canPerformAction(role, "customer.update");
  const canDisableCustomer = canPerformAction(role, "customer.delete-disable");

  const [customer, setCustomer] = useState<CustomerModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const { notify } = useNotify();

  const loadCustomer = async (customerId: string) => {
    const detail = await customerService.getDetail(customerId);
    setCustomer(detail);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        await loadCustomer(id);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load customer detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleDisableCustomer = async () => {
    if (!id || !customer || customer.status === "INACTIVE") {
      return;
    }

    try {
      setDisabling(true);
      const updated = await customerService.disable(id);
      setCustomer(updated);
      notify("Ðã vô hi?u hóa khách hàng.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot disable customer"), "error");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Ðang t?i thông tin khách hàng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi ti?t khách hàng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex gap-2">
              {canUpdateCustomer ? (
                <CustomButton label="Ch?nh s?a" onClick={() => navigate(ROUTE_URL.CUSTOMER_EDIT.replace(":id", id ?? ""))} disabled={disabling} />
              ) : null}
              {canDisableCustomer ? (
                <CustomButton
                  label={customer?.status === "INACTIVE" ? "Ðã vô hi?u" : disabling ? "Ðang x? lý..." : "Vô hi?u hóa"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDisableCustomer}
                  disabled={!customer || customer.status === "INACTIVE" || disabling}
                />
              ) : null}
              <CustomButton
                label="Quay l?i"
                className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)}
                disabled={disabling}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "Khách hàng", url: ROUTE_URL.CUSTOMER_LIST },
                { label: "Chi ti?t" },
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
            <p className="text-sm text-slate-500">Không có d? li?u khách hàng.</p>
          )}
        </BaseCard>
      }
    />
  );
};

export default CustomerDetailPage;

