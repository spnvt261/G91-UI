import type { ReactNode } from "react";

interface FormSectionCardProps {
  title: string;
  children: ReactNode;
}

const FormSectionCard = ({ title, children }: FormSectionCardProps) => {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
};

export default FormSectionCard;