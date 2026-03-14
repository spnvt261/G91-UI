// usePageSearchParams.ts
import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const usePageSearchParams = (defaultPage = 1, defaultSize = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Params từ URL
  const page = Number(searchParams.get("page")) || defaultPage;
  const pageSize = Number(searchParams.get("size")) || defaultSize;
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  const [searchInput, setSearchInput] = useState<string>(search);
  // Update URL
  const updateParams = useCallback(
    (changes: Record<string, any>) => {
      const newParams = new URLSearchParams(window.location.search);

      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          newParams.delete(key); // Clear param
        } else {
          newParams.set(key, String(value));
        }
      });

      setSearchParams(newParams);
    },
    [setSearchParams]
  );

  // Change page
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    updateParams({
      page: newPage,
      size: newPageSize ?? pageSize,
    });
  };

  // Change search with debounce 1s
  const handleSearchChange = (value: string, isClear?: boolean) => {
    setSearchInput(value);
    const timeout = isClear ? 0 : 1000;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateParams({
        search: value,
        page: 1, // reset page khi search
      });
    }, timeout);
  };

  /** NEW: Change sort */
  const handleSortChange = (
    field?: string,
    order?: "ascend" | "descend" | null
  ) => {
    // Nếu clear sort
    if (!field || !order) {
      updateParams({ sort: undefined, page: 1 });
      return;
    }

    const sortValue = `${field},${order === "ascend" ? "ASC" : "DESC"}`;

    updateParams({
      sort: sortValue,
      page: 1, // reset page khi đổi sort
    });
  };

  return {
    page,
    pageSize,
    search,
    searchInput,
    sort,
    handleSortChange,
    handlePageChange,
    handleSearchChange,
    setQueryParams: updateParams,
  };
};
