interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange?: (newPage: number) => void;
}

const Pagination = ({ page, pageSize, total, onChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm">
      <p className="text-slate-500">
        Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} trong {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange?.(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md border border-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trước
        </button>
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onChange?.(pageNumber)}
              className={`h-8 w-8 rounded-md border ${
                pageNumber === page ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-slate-600"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange?.(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-md border border-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
