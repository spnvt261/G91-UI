import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import AuthPageShell from "../shared/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await authService.register({
        fullName,
        email,
        password,
        confirmPassword,
      });
      navigate(ROUTE_URL.LOGIN);
    } catch (err) {
      setError(getErrorMessage(err, "Register failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Tạo Tài Khoản" subtitle="Đăng ký tài khoản để quản lý báo giá và đơn hàng" footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Họ và Tên" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Công ty An Phát" />
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@company.com" />
          <CustomTextField
            title="Mật Khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Ít nhất 6 ký tự"
          />
          <CustomTextField
            title="Xác Nhận Mật Khẩu"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            placeholder="Nhập lại mật khẩu"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <CustomButton label={loading ? "Đang xử lý..." : "Đăng Ký"} className="w-full" onClick={handleRegister} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link to={ROUTE_URL.LOGIN} className="text-blue-600 hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
