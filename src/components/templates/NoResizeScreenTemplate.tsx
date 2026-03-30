import type { ReactNode } from "react";
import Loading from "../loading/Loading";
import AppFooter from "../layout/AppFooter";

interface NoResizeScreenTemplateProps {
  header: ReactNode;
  body: ReactNode;
  className?: string;
  bodyClassName?: string;
  loading?: boolean;
  loadingText?: string;
  loadingMode?: "replace" | "overlay";
}

const NoResizeScreenTemplate = ({
  header,
  body,
  className,
  bodyClassName,
  loading = false,
  loadingText,
  loadingMode = "replace",
}: NoResizeScreenTemplateProps) => {
  return (
    <div className={`relative flex h-full min-h-0 flex-1 min-w-0 flex-col ${className ?? ""}`.trim()}>
      <div className="px-4 pt-4 md:px-6 md:pt-5">
        <div className="mx-auto w-full max-w-[1360px]">{header}</div>
      </div>

      <div className={`min-h-0 flex-1 overflow-y-auto pb-4 pt-4 md:pb-6 ${bodyClassName ?? ""}`.trim()}>
        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-5 px-4 md:px-6">
          {loading && loadingMode === "replace" ? (
            <Loading mode="section" text={loadingText} />
          ) : (
            body
          )}
        </div>
      </div>

      {loading && loadingMode === "overlay" ? (
        <div className="absolute inset-0 z-20">
          <Loading mode="overlay" text={loadingText} />
        </div>
      ) : null}

      <div className="px-4 pb-2 md:px-6 md:pb-4">
        <div className="mx-auto w-full max-w-[1360px]">
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default NoResizeScreenTemplate;
