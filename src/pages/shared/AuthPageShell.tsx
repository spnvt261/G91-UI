import type { ReactNode } from "react";
import ContentWrapper from "../../components/layout/ContentWrapper";

interface AuthPageShellProps {
  children: ReactNode;
}

const AuthPageShell = ({ children }: AuthPageShellProps) => {
  return (
    <ContentWrapper>
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">{children}</div>
    </ContentWrapper>
  );
};

export default AuthPageShell;
