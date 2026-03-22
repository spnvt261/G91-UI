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
import { useNotify } from "../../context/notifyContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      notify("Password confirmation does not match", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register({
        fullName,
        email,
        password,
        confirmPassword,
      });

      const nextRoute = response.redirectTo || ROUTE_URL.VERIFY_REGISTRATION;
      notify("Registration created. Please verify your account.", "success");
      navigate(nextRoute, {
        state: {
          email: response.email || email.trim(),
          expireMinutes: response.expireMinutes,
        },
      });
    } catch (err) {
      notify(getErrorMessage(err, "Register failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Create Account" subtitle="Register to manage quotations and orders" footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" />
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@company.com" />
          <CustomTextField
            title="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="At least 6 characters"
          />
          <CustomTextField
            title="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            placeholder="Re-enter password"
          />
          <CustomButton label={loading ? "Processing..." : "Register"} className="w-full" onClick={handleRegister} disabled={loading} />
          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to={ROUTE_URL.LOGIN} className="text-blue-600 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
