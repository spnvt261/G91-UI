import type { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  trend?: string;
}

const InfoCard = ({ title, value, icon, trend }: InfoCardProps) => {
  return (
    <article className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-slate-500">
        <p className="text-sm font-medium">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-slate-800">{value}</p>
      {trend ? <p className="mt-2 text-sm text-emerald-600">{trend}</p> : null}
    </article>
  );
};

export default InfoCard;