import { Card, Flex } from "antd";
import type { ReactNode } from "react";

interface ContractActionBarProps {
  children: ReactNode;
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
}

const ContractActionBar = ({ children, justify = "flex-end" }: ContractActionBarProps) => {
  return (
    <Card bordered={false} className="shadow-sm" styles={{ body: { padding: 12 } }}>
      <Flex wrap gap={8} justify={justify}>
        {children}
      </Flex>
    </Card>
  );
};

export default ContractActionBar;
