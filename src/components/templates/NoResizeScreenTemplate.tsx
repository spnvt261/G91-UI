import type { ReactNode } from "react";
import Loading from "../loading/Loading";

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
    <div className={`relative flex h-full flex-1 min-w-0 flex-col ${className ?? ""}`.trim()}>
      {header}
      <div className={`flex-1 overflow-auto px-8 pb-6 pt-6 ${bodyClassName ?? ""}`.trim()}>{body}</div>
      {loading ? <Loading text={loadingText} /> : null}
    </div>
  );
};

export default NoResizeScreenTemplate;
