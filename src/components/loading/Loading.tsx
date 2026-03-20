import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../customButton/CustomButton";

interface Props {
  showGoHome?: boolean;
  text?: string;
  fullScreen?: boolean;
}

const Loading = ({ showGoHome, text = "Loading...", fullScreen = false }: Props) => {
  const [goHome, setGoHome] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showGoHome) {
      return;
    }

    const timer = setTimeout(() => {
      setGoHome(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [showGoHome]);

  return (
    <div className={`${fullScreen ? "fixed z-[1000]" : "absolute z-50"} inset-0 flex flex-col items-center justify-center bg-black/20`}>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-500 border-t-transparent" />
      <p className="mt-4 font-medium text-gray-700">{text}</p>
      {showGoHome ? (
        <div
          className="absolute left-1/2 top-1/2 mt-5 -translate-x-1/2 translate-y-full transition-all duration-500"
          style={{
            opacity: goHome ? 1 : 0,
            marginTop: goHome ? "1.5rem" : "0",
          }}
        >
          <CustomButton
            label="Go Home Page"
            onClick={() => {
              navigate("/");
              window.location.reload();
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Loading;
