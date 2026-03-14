import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { customerService } from "../../services/customer/customer.service";
import { getErrorMessage } from "../shared/page.utils";

const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError("");
      const created = await customerService.create({
        fullName,
        email,
        phone,
        address,
        status: status as "ACTIVE" | "INACTIVE",
      });
      navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", created.id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot create customer"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Tạo Khách Hàng" />
      <FormSectionCard title="Thông Tin Khách Hàng">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Tên Khách Hàng" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <CustomTextField title="Số Điện Thoại" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <CustomTextField title="Trạng Thái" value={status} onChange={(event) => setStatus(event.target.value)} />
        </div>
        <div className="mt-4">
          <CustomTextField title="Địa Chỉ" value={address} onChange={(event) => setAddress(event.target.value)} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Đang tạo..." : "Lưu Khách Hàng"} onClick={handleCreate} disabled={loading} />
          <CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default CustomerCreatePage;
