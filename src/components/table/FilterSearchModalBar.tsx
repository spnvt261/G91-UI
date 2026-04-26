import { ClearOutlined, FilterOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { useMemo, useState } from "react";
import CustomButton from "../customButton/CustomButton";
import CustomSearchBar from "../customSearchBar/CustomSearchBar";

export interface FilterModalOption {
  label: string;
  value: string;
}

export interface OptionFilterModalGroup {
  kind?: "options";
  key: string;
  label: string;
  options: FilterModalOption[];
  value: string[];
  multiple?: boolean;
  tagLabel?: string;
}

export interface DateRangeFilterModalGroup {
  kind: "dateRange";
  key: string;
  label: string;
  value: {
    from?: string;
    to?: string;
  };
  tagLabel?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

export interface NumberRangeFilterModalGroup {
  kind: "numberRange";
  key: string;
  label: string;
  value: {
    min?: string;
    max?: string;
  };
  tagLabel?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

export type FilterModalGroup = OptionFilterModalGroup | DateRangeFilterModalGroup | NumberRangeFilterModalGroup;

export type FilterApplyValue =
  | string[]
  | {
      from?: string;
      to?: string;
    }
  | {
      min?: string;
      max?: string;
    };

interface FilterSearchModalBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchReset?: () => void;
  searchPlaceholder?: string;
  searchClassName?: string;
  modalTitle?: string;
  filters: FilterModalGroup[];
  onApplyFilters: (values: Record<string, FilterApplyValue>) => void;
}

interface ActiveFilterTag {
  kind: "options" | "dateRange" | "numberRange";
  filterKey: string;
  value: string;
  label: string;
}

const isDateRangeValue = (value: FilterApplyValue | undefined): value is DateRangeFilterModalGroup["value"] => {
  if (!value || Array.isArray(value)) {
    return false;
  }
  return "from" in value || "to" in value;
};

const isNumberRangeValue = (value: FilterApplyValue | undefined): value is NumberRangeFilterModalGroup["value"] => {
  if (!value || Array.isArray(value)) {
    return false;
  }
  return "min" in value || "max" in value;
};

const buildValuesFromFilters = (filters: FilterModalGroup[]) => {
  return filters.reduce<Record<string, FilterApplyValue>>((acc, filter) => {
    if (filter.kind === "dateRange") {
      acc[filter.key] = { ...(filter.value ?? {}) };
      return acc;
    }

    if (filter.kind === "numberRange") {
      acc[filter.key] = { ...(filter.value ?? {}) };
      return acc;
    }

    acc[filter.key] = [...(filter.value ?? [])];
    return acc;
  }, {});
};

const buildEmptyValues = (filters: FilterModalGroup[]) => {
  return filters.reduce<Record<string, FilterApplyValue>>((acc, filter) => {
    if (filter.kind === "dateRange") {
      acc[filter.key] = {};
      return acc;
    }

    if (filter.kind === "numberRange") {
      acc[filter.key] = {};
      return acc;
    }

    acc[filter.key] = [];
    return acc;
  }, {});
};

const toOptionDraftValues = (values: FilterApplyValue | undefined) => {
  return Array.isArray(values) ? values : [];
};

const toDateRangeDraftValues = (values: FilterApplyValue | undefined) => {
  return isDateRangeValue(values) ? values : {};
};

const toNumberRangeDraftValues = (values: FilterApplyValue | undefined) => {
  return isNumberRangeValue(values) ? values : {};
};

const FilterSearchModalBar = ({
  searchValue,
  onSearchChange,
  onSearchReset,
  searchPlaceholder = "Tìm kiếm",
  searchClassName = "w-full md:w-[230px]",
  modalTitle = "Bộ lọc",
  filters,
  onApplyFilters,
}: FilterSearchModalBarProps) => {
  const hasFilters = filters.length > 0;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, FilterApplyValue>>({});

  const activeTags = useMemo<ActiveFilterTag[]>(() => {
    return filters.reduce<ActiveFilterTag[]>((acc, filter) => {
      if (filter.kind === "dateRange") {
        const dateValue = filter.value ?? {};
        if (!dateValue.from && !dateValue.to) {
          return acc;
        }

        acc.push({
          kind: "dateRange",
          filterKey: filter.key,
          value: `${dateValue.from ?? ""}-${dateValue.to ?? ""}`,
          label: `${filter.tagLabel ?? filter.label}: ${dateValue.from || "..."} - ${dateValue.to || "..."}`,
        });
        return acc;
      }

      if (filter.kind === "numberRange") {
        const numberValue = filter.value ?? {};
        if (!numberValue.min && !numberValue.max) {
          return acc;
        }

        acc.push({
          kind: "numberRange",
          filterKey: filter.key,
          value: `${numberValue.min ?? ""}-${numberValue.max ?? ""}`,
          label: `${filter.tagLabel ?? filter.label}: ${numberValue.min || "..."} - ${numberValue.max || "..."}`,
        });
        return acc;
      }

      (filter.value ?? []).forEach((value) => {
        const option = filter.options.find((item) => item.value === value);
        acc.push({
          kind: "options",
          filterKey: filter.key,
          value,
          label: `${filter.tagLabel ?? filter.label}: ${option?.label ?? value}`,
        });
      });

      return acc;
    }, []);
  }, [filters]);

  const openFilterModal = () => {
    if (!hasFilters) {
      return;
    }
    setDraftValues(buildValuesFromFilters(filters));
    setIsFilterModalOpen(true);
  };

  const clearAllAppliedFilters = () => {
    onApplyFilters(buildEmptyValues(filters));
  };

  const clearDraftSelections = () => {
    setDraftValues(buildEmptyValues(filters));
  };

  const removeTag = (tag: { kind: "options" | "dateRange" | "numberRange"; filterKey: string; value: string }) => {
    const nextValues = buildValuesFromFilters(filters);

    if (tag.kind === "options") {
      const currentValues = toOptionDraftValues(nextValues[tag.filterKey]);
      nextValues[tag.filterKey] = currentValues.filter((item) => item !== tag.value);
      onApplyFilters(nextValues);
      return;
    }

    nextValues[tag.filterKey] = {};
    onApplyFilters(nextValues);
  };

  const handleToggleDraftOption = (filter: OptionFilterModalGroup, optionValue: string) => {
    setDraftValues((prev) => {
      const currentValues = toOptionDraftValues(prev[filter.key]);
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

  const handleDraftDateRangeChange = (filterKey: string, field: "from" | "to", value: string) => {
    setDraftValues((prev) => {
      const current = toDateRangeDraftValues(prev[filterKey]);
      return {
        ...prev,
        [filterKey]: {
          ...current,
          [field]: value || undefined,
        },
      };
    });
  };

  const handleDraftNumberRangeChange = (filterKey: string, field: "min" | "max", value: string) => {
    setDraftValues((prev) => {
      const current = toNumberRangeDraftValues(prev[filterKey]);
      return {
        ...prev,
        [filterKey]: {
          ...current,
          [field]: value || undefined,
        },
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(
      filters.reduce<Record<string, FilterApplyValue>>((acc, filter) => {
        if (filter.kind === "dateRange") {
          const value = toDateRangeDraftValues(draftValues[filter.key]);
          acc[filter.key] = {
            from: value.from,
            to: value.to,
          };
          return acc;
        }

        if (filter.kind === "numberRange") {
          const value = toNumberRangeDraftValues(draftValues[filter.key]);
          acc[filter.key] = {
            min: value.min,
            max: value.max,
          };
          return acc;
        }

        acc[filter.key] = toOptionDraftValues(draftValues[filter.key]);
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

          {hasFilters ? (
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
          ) : null}

          {hasFilters && activeTags.length ? (
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
                key={`${tag.kind}-${tag.filterKey}-${tag.value}`}
                type="button"
                onClick={() => removeTag(tag)}
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
              >
                <span>{tag.label}</span>
                <span className="text-sm leading-none">×</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {hasFilters ? (
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
            {filters.map((filter) => {
              if (filter.kind === "dateRange") {
                const value = toDateRangeDraftValues(draftValues[filter.key]);
                return (
                  <div key={filter.key}>
                    <p className="mb-2 text-sm font-semibold text-slate-700">{filter.label}</p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <input
                        type="date"
                        value={value.from ?? ""}
                        onChange={(event) => handleDraftDateRangeChange(filter.key, "from", event.target.value)}
                        placeholder={filter.fromPlaceholder ?? "Từ ngày"}
                        className="rounded-[var(--primary-rounded)] border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      />
                      <input
                        type="date"
                        value={value.to ?? ""}
                        onChange={(event) => handleDraftDateRangeChange(filter.key, "to", event.target.value)}
                        placeholder={filter.toPlaceholder ?? "Đến ngày"}
                        className="rounded-[var(--primary-rounded)] border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              }

              if (filter.kind === "numberRange") {
                const value = toNumberRangeDraftValues(draftValues[filter.key]);
                return (
                  <div key={filter.key}>
                    <p className="mb-2 text-sm font-semibold text-slate-700">{filter.label}</p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <input
                        type="number"
                        min={0}
                        value={value.min ?? ""}
                        onChange={(event) => handleDraftNumberRangeChange(filter.key, "min", event.target.value)}
                        placeholder={filter.minPlaceholder ?? "Giá trị tối thiểu"}
                        className="rounded-[var(--primary-rounded)] border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        value={value.max ?? ""}
                        onChange={(event) => handleDraftNumberRangeChange(filter.key, "max", event.target.value)}
                        placeholder={filter.maxPlaceholder ?? "Giá trị tối đa"}
                        className="rounded-[var(--primary-rounded)] border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              }

              const optionFilter = filter as OptionFilterModalGroup;
              const selectedValues = toOptionDraftValues(draftValues[optionFilter.key]);

              return (
                <div key={optionFilter.key}>
                  <p className="mb-2 text-sm font-semibold text-slate-700">{optionFilter.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {optionFilter.options.map((option) => {
                      const isActive = selectedValues.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleToggleDraftOption(optionFilter, option.value)}
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
              );
            })}
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default FilterSearchModalBar;
