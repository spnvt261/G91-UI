import type { ReactNode } from "react";
import BaseCard from "../cards/BaseCard";
import AuthHeader from "./AuthHeader";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  logo?: ReactNode;
  className?: string;
}

const AuthCard = ({ title, subtitle, children, footer, logo, className = "" }: AuthCardProps) => {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-xl ${className}`.trim()}>
      <AuthHeader logo={logo} />
      <BaseCard className="rounded-none p-7 shadow-none">
        <div className="mb-6 text-center">
          <h2 className="text-5xl font-bold text-blue-950">{title}</h2>
          {subtitle ? <p className="mt-2 text-slate-500">{subtitle}</p> : null}
        </div>
        {children}
      </BaseCard>
      {footer}
    </div>
  );
};

export default AuthCard;