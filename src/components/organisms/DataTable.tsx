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
  onEditRow?: (row: Record<string, any>) => void;
  onDeleteRow?: (row: Record<string, any>) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onEditRow,
  onDeleteRow,
}) => {
  return (
    <div className="w-full rounded-lg shadow-md border border-border bg-surface">
      <div className="w-full overflow-auto max-h-[60vh]">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-text-main uppercase bg-background sticky top-0 z-10">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-text-muted hover:bg-background/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-sm">
                  <ActionMenu
                    onEdit={onEditRow ? () => onEditRow(row) : undefined}
                    onDelete={onDeleteRow ? () => onDeleteRow(row) : undefined}
                  />
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
