import { useMemo, useState } from "react";

interface StockRow {
  id: number;
  batchCode: string;
  productionDate: string;
  weight: string;
  stockQuantity: string;
}

const createEmptyRow = (id: number): StockRow => ({
  id,
  batchCode: "",
  productionDate: "",
  weight: "",
  stockQuantity: "",
});

const StockConfigTable = () => {
  const [rows, setRows] = useState<StockRow[]>([createEmptyRow(1)]);

  const totalQuantity = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.stockQuantity || 0), 0),
    [rows],
  );

  const updateRow = (id: number, key: keyof Omit<StockRow, "id">, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Stock Configuration</h3>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => setRows((prev) => [...prev, createEmptyRow(Date.now())])}
        >
          Add Row
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Batch Code</th>
              <th className="px-3 py-2 text-left">Production Date</th>
              <th className="px-3 py-2 text-left">Weight</th>
              <th className="px-3 py-2 text-left">Stock Quantity</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    value={row.batchCode}
                    onChange={(event) => updateRow(row.id, "batchCode", event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={row.productionDate}
                    onChange={(event) => updateRow(row.id, "productionDate", event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={row.weight}
                    onChange={(event) => updateRow(row.id, "weight", event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.stockQuantity}
                    onChange={(event) => updateRow(row.id, "stockQuantity", event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
                    disabled={rows.length === 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-right text-sm text-slate-600">Total quantity: {totalQuantity}</p>
    </section>
  );
};

export default StockConfigTable;