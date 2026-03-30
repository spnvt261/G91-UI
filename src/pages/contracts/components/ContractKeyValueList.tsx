import { Space, Typography } from "antd";
import type { ReactNode } from "react";

export interface ContractKeyValueItem {
  key: string;
  label: string;
  value: ReactNode;
}

interface ContractKeyValueListProps {
  items: ContractKeyValueItem[];
}

const ContractKeyValueList = ({ items }: ContractKeyValueListProps) => {
  return (
    <Space orientation="vertical" size={8} style={{ width: "100%" }}>
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(140px, 220px) minmax(0, 1fr)",
            columnGap: 12,
            alignItems: "start",
          }}
        >
          <Typography.Text type="secondary">{item.label}:</Typography.Text>
          <div style={{ minWidth: 0 }}>
            {typeof item.value === "string" || typeof item.value === "number" ? (
              <Typography.Text>{item.value}</Typography.Text>
            ) : (
              item.value
            )}
          </div>
        </div>
      ))}
    </Space>
  );
};

export default ContractKeyValueList;
