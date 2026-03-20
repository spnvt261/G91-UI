import { ClearOutlined, FilterOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { useMemo, useState } from "react";
import CustomButton from "../customButton/CustomButton";
import CustomSearchBar from "../customSearchBar/CustomSearchBar";

export interface FilterModalOption {
  label: string;
  value: string;
}

export interface FilterModalGroup {
  key: string;
  label: string;
  options: FilterModalOption[];
  value: string[];
  multiple?: boolean;
  tagLabel?: string;
}

interface FilterSearchModalBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchReset?: () => void;
  searchPlaceholder?: string;
  searchClassName?: string;
  modalTitle?: string;
  filters: FilterModalGroup[];
  onApplyFilters: (values: Record<string, string[]>) => void;
}

const buildValuesFromFilters = (filters: FilterModalGroup[]) => {
  return filters.reduce<Record<string, string[]>>((acc, filter) => {
    acc[filter.key] = [...(filter.value ?? [])];
    return acc;
  }, {});
};

const buildEmptyValues = (filters: FilterModalGroup[]) => {
  return filters.reduce<Record<string, string[]>>((acc, filter) => {
    acc[filter.key] = [];
    return acc;
  }, {});
};

const FilterSearchModalBar = ({
  searchValue,
  onSearchChange,
  onSearchReset,
  searchPlaceholder = "Search",
  searchClassName = "w-full md:w-[230px]",
  modalTitle = "Bộ lọc",
  filters,
  onApplyFilters,
}: FilterSearchModalBarProps) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string[]>>({});

  const activeTags = useMemo(() => {
    return filters.flatMap((filter) => {
      return (filter.value ?? []).map((value) => {
        const option = filter.options.find((item) => item.value === value);
        return {
          filterKey: filter.key,
          value,
          label: `${filter.tagLabel ?? filter.label}: ${option?.label ?? value}`,
        };
      });
    });
  }, [filters]);

  const openFilterModal = () => {
    setDraftValues(buildValuesFromFilters(filters));
    setIsFilterModalOpen(true);
  };

  const clearAllAppliedFilters = () => {
    onApplyFilters(buildEmptyValues(filters));
  };

  const clearDraftSelections = () => {
    setDraftValues(buildEmptyValues(filters));
  };

  const removeTag = (filterKey: string, value: string) => {
    const nextValues = buildValuesFromFilters(filters);
    nextValues[filterKey] = (nextValues[filterKey] ?? []).filter((item) => item !== value);
    onApplyFilters(nextValues);
  };

  const handleToggleDraftOption = (filter: FilterModalGroup, optionValue: string) => {
    setDraftValues((prev) => {
      const currentValues = prev[filter.key] ?? [];
      const isSelected = currentValues.includes(optionValue);

      if (filter.multiple) {
        const nextValues = isSelected ? currentValues.filter((item) => item !== optionValue) : [...currentValues, optionValue];
        return {
          ...prev,
          [filter.key]: nextValues,
        };
      }

      return {
        ...prev,
        [filter.key]: isSelected ? [] : [optionValue],
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(
      filters.reduce<Record<string, string[]>>((acc, filter) => {
        acc[filter.key] = draftValues[filter.key] ?? [];
        return acc;
      }, {}),
    );
    setIsFilterModalOpen(false);
  };

  return (
    <>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <CustomSearchBar
            className={searchClassName}
            width="100%"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            resetSearch={onSearchReset ?? (() => onSearchChange(""))}
            placeHolder={searchPlaceholder}
          />

          <button
            type="button"
            onClick={openFilterModal}
            aria-label="Mở bộ lọc"
            title="Bộ lọc"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-[var(--primary-rounded)] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
          >
            <FilterOutlined />
            {activeTags.length ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                {activeTags.length}
              </span>
            ) : null}
          </button>

          {activeTags.length ? (
            <button
              type="button"
              onClick={clearAllAppliedFilters}
              aria-label="Xóa toàn bộ bộ lọc"
              title="Xóa lọc"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--primary-rounded)] border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
            >
              <ClearOutlined />
            </button>
          ) : null}
        </div>

        {activeTags.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <button
                key={`${tag.filterKey}-${tag.value}`}
                type="button"
                onClick={() => removeTag(tag.filterKey, tag.value)}
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
              >
                <span>{tag.label}</span>
                <span className="text-sm leading-none">×</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Modal
        title={modalTitle}
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <CustomButton
              label="Xóa chọn"
              className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              onClick={clearDraftSelections}
            />
            <CustomButton
              label="Hủy"
              className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              onClick={() => setIsFilterModalOpen(false)}
            />
            <CustomButton label="Áp dụng" onClick={handleApply} />
          </div>
        }
      >
        <div className="space-y-5">
          {filters.map((filter) => (
            <div key={filter.key}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{filter.label}</p>
              <div className="flex flex-wrap gap-2">
                {filter.options.map((option) => {
                  const isActive = (draftValues[filter.key] ?? []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleToggleDraftOption(filter, option.value)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default FilterSearchModalBar;
