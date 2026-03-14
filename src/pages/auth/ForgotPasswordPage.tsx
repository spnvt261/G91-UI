import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import AuthPageShell from "../shared/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await authService.forgotPassword({ email });
      setMessage("Yêu cầu đặt lại mật khẩu đã được gửi");
    } catch (err) {
      setError(getErrorMessage(err, "Cannot process forgot password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Quên Mật Khẩu" subtitle="Nhập email đăng ký để nhận hướng dẫn đặt lại mật khẩu" footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@company.com" />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
          <CustomButton label={loading ? "Đang gửi..." : "Gửi Yêu Cầu"} className="w-full" onClick={handleSubmit} disabled={loading} />
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

export default ForgotPasswordPage;
