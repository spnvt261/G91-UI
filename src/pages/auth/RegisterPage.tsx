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
      setError("Xac nhan mat khau khong khop");
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
      <AuthCard title="Tao Tai Khoan" subtitle="Dang ky tai khoan de quan ly bao gia va don hang" footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Ho Va Ten" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Cong ty An Phat" />
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@company.com" />
          <CustomTextField
            title="Mat Khau"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="It nhat 6 ky tu"
          />
          <CustomTextField
            title="Xac Nhan Mat Khau"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            placeholder="Nhap lai mat khau"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <CustomButton label={loading ? "Dang xu ly..." : "Dang Ky"} className="w-full" onClick={handleRegister} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            Da co tai khoan?{" "}
            <Link to={ROUTE_URL.LOGIN} className="text-blue-600 hover:underline">
              Dang nhap
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
