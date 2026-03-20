import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const CustomerEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();
  const isAccountant = getStoredUserRole() === "ACCOUNTANT";

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await customerService.getDetail(id);
        setCompanyName(detail.companyName ?? detail.fullName ?? "");
        setContactPerson(detail.contactPerson ?? detail.fullName ?? "");
        setCustomerType(detail.customerType ?? "");
        setEmail(detail.email ?? "");
        setPhone(detail.phone ?? "");
        setAddress(detail.address ?? "");
        setCreditLimit(detail.creditLimit != null ? String(detail.creditLimit) : "");
        setStatus(detail.status ?? "ACTIVE");
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load customer for editing"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleUpdate = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      const parsedCreditLimit = Number(creditLimit);
      await customerService.update(id, {
        fullName: contactPerson.trim() || companyName.trim(),
        companyName: companyName.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        customerType: customerType.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        creditLimit: Number.isFinite(parsedCreditLimit) && parsedCreditLimit >= 0 ? parsedCreditLimit : undefined,
        status: status as "ACTIVE" | "INACTIVE",
      });
      navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot update customer"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Cập nhật khách hàng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Khách hàng", url: ROUTE_URL.CUSTOMER_LIST },
                { label: "Cập nhật" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Thông tin khách hàng">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomTextField title="Company Name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            <CustomTextField title="Contact Person" value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} />
            <CustomTextField title="Customer Type" value={customerType} onChange={(event) => setCustomerType(event.target.value)} />
            <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <CustomTextField title="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <CustomTextField title="Credit Limit" type="number" value={creditLimit} onChange={(event) => setCreditLimit(event.target.value)} />
            <CustomTextField title="Status" value={status} onChange={(event) => setStatus(event.target.value)} disabled={isAccountant} />
          </div>
          <div className="mt-4">
            <CustomTextField title="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
          <div className="mt-4 flex gap-3">
            <CustomButton label={loading ? "Đang lưu..." : "Lưu thay đổi"} onClick={handleUpdate} disabled={loading} />
            <CustomButton label="Quay lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default CustomerEditPage;
