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
import { getDefaultRouteByRole } from "../../const/authz.const";
import { persistAuthSession } from "../../utils/authSession";
import { useNotify } from "../../context/notifyContext";

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      persistAuthSession(response.accessToken, response.user.role);
      dispatch(
        loginSuccess({
          accessToken: response.accessToken,
          user: response.user,
        }),
      );
      notify("Dang nhap thanh cong", "success");
      navigate(getDefaultRouteByRole(response.user.role));
    } catch (err) {
      notify(getErrorMessage(err, "Login failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Dang Nhap" subtitle="Chao mung ban quay lai. Dang nhap de tiep tuc." footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <CustomTextField
            title="Mat Khau"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Nhap mat khau"
          />
          <CustomButton label={loading ? "Dang xu ly..." : "Dang Nhap"} className="w-full" onClick={handleSubmit} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            <Link to={ROUTE_URL.FORGOT_PASSWORD} className="text-blue-600 hover:underline">
              Quen mat khau?
            </Link>
          </div>
          <div className="text-center text-sm text-slate-600">
            Chua co tai khoan?{" "}
            <Link to={ROUTE_URL.REGISTER} className="text-blue-600 hover:underline">
              Dang ky
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default LoginPage;
