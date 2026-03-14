import { useEffect, useMemo, useRef, useState } from "react";
import { BellOutlined } from "@ant-design/icons";

interface NotificationItem {
  id: number;
  title: string;
  time: string;
}

const dummyNotifications: NotificationItem[] = [
  { id: 1, title: "New order #SO0053 created", time: "2 minutes ago" },
  { id: 2, title: "Stock alert: G90 1.3mm is low", time: "10 minutes ago" },
  { id: 3, title: "Customer payment received", time: "1 hour ago" },
];

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = useMemo(() => dummyNotifications.length, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="relative rounded-full p-2 text-white hover:bg-white/10"
        onClick={() => setOpen((prev) => !prev)}
      >
        <BellOutlined style={{ fontSize: '1.25rem' }} />
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">{count}</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-lg bg-white p-2 text-slate-800 shadow-lg">
          <p className="px-2 py-1 text-sm font-semibold text-slate-500">Notifications</p>
          <ul className="max-h-64 overflow-y-auto">
            {dummyNotifications.map((item) => (
              <li key={item.id} className="rounded-md px-2 py-2 hover:bg-blue-50">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;