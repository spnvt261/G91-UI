import type { ReactNode } from "react";
import InfoCard from "../cards/InfoCard";

export interface StatItem {
  title: string;
  value: string;
  icon?: ReactNode;
  trend?: string;
}

interface StatsGridProps {
  items: StatItem[];
}

const StatsGrid = ({ items }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <InfoCard key={item.title} {...item} />
      ))}
    </div>
  );
};

export default StatsGrid;