import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

interface CustomTextFieldProps {
  title?: string;
  label?: string;
  helperText?: string;
  value?: string;
  placeholder?: string;
  type?: "text" | "password" | "number" | "textarea";
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  className?: string;
  classNameInput?: string;
  navigateTo?: string;
  navigateLabel?: string;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  title,
  label,
  helperText,
  value = "",
  placeholder = "",
  type = "text",
  disabled = false,
  required = false,
  onChange,
  className = "",
  classNameInput = "",
  error = false,
  navigateTo = undefined,
  navigateLabel = undefined,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col ${className}`}>
      {title && (
        <span className="font-normal text-[#000000D9] text-[1rem]">
          {title}
        </span>
      )}

      <div className="relative w-full">
        <input
          type={inputType}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          className={`w-full rounded-[var(--primary-rounded)] border border-[rgb(var(--primary-border-color))] p-2 pr-10
                    focus:outline-none focus:ring-2 focus:ring-[rgba(var(--primary-color),0.5)] focus:border-[rgba(var(--primary-color),0.5)] 
                    disabled:bg-gray-300 bg-white 
                    ${error ? "!ring-red-500 ring-2 border-red-500" : ""}
                    ${classNameInput}`}
        />

        {isPassword && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none text-[#00000073] flex items-center justify-center"
            onClick={() => setShowPassword(!showPassword)}
            style={{ fontSize: '1rem' }}
          >
            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </span>
        )}
      </div>

      {label && (
        <label className="text-sm text-[#00000073] flex gap-2">
          {label}
          {navigateTo && navigateLabel && <span onClick={()=>navigate(navigateTo)} className="text-[#1890FF] font-normal cursor-pointer hover:underline">{navigateLabel}</span>}
        </label>
      )}

      {helperText && (
        <span
          className="text-sm"
          style={{ color: error ? "red" : "#00000073" }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export default CustomTextField;
