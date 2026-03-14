import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";

export interface Option {
  label: React.ReactNode;
  value: string;
  searchText?: string;
}

interface CustomSelectProps {
  title?: string;
  label?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
  value?: string[];
  onChange?: (values: string[]) => void;
  multiple?: boolean;
  className?: string;
  spanMaxWidth?: string;
  search?: boolean; // ✅ bật/tắt ô tìm kiếm
  classNameSelect?: string;
  classNameOptions?: string;
  disable?: boolean;
  navigateTo?: string;
  navigateLabel?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  title,
  label,
  helperText,
  placeholder = "",
  value = [],
  onChange,
  multiple = false,
  className,
  spanMaxWidth,
  search = false,
  classNameSelect = "text-end w-[150px]",
  classNameOptions = "w-[200px] right-0",
  disable,
  navigateTo = undefined,
  navigateLabel = undefined,
}) => {
  const [isOpenListSelect, setIsOpenListSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Danh sách label các giá trị đã chọn
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpenListSelect(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ngăn cuộn lan ra ngoài
  useEffect(() => {
    const dropdown = selectRef.current?.querySelector("ul");
    if (!dropdown) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    dropdown.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => dropdown.removeEventListener("touchmove", handleTouchMove);
  }, [isOpenListSelect]);

  // Xử lý chọn option
  const handleSelect = (option: Option) => {
    if (!multiple) {
      onChange?.([option.value]);
      setIsOpenListSelect(false);
    } else {
      const newValues = value.includes(option.value)
        ? value.filter((v) => v !== option.value)
        : [...value, option.value];
      onChange?.(newValues);
    }
  };

  // Lọc danh sách khi có searchTerm
  //   const filteredOptions = search
  //     ? options.filter((opt) =>
  //         (opt.searchText ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  //       )
  //     : options;
  const filteredOptions = search
    ? options.filter((opt) => {
        if (typeof opt.label === "string") {
          return opt.label.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return (opt.searchText ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()); // label không phải string => không dùng để tìm
      })
    : options;

  return (
    <div className="flex flex-col">
      {title && (
        <span className="font-medium text-[#000000D9] text-[1rem]">
          {title}
        </span>
      )}
      <div ref={selectRef} className={`relative w-full ${className || ""}`}>
        <button
          type="button"
          onClick={() => {
            if (disable) {
              return;
            }
            setIsOpenListSelect(!isOpenListSelect);
            setSearchTerm(""); // reset khi mở dropdown
          }}
          className={`${classNameSelect} border border-[rgba(var(--primary-border-color))] relative pr-8 w-full min-w-0 flex justify-between items-cente rounded-[var(--primary-rounded)] px-3 py-2 hover:border-[rgba(var(--primary-color),1)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--primary-color),0.5)] focus:border-[rgba(var(--primary-color),0.5)]`}
          disabled={disable}
          style={
            disable
              ? {
                  cursor: "not-allowed",
                }
              : {}
          }
        >
          <span
            className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis"
            style={spanMaxWidth ? { maxWidth: `${spanMaxWidth}` } : {}}
          >
            {selectedOptions.length > 0 ? (
              !multiple ? (
                <span className="flex items-center gap-2">
                  {selectedOptions[0].label}
                </span>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedOptions.map((opt) => (
                    <span
                      key={opt.value}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded"
                    >
                      {opt.label}
                    </span>
                  ))}
                </div>
              )
            ) : (
              placeholder
            )}
          </span>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center">
            <span
              className={`flex items-center justify-center transform transition-transform ${
                isOpenListSelect ? "rotate-180" : "rotate-0"
              }`}
            >
              <DownOutlined style={{ fontSize: "14px", color: "#1f1f1f" }} />
            </span>
          </div>
        </button>
        {isOpenListSelect && (
          <ul
            className={`${classNameOptions} absolute mt-2 w-full bg-white border border-[rgb(var(--primary-border-color))] rounded-[var(--primary-rounded)] shadow-lg z-10 overflow-hidden max-h-64 overflow-y-auto`}
          >
            {search && (
              <div className="p-2 border-b border-gray-200 bg-gray-50 sticky top-0">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <li
                    key={option.value}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100 hover:text-[rgb(var(--primary-color))] ${
                      isSelected ? "bg-gray-200 font-semibold" : ""
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="accent-gray-500"
                      />
                    )}
                    {option.label}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-2 text-gray-500 italic">Không tìm thấy</li>
            )}
          </ul>
        )}
      </div>
      {label && (
        <label className="text-[#00000073]">
          {label}
          {navigateTo && navigateLabel && (
            <span
              onClick={() => navigate(navigateTo)}
              className="text-[#1890FF] font-normal cursor-pointer hover:underline"
            >
              {navigateLabel}
            </span>
          )}
        </label>
      )}
      {helperText && (
        <span className={`text-sm text-red-500`}>{helperText}</span>
      )}
    </div>
  );
};

export default CustomSelect;
