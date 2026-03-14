import { createContext, useContext } from "react";
import type { NotificationType } from "../components/notifycation/Notifycation";
export interface NotificationContextType {
    notify: (message: string, type: NotificationType, duration?: number) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


export const useNotify = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
    return ctx;
};
