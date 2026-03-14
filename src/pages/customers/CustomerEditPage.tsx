import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { customerService } from "../../services/customer/customer.service";
import { getErrorMessage } from "../shared/page.utils";

const CustomerEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await customerService.getDetail(id);
        setFullName(detail.fullName);
        setEmail(detail.email ?? "");
        setPhone(detail.phone ?? "");
        setAddress(detail.address ?? "");
        setStatus(detail.status ?? "ACTIVE");
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load customer for editing"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await customerService.update(id, {
        fullName,
        email,
        phone,
        address,
        status: status as "ACTIVE" | "INACTIVE",
      });
      navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot update customer"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Cập Nhật Khách Hàng" />
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
          <CustomButton label={loading ? "Đang lưu..." : "Lưu Thay Đổi"} onClick={handleUpdate} disabled={loading} />
          <CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CUSTOMER_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default CustomerEditPage;
