import React from "react";
import ActionMenu from "../molecules/ActionMenu";

interface ColumnDefinition {
  key: string;
  header: string;
}

interface DataTableProps {
  columns: ColumnDefinition[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <div className="w-full rounded-lg shadow-md border border-gray-200">
      <div className="w-full overflow-auto max-h-[60vh]">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-black uppercase bg-[#EDF0F3] sticky top-0 z-10">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-gray-700">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-sm">
                  <ActionMenu />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
