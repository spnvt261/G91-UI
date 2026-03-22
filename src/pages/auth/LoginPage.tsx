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
import { ApiClientError } from "../../apiConfig/axiosConfig";

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
      notify("Login successfully", "success");
      navigate(getDefaultRouteByRole(response.user.role));
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "EMAIL_VERIFICATION_REQUIRED") {
        const normalizedEmail = email.trim();
        const query = normalizedEmail ? `?email=${encodeURIComponent(normalizedEmail)}` : "";
        notify("Please verify your email before login", "warning");
        navigate(`${ROUTE_URL.VERIFY_REGISTRATION}${query}`, { state: { email: normalizedEmail } });
        return;
      }

      notify(getErrorMessage(err, "Login failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Login" subtitle="Welcome back. Login to continue." footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <CustomTextField
            title="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Enter password"
          />
          <CustomButton label={loading ? "Processing..." : "Login"} className="w-full" onClick={handleSubmit} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            <Link to={ROUTE_URL.FORGOT_PASSWORD} className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="text-center text-sm text-slate-600">
            No account yet?{" "}
            <Link to={ROUTE_URL.REGISTER} className="text-blue-600 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default LoginPage;
