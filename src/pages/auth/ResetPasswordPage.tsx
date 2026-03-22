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
      notify("Xác nhận mật khẩu không khớp", "error");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        token,
        newPassword,
        confirmNewPassword,
      });
      notify("Đặt lại mật khẩu thành công", "success");
      navigate(ROUTE_URL.LOGIN);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot reset password"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Đặt Mật Khẩu Mới" subtitle="Tạo mật khẩu mới cho tài khoản của bạn" footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Mã Token Đặt Lại" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Nhập token" />
          <CustomTextField
            title="Mật Khẩu Mới"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            placeholder="Ít nhất 6 ký tự"
          />
          <CustomTextField
            title="Xác Nhận Mật Khẩu"
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            type="password"
            placeholder="Nhập lại mật khẩu"
          />
          <CustomButton label={loading ? "Đang xử lý..." : "Đặt Mật Khẩu"} className="w-full" onClick={handleSubmit} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            <Link to={ROUTE_URL.LOGIN} className="text-blue-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
