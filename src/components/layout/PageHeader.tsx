import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  rightActions?: ReactNode;
}

const PageHeader = ({ title, rightActions }: PageHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h1 className="text-4xl font-bold tracking-tight text-blue-950">{title}</h1>
      {rightActions ? <div className="shrink-0">{rightActions}</div> : null}
    </div>
  );
};

export default PageHeader;