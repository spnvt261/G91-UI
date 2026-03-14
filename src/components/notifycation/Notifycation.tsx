import React, { useEffect, useState, useCallback } from "react";
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

let idCounter = 0;

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCircleOutlined style={{ color: "#52C41A", fontSize: "16px" }} />;
    case "error":
      return <CloseCircleOutlined style={{ color: "#F5222D", fontSize: "16px" }} />;
    case "loading":
      return <LoadingOutlined style={{ color: "#1890FF", fontSize: "16px" }} />;
    case "warning":
      return <WarningOutlined style={{ color: "#FAAD14", fontSize: "16px" }} />;
  }
};

const NotificationItem: React.FC<{
  data: NotificationData;
  onRemove?: (id: number) => void;
}> = ({ data, onRemove }) => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (data.type !== "loading") {
      const timer = setTimeout(() => setVisible(false), data.duration);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // const handleExitComplete = () => {
  //     onRemove?.(data.id);
  // };
  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      onRemove?.(data.id);
    }, 300); // duration trùng với CSS transition
  };

  if (!visible && !leaving) return null;

  return (
    <div
      className={`
        bg-gray-800 text-white px-4 py-3 rounded-md shadow-md flex items-center gap-3 min-w-[280px]
        transform transition-all duration-300
        ${leaving ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}
      `}
    >
      {getIcon(data.type)}
      <span className="flex-1">{data.message}</span>
      <button onClick={handleClose} className="text-gray-300 hover:text-white">
        ✕
      </button>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback(
    (message: string, type: NotificationType, duration = 3000) => {
      setNotifications((prev) => {
        // Nếu có loading, xóa nó trước
        const filtered = prev.filter((n) => n.type !== "loading");
        const id = ++idCounter;
        return [...filtered, { id, message, type, duration }];
      });
    },
    []
  );

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // nghe event notify
  useEffect(() => {
    const listener = (e: any) => {
      const { message, type, duration } = e.detail;
      addNotification(message, type, duration);
    };
    window.addEventListener("ADD_NOTIFICATION", listener);
    return () => window.removeEventListener("ADD_NOTIFICATION", listener);
  }, [addNotification]);

  return createPortal(
    <div className="fixed top-5 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 space-y-3">
      {notifications.map((n) => (
        <NotificationItem key={n.id} data={n} onRemove={removeNotification} />
      ))}
    </div>,
    document.body
  );
};

export default NotificationContainer;
