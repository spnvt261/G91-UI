import { useMemo, useState, type ReactNode } from "react";

export interface SidebarNode {
  id: string;
  icon?: ReactNode;
  label: string;
  path?: string;
  children?: SidebarNode[];
}

interface SidebarItemProps {
  item: SidebarNode;
  activePath?: string;
  collapsed?: boolean;
  depth?: number;
  onNavigate?: (path: string) => void;
}

const SidebarItem = ({
  item,
  activePath,
  collapsed = false,
  depth = 0,
  onNavigate,
}: SidebarItemProps) => {
  const hasChildren = Boolean(item.children?.length);
  const isActive = useMemo(() => {
    if (!activePath) return false;
    if (item.path && activePath === item.path) return true;
    return item.children?.some((child) => child.path && activePath.startsWith(child.path)) ?? false;
  }, [activePath, item.children, item.path]);

  const [open, setOpen] = useState(isActive);

  const handleClick = () => {
    if (hasChildren) {
      setOpen((prev) => !prev);
      return;
    }

    if (item.path) {
      onNavigate?.(item.path);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
          isActive ? "bg-blue-500/30 text-white" : "text-blue-100 hover:bg-blue-500/20"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <span className="shrink-0">{item.icon ?? <span className="text-xs">•</span>}</span>
        {!collapsed ? <span className="flex-1 truncate text-sm font-medium">{item.label}</span> : null}
        {hasChildren && !collapsed ? (
          <span className={`text-xs transition ${open ? "rotate-180" : ""}`}>?</span>
        ) : null}
      </button>

      {hasChildren && open && !collapsed ? (
        <ul className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              activePath={activePath}
              collapsed={collapsed}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export default SidebarItem;