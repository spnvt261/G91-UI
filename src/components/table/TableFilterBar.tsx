import CustomSearchBar from "../customSearchBar/CustomSearchBar";
import CustomSelect, { type Option } from "../customSelect/CustomSelect";

interface FilterItem {
  key: string;
  placeholder: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}

interface TableFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterItem[];
}

const TableFilterBar = ({ searchValue, onSearchChange, filters = [] }: TableFilterBarProps) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <CustomSearchBar
        className="w-full md:w-[280px]"
        width="100%"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        resetSearch={() => onSearchChange("")}
        placeHolder="Search"
      />
      {filters.map((filter) => (
        <div key={filter.key} className="w-full md:w-48">
          <CustomSelect
            options={filter.options}
            value={filter.value}
            onChange={filter.onChange}
            placeholder={filter.placeholder}
            classNameSelect="w-full text-left"
            classNameOptions="w-full left-0"
          />
        </div>
      ))}
    </div>
  );
};

export default TableFilterBar;