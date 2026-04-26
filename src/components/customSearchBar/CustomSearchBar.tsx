import { SearchOutlined, CloseOutlined } from "@ant-design/icons";

interface Props {
  className?: string;
  classNameInput?: string;
  width?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetSearch?: () => void;
  placeHolder?: string;
}
const CustomSearchBar = ({
  className,
  width,
  value,
  onChange,
  resetSearch,
  placeHolder = "Tìm kiếm...",
  classNameInput,
}: Props) => {
  return (
    <div
      className={`
    ${className} flex items-center w-[300px] relative border border-[rgb(var(--primary-border-color))] bg-white
    rounded-[var(--primary-rounded)] overflow-hidden transition 
    focus-within:ring-2 focus-within:ring-[rgba(var(--primary-color),0.5)] focus-within:border-[#FEF5F6]
  `}
      style={{ width: width }}
    >
      <span className="pl-3 text-gray-600">
        <SearchOutlined style={{ fontSize: "16px" }} />
      </span>
      <input
        value={value}
        onChange={onChange}
        className={`p-2 border-none outline-none w-full
                overflow-hidden text-ellipsis whitespace-nowrap
                ${classNameInput}
            `}
        placeholder={placeHolder}
      />
      {value && value?.length > 0 && (
        <span
          className="absolute top-1/2 right-2 -translate-y-1/2 py-[2px] px-[4px] rounded-[.75rem] cursor-pointer hover:bg-[rgba(var(--primary-color),0.2)]"
          onClick={resetSearch}
        >
          <CloseOutlined style={{ fontSize: "16px", color: "#8c8c8c" }} />
        </span>
      )}
    </div>
  );
};

export default CustomSearchBar;
