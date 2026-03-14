import type { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

const ContentWrapper = ({ children }: ContentWrapperProps) => {
  return <div className="min-h-screen bg-gray-100 p-6">{children}</div>;
};

export default ContentWrapper;