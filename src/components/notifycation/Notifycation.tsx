import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

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
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM10.0234 4.71406L6.73281 9.27656C6.68682 9.34076 6.62619 9.39306 6.55595 9.42914C6.48571 9.46523 6.40787 9.48405 6.32891 9.48405C6.24994 9.48405 6.17211 9.46523 6.10186 9.42914C6.03162 9.39306 5.97099 9.34076 5.925 9.27656L3.97656 6.57656C3.91719 6.49375 3.97656 6.37813 4.07812 6.37813H4.81094C4.97031 6.37813 5.12187 6.45469 5.21562 6.58594L6.32812 8.12969L8.78438 4.72344C8.87813 4.59375 9.02812 4.51562 9.18906 4.51562H9.92188C10.0234 4.51562 10.0828 4.63125 10.0234 4.71406Z"
            fill="#52C41A"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM9.58438 9.65938L8.55313 9.65469L7 7.80313L5.44844 9.65312L4.41563 9.65781C4.34688 9.65781 4.29063 9.60312 4.29063 9.53281C4.29063 9.50312 4.30156 9.475 4.32031 9.45156L6.35313 7.02969L4.32031 4.60938C4.30143 4.58647 4.29096 4.5578 4.29063 4.52812C4.29063 4.45937 4.34688 4.40312 4.41563 4.40312L5.44844 4.40781L7 6.25938L8.55156 4.40938L9.58281 4.40469C9.65156 4.40469 9.70781 4.45937 9.70781 4.52969C9.70781 4.55937 9.69688 4.5875 9.67813 4.61094L7.64844 7.03125L9.67969 9.45312C9.69844 9.47656 9.70938 9.50469 9.70938 9.53438C9.70938 9.60313 9.65313 9.65938 9.58438 9.65938Z"
            fill="#F5222D"
          />
        </svg>
      );
    case "loading":
      return <span>LoadingIcon</span>;
    case "warning":
      return <span>WarningIcon</span>;
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
