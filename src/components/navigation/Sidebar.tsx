import { useMemo, useState } from "react";
import SidebarItem, { type SidebarNode } from "./SidebarItem";

interface SidebarProps {
  collapsed?: boolean;
  activePath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

const HomeIcon = () => <span>??</span>;
const BoxIcon = () => <span>??</span>;
const WarehouseIcon = () => <span>??</span>;
const ContractIcon = () => <span>??</span>;
const UserIcon = () => <span>??</span>;
const ProjectIcon = () => <span>???</span>;
const PaymentIcon = () => <span>??</span>;
const ReportIcon = () => <span>??</span>;
const SettingIcon = () => <span>??</span>;

const menuItems: SidebarNode[] = [
  { id: "dashboard", label: "Dashboard", icon: <HomeIcon />, path: "/dashboard" },
  {
    id: "products",
    label: "Products",
    icon: <BoxIcon />,
    children: [
      { id: "product-list", label: "Product List", path: "/products" },
      { id: "add-product", label: "Add Product", path: "/products/add" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: <WarehouseIcon />,
    children: [
      { id: "import-stock", label: "Import Stock", path: "/inventory/import" },
      { id: "export-stock", label: "Export Stock", path: "/inventory/export" },
      { id: "stock-history", label: "Stock History", path: "/inventory/history" },
    ],
  },
  {
    id: "quotation-contract",
    label: "Quotation & Contract",
    icon: <ContractIcon />,
    children: [
      { id: "create-quotation", label: "Create Quotation", path: "/quotations/create" },
      { id: "manage-quotations", label: "Manage Quotations", path: "/quotations" },
      { id: "contracts", label: "Contracts", path: "/contracts" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: <UserIcon />,
    children: [
      { id: "customer-list", label: "Customer List", path: "/customers" },
      { id: "customer-detail", label: "Customer Details", path: "/customers/detail" },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: <ProjectIcon />,
    children: [
      { id: "project-list", label: "Project List", path: "/projects" },
      { id: "project-detail", label: "Project Details", path: "/projects/detail" },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: <PaymentIcon />,
    children: [
      { id: "payment-records", label: "Payment Records", path: "/payments/records" },
      { id: "debt-management", label: "Debt Management", path: "/payments/debts" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: <ReportIcon />,
    children: [
      { id: "sales-report", label: "Sales Report", path: "/reports/sales" },
      { id: "inventory-report", label: "Inventory Report", path: "/reports/inventory" },
      { id: "financial-report", label: "Financial Report", path: "/reports/financial" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingIcon />,
    children: [
      { id: "users", label: "Users", path: "/settings/users" },
      { id: "permissions", label: "Permissions", path: "/settings/permissions" },
      { id: "system-settings", label: "System Settings", path: "/settings/system" },
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