import type { NotificationType } from "../components/notifycation/Notifycation";
import NotificationContainer from "../components/notifycation/Notifycation";
import { NotificationContext } from "./notifyContext";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const notify = (message: string, type: NotificationType, duration = 3000) => {
        const event = new CustomEvent("ADD_NOTIFICATION", { detail: { message, type, duration } });
        window.dispatchEvent(event);
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};