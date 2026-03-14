import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import AuthPageShell from "../shared/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { loginSuccess } from "../../store/authSlice";
import type { AppDispatch } from "../../store";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await authService.login({ email, password });
      localStorage.setItem("access_token", response.accessToken);
      dispatch(
        loginSuccess({
          accessToken: response.accessToken,
          user: response.user,
        }),
      );
      navigate(ROUTE_URL.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Đăng Nhập" subtitle="Chào mừng bạn quay lại! Đăng nhập để tiếp tục." footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <CustomTextField
            title="Mật Khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Nhập mật khẩu"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <CustomButton label={loading ? "Đang xử lý..." : "Đăng Nhập"} className="w-full" onClick={handleSubmit} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            <Link to={ROUTE_URL.FORGOT_PASSWORD} className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link to={ROUTE_URL.REGISTER} className="text-blue-600 hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default LoginPage;
