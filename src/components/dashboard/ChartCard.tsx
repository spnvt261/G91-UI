import type { ReactNode } from "react";
import BaseCard from "../cards/BaseCard";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => {
  return (
    <BaseCard title={title}>
      {subtitle ? <p className="mb-3 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/50 p-4 text-slate-500">
        {children ?? "Chưa có biểu đồ"}
      </div>
    </BaseCard>
  );
};

export default ChartCard;
