import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";

export type NotificationType = "success" | "error" | "loading" | "warning";

interface NotificationData {
  id: number;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificationEventDetail {
  message: string;
  type: NotificationType;
  duration?: number;
}

let idCounter = 0;
const EXIT_ANIMATION_MS = 260;

const getIcon = (type: NotificationType): React.ReactNode => {
  switch (type) {
    case "success":
      return <CheckCircleOutlined style={{ color: "#16a34a", fontSize: "16px" }} />;
    case "error":
      return <CloseCircleOutlined style={{ color: "#dc2626", fontSize: "16px" }} />;
    case "loading":
      return <LoadingOutlined style={{ color: "#1d4ed8", fontSize: "16px" }} spin />;
    case "warning":
      return <WarningOutlined style={{ color: "#d97706", fontSize: "16px" }} />;
  }
};

const getTypeStyle = (type: NotificationType): string => {
  switch (type) {
    case "success":
      return "border-l-4 border-l-green-500";
    case "error":
      return "border-l-4 border-l-red-500";
    case "loading":
      return "border-l-4 border-l-blue-600";
    case "warning":
      return "border-l-4 border-l-amber-500";
  }
};

const NotificationItem: React.FC<{
  data: NotificationData;
  onRemove: (id: number) => void;
}> = ({ data, onRemove }) => {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const startClose = useCallback(() => {
    if (leaving) {
      return;
    }

    setLeaving(true);
    window.setTimeout(() => onRemove(data.id), EXIT_ANIMATION_MS);
  }, [data.id, leaving, onRemove]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (data.type === "loading") {
      return;
    }

    const timer = window.setTimeout(() => startClose(), data.duration);
    return () => window.clearTimeout(timer);
  }, [data.duration, data.type, startClose]);

  return (
    <div
      className={`
        min-w-[320px] max-w-[560px] rounded-xl bg-white px-4 py-3 text-slate-800
        shadow-lg shadow-blue-900/10 ring-1 ring-blue-100
        ${getTypeStyle(data.type)}
        transform transition-all duration-300 ease-out
        ${
          leaving
            ? "opacity-0 -translate-y-4 scale-95"
            : entered
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-6 scale-95"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="mt-0.5 shrink-0">{getIcon(data.type)}</span>
        <span className="flex-1 text-sm font-medium text-slate-700">{data.message}</span>
        <button
          type="button"
          onClick={startClose}
          className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Đóng thông báo"
        >
          x
        </button>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback(
    (message: string, type: NotificationType, duration = 3000) => {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.type !== "loading");
        const id = ++idCounter;
        return [...filtered, { id, message, type, duration }];
      });
    },
    [],
  );

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationEventDetail>;
      const { message, type, duration } = customEvent.detail;
      addNotification(message, type, duration);
    };

    window.addEventListener("ADD_NOTIFICATION", listener);
    return () => window.removeEventListener("ADD_NOTIFICATION", listener);
  }, [addNotification]);

  return createPortal(
    <div className="pointer-events-none fixed left-1/2 top-5 z-50 flex -translate-x-1/2 flex-col items-center space-y-3">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem data={notification} onRemove={removeNotification} />
        </div>
      ))}
    </div>,
    document.body,
  );
};

export default NotificationContainer;
