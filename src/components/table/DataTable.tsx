import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  actions?: (row: T, index: number) => ReactNode;
  emptyText?: string;
}

const DataTable = <T extends object>({ columns, data, actions, emptyText = "Không có dữ liệu" }: DataTableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
              {actions ? <th className="px-4 py-3 font-semibold">Thao tác</th> : null}
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((row, index) => (
                <tr key={`row-${index}`} className="border-t border-gray-100 odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/40">
                  {columns.map((column) => (
                    <td key={`${String(column.key)}-${index}`} className={`px-4 py-3 text-slate-700 ${column.className ?? ""}`}>
                      {column.render
                        ? column.render(row, index)
                        : String((row as Record<string, unknown>)[column.key as string] ?? "")}
                    </td>
                  ))}
                  {actions ? <td className="px-4 py-3">{actions(row, index)}</td> : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
