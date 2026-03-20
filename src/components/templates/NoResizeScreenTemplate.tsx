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
}

const NoResizeScreenTemplate = ({
  header,
  body,
  className,
  bodyClassName,
  loading = false,
  loadingText,
}: NoResizeScreenTemplateProps) => {
  return (
    <div
      className={`relative flex h-full flex-1 min-w-0 flex-col ${className ?? ""}`.trim()}
    >
      {header}
      <div
        className={`flex-1 flex flex-col overflow-auto pb-6 pt-6 ${bodyClassName ?? ""}`.trim()}
      >
        <div className="px-8 pb-4">{body}</div>
        <AppFooter />
      </div>

      {loading ? <Loading text={loadingText} /> : null}
    </div>
  );
};

export default NoResizeScreenTemplate;
