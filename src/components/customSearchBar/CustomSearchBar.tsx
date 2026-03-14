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
  placeHolder = "Search...",
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
      <span className="pl-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 13 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.4625 11.6016L8.40469 7.54375C9.03438 6.72969 9.375 5.73438 9.375 4.6875C9.375 3.43438 8.88594 2.25937 8.00156 1.37344C7.11719 0.4875 5.93906 0 4.6875 0C3.43594 0 2.25781 0.489062 1.37344 1.37344C0.4875 2.25781 0 3.43438 0 4.6875C0 5.93906 0.489062 7.11719 1.37344 8.00156C2.25781 8.8875 3.43438 9.375 4.6875 9.375C5.73438 9.375 6.72813 9.03438 7.54219 8.40625L11.6 12.4625C11.6119 12.4744 11.626 12.4838 11.6416 12.4903C11.6571 12.4967 11.6738 12.5001 11.6906 12.5001C11.7075 12.5001 11.7241 12.4967 11.7397 12.4903C11.7552 12.4838 11.7694 12.4744 11.7812 12.4625L12.4625 11.7828C12.4744 11.7709 12.4838 11.7568 12.4903 11.7412C12.4967 11.7257 12.5001 11.709 12.5001 11.6922C12.5001 11.6754 12.4967 11.6587 12.4903 11.6431C12.4838 11.6276 12.4744 11.6135 12.4625 11.6016V11.6016ZM7.1625 7.1625C6.5 7.82344 5.62187 8.1875 4.6875 8.1875C3.75313 8.1875 2.875 7.82344 2.2125 7.1625C1.55156 6.5 1.1875 5.62187 1.1875 4.6875C1.1875 3.75313 1.55156 2.87344 2.2125 2.2125C2.875 1.55156 3.75313 1.1875 4.6875 1.1875C5.62187 1.1875 6.50156 1.55 7.1625 2.2125C7.82344 2.875 8.1875 3.75313 8.1875 4.6875C8.1875 5.62187 7.82344 6.50156 7.1625 7.1625Z"
            fill="black"
            fillOpacity="0.85"
          />
        </svg>
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
      {
        value&& value?.length > 0 &&
        <span
          className="absolute top-1/2 right-2 -translate-y-1/2 py-[2px] px-[4px] rounded-[.75rem] cursor-pointer hover:bg-[rgba(var(--primary-color),0.2)] "
          onClick={resetSearch}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#1f1f1f"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </span>
      }
    </div>
  );
};

export default CustomSearchBar;
