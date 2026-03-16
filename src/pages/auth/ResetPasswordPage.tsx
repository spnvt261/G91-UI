import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import AuthPageShell from "../shared/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const tokenFromQuery = useMemo(() => new URLSearchParams(location.search).get("token") ?? "", [location.search]);

  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      notify("Xac nhan mat khau khong khop", "error");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        token,
        newPassword,
        confirmNewPassword,
      });
      notify("Dat lai mat khau thanh cong", "success");
      navigate(ROUTE_URL.LOGIN);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot reset password"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Dat Mat Khau Moi" subtitle="Tao mat khau moi cho tai khoan cua ban" footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Reset Token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Nhap token" />
          <CustomTextField
            title="Mat Khau Moi"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            placeholder="It nhat 6 ky tu"
          />
          <CustomTextField
            title="Xac Nhan Mat Khau"
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            type="password"
            placeholder="Nhap lai mat khau"
          />
          <CustomButton label={loading ? "Dang xu ly..." : "Dat Mat Khau"} className="w-full" onClick={handleSubmit} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            <Link to={ROUTE_URL.LOGIN} className="text-blue-600 hover:underline">
              Quay lai dang nhap
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
