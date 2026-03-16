import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const CustomerCreatePage = () => {
  const navigate = useNavigate();
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

  const handleCreate = async () => {
    try {
      setLoading(true);
      const parsedCreditLimit = Number(creditLimit);
      const created = await customerService.create({
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
      navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", created.id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot create customer"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Tao Khach Hang" />
      <FormSectionCard title="Thong Tin Khach Hang">
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
          <CustomButton label={loading ? "Dang tao..." : "Luu Khach Hang"} onClick={handleCreate} disabled={loading} />
          <CustomButton label="Quay Lai" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default CustomerCreatePage;
