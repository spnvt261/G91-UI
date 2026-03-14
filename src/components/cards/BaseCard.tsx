import type { ReactNode } from "react";

interface BaseCardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const BaseCard = ({ title, actions, children, className = "" }: BaseCardProps) => {
  return (
    <section className={`rounded-lg bg-white p-4 shadow-sm ${className}`.trim()}>
      {title || actions ? (
        <header className="mb-4 flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
};

export default BaseCard;