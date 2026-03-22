import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import { useNotify } from "../../context/notifyContext";
import { ROUTE_URL } from "../../const/route_url.const";
import { authService } from "../../services/auth/auth.service";
import { getErrorMessage } from "../shared/page.utils";
import AuthPageShell from "../shared/AuthPageShell";

type VerifyRegistrationLocationState = {
  email?: string;
  expireMinutes?: number;
};

const isVerifyRegistrationLocationState = (value: unknown): value is VerifyRegistrationLocationState =>
  typeof value === "object" && value !== null;

const VerifyRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useNotify();

  const locationState = useMemo(() => {
    if (!isVerifyRegistrationLocationState(location.state)) {
      return undefined;
    }

    return location.state;
  }, [location.state]);

  const emailFromQuery = useMemo(() => new URLSearchParams(location.search).get("email") ?? "", [location.search]);
  const [email, setEmail] = useState(emailFromQuery || locationState?.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [expireMinutes, setExpireMinutes] = useState<number | null>(locationState?.expireMinutes ?? null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyRegistration = async () => {
    const normalizedEmail = email.trim();
    const normalizedCode = verificationCode.trim().toUpperCase();

    if (!normalizedEmail) {
      notify("Email is required", "error");
      return;
    }

    if (!normalizedCode) {
      notify("Verification code is required", "error");
      return;
    }

    try {
      setVerifyLoading(true);
      const response = await authService.verifyRegistration({
        email: normalizedEmail,
        verificationCode: normalizedCode,
      });
      notify("Account verified successfully. Please login.", "success");
      navigate(response.redirectTo || ROUTE_URL.LOGIN, { replace: true });
    } catch (err) {
      notify(getErrorMessage(err, "Cannot verify registration"), "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      notify("Email is required", "error");
      return;
    }

    try {
      setResendLoading(true);
      const response = await authService.resendVerificationCode({
        email: normalizedEmail,
      });
      setExpireMinutes(response.expireMinutes);
      notify(`A new verification code has been sent (valid in ${response.expireMinutes} minutes).`, "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot resend verification code"), "error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard title="Verify Registration" subtitle="Confirm your email to activate account" footer={<AuthFooter />}>
        <div className="space-y-4">
          <CustomTextField title="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@company.com" />
          <CustomTextField
            title="Verification Code"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.toUpperCase().slice(0, 5))}
            placeholder="ABCDE"
          />
          {expireMinutes !== null ? <div className="text-xs text-slate-500">Code expires in {expireMinutes} minutes.</div> : null}
          <CustomButton
            label={verifyLoading ? "Verifying..." : "Verify Account"}
            className="w-full"
            onClick={handleVerifyRegistration}
            disabled={verifyLoading || resendLoading}
          />
          <CustomButton
            label={resendLoading ? "Sending..." : "Resend Code"}
            className="w-full !bg-slate-600 hover:!bg-slate-700"
            onClick={handleResendVerificationCode}
            disabled={verifyLoading || resendLoading}
          />
          <div className="text-center text-sm text-slate-600">
            <Link to={ROUTE_URL.LOGIN} className="text-blue-600 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
};

export default VerifyRegistrationPage;
