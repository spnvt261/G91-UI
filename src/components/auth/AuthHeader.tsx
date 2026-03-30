import type { ReactNode } from "react";

interface AuthHeaderProps {
  logo?: ReactNode;
  systemName?: string;
  tagline?: string;
}

const DefaultLogo = () => (
  <div className="h-12 w-12 rounded-xl bg-white/20 p-2">
    <svg viewBox="0 0 24 24" className="h-full w-full text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2 3 6v6c0 5.3 3.8 9.7 9 10 5.2-.3 9-4.7 9-10V6l-9-4Z" />
      <path d="M8 10h8M8 14h6" />
    </svg>
  </div>
);

const AuthHeader = ({
  logo,
  systemName = "G91 Điều Hành",
  tagline = "Nền tảng quản trị vận hành doanh nghiệp",
}: AuthHeaderProps) => {
  return (
    <header className="rounded-t-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-5 text-white">
      <div className="flex items-center gap-3">
        {logo ?? <DefaultLogo />}
        <div>
          <p className="text-3xl font-semibold leading-tight">{systemName}</p>
          <p className="text-sm text-blue-100">{tagline}</p>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
