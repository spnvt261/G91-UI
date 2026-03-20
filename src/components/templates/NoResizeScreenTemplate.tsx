import type { ReactNode } from "react";

interface NoResizeScreenTemplateProps {
  header: ReactNode;
  body: ReactNode;
  className?: string;
  bodyClassName?: string;
}

const NoResizeScreenTemplate = ({ header, body, className, bodyClassName }: NoResizeScreenTemplateProps) => {
  return (
    <div className={`flex h-full min-h-0 flex-col ${className ?? ""}`.trim()}>
      {header}
      <div className={`flex-1 overflow-auto px-8 pb-6 pt-6 ${bodyClassName ?? ""}`.trim()}>{body}</div>
    </div>
  );
};

export default NoResizeScreenTemplate;
