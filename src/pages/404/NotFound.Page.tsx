import { useNavigate } from "react-router-dom";

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
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-xl text-center bg-white shadow-lg rounded-2xl p-8 mx-2">
        <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-6">
          <span className="text-[3rem]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="currentColor"
              className="w-[1em] h-[1em]"
            >
              <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
            </svg>
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-700 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 mb-6">
          Không tìm thấy trang bạn yêu cầu. Có thể đường dẫn sai hoặc trang đã
          được di chuyển.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
            </svg>
            Về trang chủ
          </button>

          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
              </svg>
            </span>
            Thử lại
          </button>

          <button
            onClick={onReport}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:underline focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
            </svg>
            Báo lỗi / Gửi phản hồi
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          URL: <span className="text-gray-500 break-all">{location.href}</span>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
