import { BugOutlined, HomeOutlined, RedoOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const onGoHome = () => {
    navigate("/");
  };

  const onRetry = () => {
    window.location.reload();
  };

  const onReport = () => {};

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Không tìm thấy trang"
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "404" }]} />}
        />
      }
      body={
        <div className="flex min-h-full items-center justify-center px-4 py-12">
          <div className="mx-2 w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
              <HomeOutlined style={{ fontSize: "3rem", color: "#666" }} />
            </div>

            <h1 className="mb-2 text-3xl font-extrabold text-gray-700">Không tìm thấy trang</h1>
            <p className="mb-6 text-gray-500">
              Không tìm thấy trang bạn yêu cầu. Có thể đường dẫn sai hoặc trang đã được di chuyển.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onGoHome}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <HomeOutlined style={{ fontSize: "1rem" }} />
                Về trang chủ
              </button>

              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <RedoOutlined style={{ fontSize: "1rem" }} />
                Thử lại
              </button>

              <button
                onClick={onReport}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:underline focus:outline-none"
              >
                <BugOutlined style={{ fontSize: "1rem" }} />
                Báo lỗi / Gửi phản hồi
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              Đường dẫn: <span className="break-all text-gray-500">{location.href}</span>
            </p>
          </div>
        </div>
      }
    />
  );
};

export default NotFoundPage;
