// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "./index.css";
import "antd/dist/reset.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./context/notify.provider.tsx";
import { Provider } from "react-redux";
import { store } from "./store";

dayjs.locale("vi");

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <NotificationProvider>
        <ConfigProvider
          locale={viVN}
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              borderRadius: 12,
              colorPrimary: "#0f5ca8",
              colorInfo: "#0f5ca8",
              colorBgLayout: "#f6f8fb",
              colorText: "#0f172a",
              colorTextSecondary: "#64748b",
              fontFamily: '"Be Vietnam Pro", "Segoe UI", sans-serif',
            },
            components: {
              Menu: {
                itemHeight: 42,
                itemBorderRadius: 10,
                itemMarginBlock: 4,
              },
              Card: {
                borderRadiusLG: 16,
              },
              Button: {
                controlHeight: 38,
                borderRadius: 10,
                fontWeight: 500,
              },
            },
          }}
        >
          <App />
        </ConfigProvider>
      </NotificationProvider>
    </BrowserRouter>
  </Provider>
);
