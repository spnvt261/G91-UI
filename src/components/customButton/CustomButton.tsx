import type { ComponentType } from "react";
import React from "react";

interface Props {
  label: string;
  onClick?: () => void;
  padding?: string;
  className?: string;
  width?: string;
  disabled?: boolean;
  Icon?: ComponentType<any>;
  type?: "button" | "submit";
}

const CustomButton = ({
  label,
  onClick,
  padding,
  className,
  width,
  disabled,
  Icon,
  type = "button",
}: Props) => {
  return (
    <button
      className={`px-3 py-2 font-medium text-[rgba(var(--primary-text-color),1)] rounded-[var(--primary-rounded)] bg-[rgba(var(--primary-color),0.8)] hover:bg-[rgba(var(--primary-color),1)]  active:scale-[0.95] transition-all duration-200 ${className} ${
        disabled
          ? "cursor-not-allowed bg-gray-500 hover:bg-gray-500 active:bg-gray-500"
          : ""
      }`}
      onClick={onClick}
      style={{ padding, width }}
      disabled={disabled}
      type={type}
    >
      {Icon && <Icon className="text-white font-semibold mr-2" />}
      {label}
    </button>
  );
};

export default React.memo(CustomButton);
