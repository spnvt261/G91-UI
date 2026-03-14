import { useMemo, useState } from "react";
import SidebarItem, { type SidebarNode } from "./SidebarItem";
import { ROUTE_URL } from "../../const/route_url.const";
import {
  HomeOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

interface SidebarProps {
  collapsed?: boolean;
  activePath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

const menuItems: SidebarNode[] = [
  { id: "dashboard", label: "Dashboard", icon: <HomeOutlined />, path: ROUTE_URL.DASHBOARD },
  {
    id: "products",
    label: "Products",
    icon: <ShoppingOutlined />,
    children: [
      { id: "product-list", label: "Product List", path: ROUTE_URL.PRODUCT_LIST },
    ],
  },
  {
    id: "quotation-contract",
    label: "Quotation & Contract",
    icon: <FileTextOutlined />,
    children: [
      { id: "create-quotation", label: "Create Quotation", path: ROUTE_URL.QUOTATION_CREATE },
      { id: "manage-quotations", label: "Manage Quotations", path: ROUTE_URL.QUOTATION_LIST },
      { id: "contracts", label: "Contracts", path: ROUTE_URL.CONTRACT_LIST },
      { id: "approvals", label: "Contract Approvals", path: ROUTE_URL.CONTRACT_APPROVAL_LIST },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: <UserOutlined />,
    children: [
      { id: "customer-list", label: "Customer List", path: ROUTE_URL.CUSTOMER_LIST },
      { id: "customer-create", label: "Create Customer", path: ROUTE_URL.CUSTOMER_CREATE },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: <ProjectOutlined />,
    children: [
      { id: "project-list", label: "Project List", path: ROUTE_URL.PROJECT_LIST },
      { id: "project-create", label: "Create Project", path: ROUTE_URL.PROJECT_CREATE },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: <DollarOutlined />,
    children: [
      { id: "payment-list", label: "Invoices", path: ROUTE_URL.PAYMENT_LIST },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: <BarChartOutlined />,
    children: [
      { id: "dashboard-report", label: "Dashboard Report", path: ROUTE_URL.REPORT_DASHBOARD },
      { id: "sales-report", label: "Sales Report", path: ROUTE_URL.REPORT_SALES },
      { id: "inventory-report", label: "Inventory Report", path: ROUTE_URL.REPORT_INVENTORY },
      { id: "financial-report", label: "Financial Report", path: ROUTE_URL.REPORT_FINANCIAL },
    ],
  },
];

const Sidebar = ({ collapsed = false, activePath, onNavigate, className = "" }: SidebarProps) => {
  const [selectedPath, setSelectedPath] = useState(activePath ?? "/products");

  const currentPath = useMemo(() => activePath ?? selectedPath, [activePath, selectedPath]);

  return (
    <aside
      className={`flex h-full flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-slate-800 text-white transition-all ${
        collapsed ? "w-20" : "w-72"
      } ${className}`.trim()}
    >
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/20 p-2">
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2 3 6v6c0 5.3 3.8 9.7 9 10 5.2-.3 9-4.7 9-10V6l-9-4Z" />
              <path d="M8 10h8M8 14h6" />
            </svg>
          </div>
          {!collapsed ? (
            <div>
              <p className="text-xl font-semibold">ERP SYSTEM</p>
              <p className="text-xs text-blue-200">G90 Steel Business Management</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              activePath={currentPath}
              collapsed={collapsed}
              onNavigate={(path) => {
                setSelectedPath(path);
                onNavigate?.(path);
              }}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
